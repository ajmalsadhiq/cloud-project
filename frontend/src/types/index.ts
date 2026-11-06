export interface User {
  id: string;
  name: string;
  email: string;
  storageQuota: number;
  storageUsed: number;
  createdAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  path: string;
  createdAt: string;
  itemCount?: number;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  downloadUrl?: string;
}

export interface DashboardStats {
  totalFiles: number;
  storageConsumed: number;
  storageQuota: number;
  availableQuota: number;
  storageUsagePercent: number;
  fileTypeDistribution: {
    images: { count: number; size: number };
    documents: { count: number; size: number };
    media: { count: number; size: number };
    archives: { count: number; size: number };
    others: { count: number; size: number };
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}
