import { Request, Response, NextFunction } from 'express';
import { FolderService } from '../services/folder.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class FolderController {
  static async createFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folder = await FolderService.createFolder(req.user!.userId, req.body);
      sendSuccess(res, folder, 'Folder created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getFolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parentFolderId = (req.query.parentFolderId as string) || null;
      const search = (req.query.search as string) || undefined;
      const folders = await FolderService.getFolders(req.user!.userId, parentFolderId, search);
      sendSuccess(res, folders, 'Folders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFolderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await FolderService.getFolderById(req.user!.userId, req.params.id);
      sendSuccess(res, data, 'Folder details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async renameFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const folder = await FolderService.renameFolder(
        req.user!.userId,
        req.params.id,
        req.body.name
      );
      sendSuccess(res, folder, 'Folder renamed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await FolderService.deleteFolder(req.user!.userId, req.params.id);
      sendSuccess(res, result, 'Folder and its contents deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
