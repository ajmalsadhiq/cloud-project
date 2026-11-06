import { z } from 'zod';

export const uploadUrlSchema = z.object({
  originalName: z.string().min(1, 'File name is required').max(255),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().positive('File size must be greater than 0 bytes').max(104857600, 'Maximum file size is 100 MB'),
  folderId: z.string().nullable().optional(),
});

export const confirmUploadSchema = z.object({
  name: z.string().min(1, 'File name is required').max(255),
  originalName: z.string().min(1, 'Original file name is required').max(255),
  mimeType: z.string().min(1, 'MIME type is required'),
  size: z.number().int().positive('File size must be positive'),
  s3Key: z.string().min(3, 'Valid S3 key is required'),
  folderId: z.string().nullable().optional(),
});

export const moveFileSchema = z.object({
  targetFolderId: z.string().nullable(),
});

export const renameFileSchema = z.object({
  name: z.string().min(1, 'File name cannot be empty').max(255),
});

export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type ConfirmUploadInput = z.infer<typeof confirmUploadSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;
