import { Request, Response, NextFunction } from 'express';
import { FileService, FileQueryOptions } from '../services/file.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class FileController {
  static async getFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const options: FileQueryOptions = {
        folderId: req.query.folderId !== undefined ? (req.query.folderId as string) || null : undefined,
        search: (req.query.search as string) || undefined,
        type: (req.query.type as FileQueryOptions['type']) || 'all',
        sortBy: (req.query.sortBy as FileQueryOptions['sortBy']) || 'createdAt',
        sortOrder: (req.query.sortOrder as FileQueryOptions['sortOrder']) || 'desc',
      };

      const files = await FileService.getFiles(req.user!.userId, options);
      sendSuccess(res, files, 'Files retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async requestUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FileService.requestUploadUrl(req.user!.userId, req.body);
      sendSuccess(res, result, 'Presigned upload URL generated successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await FileService.confirmUpload(req.user!.userId, req.body);
      sendSuccess(res, file, 'File registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFileById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await FileService.getFileById(req.user!.userId, req.params.id);
      sendSuccess(res, file, 'File details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await FileService.getDownloadUrl(req.user!.userId, req.params.id);
      sendSuccess(res, data, 'Presigned download URL generated');
    } catch (error) {
      next(error);
    }
  }

  static async renameFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await FileService.renameFile(req.user!.userId, req.params.id, req.body);
      sendSuccess(res, file, 'File renamed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async moveFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = await FileService.moveFile(req.user!.userId, req.params.id, req.body);
      sendSuccess(res, file, 'File moved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FileService.deleteFile(req.user!.userId, req.params.id);
      sendSuccess(res, result, 'File deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
