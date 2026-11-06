import { Types } from 'mongoose';
import crypto from 'crypto';
import { File } from '../models/File.model.js';
import { Folder } from '../models/Folder.model.js';
import { User } from '../models/User.model.js';
import { S3Service } from './s3.service.js';
import { ApiError } from '../utils/apiResponse.js';
import {
  UploadUrlInput,
  ConfirmUploadInput,
  MoveFileInput,
  RenameFileInput,
} from '../validators/file.validator.js';

export interface FileQueryOptions {
  folderId?: string | null;
  search?: string;
  type?: 'all' | 'images' | 'documents' | 'media' | 'archives' | 'others';
  sortBy?: 'name' | 'size' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class FileService {
  /**
   * List files matching folder, search, filter and sort criteria
   */
  static async getFiles(userId: string, options: FileQueryOptions) {
    const userObjectId = new Types.ObjectId(userId);
    const filter: Record<string, unknown> = { ownerId: userObjectId };

    // Folder filtering
    if (options.folderId !== undefined) {
      if (options.folderId && Types.ObjectId.isValid(options.folderId)) {
        filter.folderId = new Types.ObjectId(options.folderId);
      } else {
        filter.folderId = null; // Root level
      }
    }

    // Search query
    if (options.search && options.search.trim()) {
      filter.$or = [
        { name: { $regex: options.search.trim(), $options: 'i' } },
        { originalName: { $regex: options.search.trim(), $options: 'i' } },
      ];
    }

    // Category / MIME filter
    if (options.type && options.type !== 'all') {
      switch (options.type) {
        case 'images':
          filter.mimeType = { $regex: /^image\//i };
          break;
        case 'documents':
          filter.$or = [
            { mimeType: { $regex: /pdf|word|document|sheet|presentation|text/i } },
            { originalName: { $regex: /\.(pdf|docx|doc|xlsx|xls|pptx|txt|csv|md)$/i } },
          ];
          break;
        case 'media':
          filter.mimeType = { $regex: /^(video|audio)\//i };
          break;
        case 'archives':
          filter.$or = [
            { mimeType: { $regex: /zip|tar|gzip|compressed|7z|rar/i } },
            { originalName: { $regex: /\.(zip|tar|gz|7z|rar)$/i } },
          ];
          break;
        case 'others':
          filter.mimeType = {
            $not: { $regex: /^(image|video|audio)|pdf|word|sheet|zip|tar/i },
          };
          break;
      }
    }

    // Sorting
    const sortField = options.sortBy || 'createdAt';
    const sortDirection = options.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const files = await File.find(filter).sort(sort);

    return files.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      originalName: f.originalName,
      mimeType: f.mimeType,
      size: f.size,
      s3Key: f.s3Key,
      folderId: f.folderId ? f.folderId.toString() : null,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }

  /**
   * Request presigned direct upload URL after verifying quota
   */
  static async requestUploadUrl(userId: string, input: UploadUrlInput) {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Validate available storage quota
    if (user.storageUsed + input.size > user.storageQuota) {
      const remaining = Math.max(0, user.storageQuota - user.storageUsed);
      throw ApiError.badRequest(
        `Upload exceeds storage quota. File size: ${Math.round(input.size / (1024 * 1024))} MB, Available: ${Math.round(remaining / (1024 * 1024))} MB`
      );
    }

    // Verify parent folder if provided
    let folderPrefix = 'root';
    if (input.folderId) {
      if (!Types.ObjectId.isValid(input.folderId)) {
        throw ApiError.badRequest('Invalid target folder ID');
      }
      const folder = await Folder.findOne({ _id: input.folderId, ownerId: userObjectId });
      if (!folder) {
        throw ApiError.notFound('Target folder does not exist');
      }
      folderPrefix = folder._id.toString();
    }

    // Create unique, collision-free S3 key: {userId}/{folderId}/{uuid}-{sanitizedFilename}
    const sanitizedFilename = input.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueId = crypto.randomUUID();
    const s3Key = `users/${userId}/${folderPrefix}/${uniqueId}-${sanitizedFilename}`;

    // Generate S3 presigned PUT URL
    const uploadUrl = await S3Service.generatePresignedUploadUrl(s3Key, input.mimeType);

    return {
      uploadUrl,
      s3Key,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      folderId: input.folderId || null,
    };
  }

  /**
   * Confirm successful upload and register metadata in MongoDB
   */
  static async confirmUpload(userId: string, input: ConfirmUploadInput) {
    const userObjectId = new Types.ObjectId(userId);
    const user = await User.findById(userObjectId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Enforce quota check again
    if (user.storageUsed + input.size > user.storageQuota) {
      throw ApiError.badRequest('Upload exceeds available storage quota');
    }

    let folderObjectId: Types.ObjectId | null = null;
    if (input.folderId) {
      if (!Types.ObjectId.isValid(input.folderId)) {
        throw ApiError.badRequest('Invalid folder ID');
      }
      folderObjectId = new Types.ObjectId(input.folderId);
    }

    // Prevent duplicate S3 key registration
    const existingFile = await File.findOne({ s3Key: input.s3Key });
    if (existingFile) {
      return existingFile.toJSON();
    }

    // Create file record
    const newFile = await File.create({
      ownerId: userObjectId,
      name: input.name,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      s3Key: input.s3Key,
      folderId: folderObjectId,
    });

    // Increment user's storageUsed in database
    user.storageUsed += input.size;
    await user.save();

    return newFile.toJSON();
  }

  /**
   * Get single file metadata with ownership validation
   */
  static async getFileById(userId: string, fileId: string) {
    if (!Types.ObjectId.isValid(fileId)) {
      throw ApiError.badRequest('Invalid file ID');
    }

    const file = await File.findOne({
      _id: fileId,
      ownerId: new Types.ObjectId(userId),
    });

    if (!file) {
      throw ApiError.notFound('File not found');
    }

    return file.toJSON();
  }

  /**
   * Get temporary presigned download or preview URL
   */
  static async getDownloadUrl(userId: string, fileId: string) {
    const file = await this.getFileById(userId, fileId);
    const downloadUrl = await S3Service.generatePresignedDownloadUrl(file.s3Key, file.originalName);

    return {
      downloadUrl,
      file,
      expiresIn: 900, // 15 mins
    };
  }

  /**
   * Rename a file
   */
  static async renameFile(userId: string, fileId: string, input: RenameFileInput) {
    if (!Types.ObjectId.isValid(fileId)) {
      throw ApiError.badRequest('Invalid file ID');
    }

    const file = await File.findOne({
      _id: fileId,
      ownerId: new Types.ObjectId(userId),
    });

    if (!file) {
      throw ApiError.notFound('File not found');
    }

    file.name = input.name;
    await file.save();

    return file.toJSON();
  }

  /**
   * Move file to another folder
   */
  static async moveFile(userId: string, fileId: string, input: MoveFileInput) {
    if (!Types.ObjectId.isValid(fileId)) {
      throw ApiError.badRequest('Invalid file ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const file = await File.findOne({ _id: fileId, ownerId: userObjectId });

    if (!file) {
      throw ApiError.notFound('File not found');
    }

    let targetFolderObjectId: Types.ObjectId | null = null;
    if (input.targetFolderId) {
      if (!Types.ObjectId.isValid(input.targetFolderId)) {
        throw ApiError.badRequest('Invalid target folder ID');
      }
      targetFolderObjectId = new Types.ObjectId(input.targetFolderId);
      const targetFolder = await Folder.findOne({ _id: targetFolderObjectId, ownerId: userObjectId });
      if (!targetFolder) {
        throw ApiError.notFound('Target folder not found');
      }
    }

    file.folderId = targetFolderObjectId;
    await file.save();

    return file.toJSON();
  }

  /**
   * Delete file from AWS S3 and MongoDB, decrements user quota
   */
  static async deleteFile(userId: string, fileId: string) {
    if (!Types.ObjectId.isValid(fileId)) {
      throw ApiError.badRequest('Invalid file ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const file = await File.findOne({ _id: fileId, ownerId: userObjectId });

    if (!file) {
      throw ApiError.notFound('File not found');
    }

    // Delete object from S3
    await S3Service.deleteObject(file.s3Key);

    // Delete document from MongoDB
    await File.deleteOne({ _id: file._id });

    // Decrement user storageUsed
    await User.findByIdAndUpdate(userObjectId, {
      $inc: { storageUsed: -file.size },
    });

    return {
      id: file._id.toString(),
      name: file.name,
      freedBytes: file.size,
    };
  }
}
