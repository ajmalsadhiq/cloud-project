import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(120, 'Folder name cannot exceed 120 characters')
    .regex(/^[^\\/:*?"<>|]+$/, 'Folder name contains illegal characters: \\ / : * ? " < > |')
    .trim(),
  parentFolderId: z.string().nullable().optional(),
});

export const renameFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(120, 'Folder name cannot exceed 120 characters')
    .regex(/^[^\\/:*?"<>|]+$/, 'Folder name contains illegal characters: \\ / : * ? " < > |')
    .trim(),
});

export const moveFolderSchema = z.object({
  targetParentFolderId: z.string().nullable(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
