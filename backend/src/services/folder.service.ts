import { Types } from 'mongoose';
import { Folder, IFolderDocument } from '../models/Folder.model.js';
import { File } from '../models/File.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { CreateFolderInput } from '../validators/folder.validator.js';

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export class FolderService {
  /**
   * Create a new folder
   */
  static async createFolder(userId: string, input: CreateFolderInput) {
    const userObjectId = new Types.ObjectId(userId);
    let parentObjectId: Types.ObjectId | null = null;

    if (input.parentFolderId) {
      if (!Types.ObjectId.isValid(input.parentFolderId)) {
        throw ApiError.badRequest('Invalid parent folder ID format');
      }
      parentObjectId = new Types.ObjectId(input.parentFolderId);

      const parentFolder = await Folder.findOne({
        _id: parentObjectId,
        ownerId: userObjectId,
      });

      if (!parentFolder) {
        throw ApiError.notFound('Parent folder does not exist');
      }
    }

    // Check for naming collision in the same directory level
    const existing = await Folder.findOne({
      ownerId: userObjectId,
      parentFolderId: parentObjectId,
      name: input.name,
    });

    if (existing) {
      throw ApiError.conflict(`A folder named "${input.name}" already exists in this directory`);
    }

    const folder = await Folder.create({
      ownerId: userObjectId,
      name: input.name,
      parentFolderId: parentObjectId,
    });

    return folder.toJSON();
  }

  /**
   * List folders inside a given parent directory (or root if null)
   */
  static async getFolders(userId: string, parentFolderId?: string | null, search?: string) {
    const userObjectId = new Types.ObjectId(userId);
    const filter: Record<string, unknown> = { ownerId: userObjectId };

    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' };
    } else {
      if (parentFolderId && Types.ObjectId.isValid(parentFolderId)) {
        filter.parentFolderId = new Types.ObjectId(parentFolderId);
      } else {
        filter.parentFolderId = null;
      }
    }

    const folders = await Folder.find(filter).sort({ name: 1 });

    // Calculate item count (files + subfolders) for each folder
    const folderIds = folders.map((f) => f._id);

    const [fileCounts, subfolderCounts] = await Promise.all([
      File.aggregate([
        { $match: { ownerId: userObjectId, folderId: { $in: folderIds } } },
        { $group: { _id: '$folderId', count: { $sum: 1 } } },
      ]),
      Folder.aggregate([
        { $match: { ownerId: userObjectId, parentFolderId: { $in: folderIds } } },
        { $group: { _id: '$parentFolderId', count: { $sum: 1 } } },
      ]),
    ]);

    const fileCountMap = new Map(fileCounts.map((i) => [i._id.toString(), i.count]));
    const folderCountMap = new Map(subfolderCounts.map((i) => [i._id.toString(), i.count]));

    return folders.map((folder) => {
      const id = folder._id.toString();
      const filesInside = fileCountMap.get(id) || 0;
      const foldersInside = folderCountMap.get(id) || 0;

      return {
        id,
        name: folder.name,
        parentFolderId: folder.parentFolderId ? folder.parentFolderId.toString() : null,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        itemCount: filesInside + foldersInside,
      };
    });
  }

  /**
   * Get folder details along with its upward breadcrumbs path
   */
  static async getFolderById(userId: string, folderId: string) {
    if (!Types.ObjectId.isValid(folderId)) {
      throw ApiError.badRequest('Invalid folder ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const folder = await Folder.findOne({ _id: folderId, ownerId: userObjectId });

    if (!folder) {
      throw ApiError.notFound('Folder not found');
    }

    const breadcrumbs = await this.getBreadcrumbs(userId, folder);

    return {
      folder: {
        id: folder._id.toString(),
        name: folder.name,
        parentFolderId: folder.parentFolderId ? folder.parentFolderId.toString() : null,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
      breadcrumbs,
    };
  }

  /**
   * Helper to compute breadcrumb navigation path from root
   */
  static async getBreadcrumbs(userId: string, currentFolder: IFolderDocument): Promise<BreadcrumbItem[]> {
    const breadcrumbs: BreadcrumbItem[] = [
      { id: currentFolder._id.toString(), name: currentFolder.name },
    ];

    let current = currentFolder;
    const visited = new Set<string>([current._id.toString()]);

    while (current.parentFolderId) {
      const parentIdStr = current.parentFolderId.toString();
      if (visited.has(parentIdStr)) break; // cycle protection
      visited.add(parentIdStr);

      const parent = await Folder.findOne({ _id: current.parentFolderId, ownerId: userId });
      if (!parent) break;

      breadcrumbs.unshift({ id: parent._id.toString(), name: parent.name });
      current = parent;
    }

    return breadcrumbs;
  }

  /**
   * Rename a folder
   */
  static async renameFolder(userId: string, folderId: string, newName: string) {
    if (!Types.ObjectId.isValid(folderId)) {
      throw ApiError.badRequest('Invalid folder ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const folder = await Folder.findOne({ _id: folderId, ownerId: userObjectId });

    if (!folder) {
      throw ApiError.notFound('Folder not found');
    }

    // Check collision in the same parent directory
    const existing = await Folder.findOne({
      ownerId: userObjectId,
      parentFolderId: folder.parentFolderId,
      name: newName,
      _id: { $ne: folder._id },
    });

    if (existing) {
      throw ApiError.conflict(`A folder named "${newName}" already exists in this location`);
    }

    folder.name = newName;
    await folder.save();

    return folder.toJSON();
  }

  /**
   * Recursively delete a folder and all child folders and files
   */
  static async deleteFolder(userId: string, folderId: string) {
    if (!Types.ObjectId.isValid(folderId)) {
      throw ApiError.badRequest('Invalid folder ID');
    }

    const userObjectId = new Types.ObjectId(userId);
    const rootFolder = await Folder.findOne({ _id: folderId, ownerId: userObjectId });

    if (!rootFolder) {
      throw ApiError.notFound('Folder not found');
    }

    // Collect all descendant folder IDs recursively
    const allFolderIds: Types.ObjectId[] = [rootFolder._id];
    let queue: Types.ObjectId[] = [rootFolder._id];

    while (queue.length > 0) {
      const currentParentIds = queue;
      const children = await Folder.find({
        ownerId: userObjectId,
        parentFolderId: { $in: currentParentIds },
      }).select('_id');

      queue = children.map((c) => c._id);
      allFolderIds.push(...queue);
    }

    // Find all files in these folders to calculate released storage and S3 keys
    const filesToDelete = await File.find({
      ownerId: userObjectId,
      folderId: { $in: allFolderIds },
    }).select('_id size s3Key');

    const totalReleasedBytes = filesToDelete.reduce((sum, f) => sum + f.size, 0);

    // Delete files from MongoDB
    await File.deleteMany({ _id: { $in: filesToDelete.map((f) => f._id) } });

    // Delete all descendant folders
    await Folder.deleteMany({ _id: { $in: allFolderIds } });

    // Decrement user storageUsed
    if (totalReleasedBytes > 0) {
      await User.findByIdAndUpdate(userObjectId, {
        $inc: { storageUsed: -totalReleasedBytes },
      });
    }

    return {
      deletedFolderCount: allFolderIds.length,
      deletedFileCount: filesToDelete.length,
      releasedBytes: totalReleasedBytes,
    };
  }
}
