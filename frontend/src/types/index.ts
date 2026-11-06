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
  path?: string;
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
  updatedAt?: string;
  downloadUrl?: string;
}

export interface CategoryStat {
  count: number;
  totalSize: number;
}

export interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  storageConsumed: number;
  storageQuota: number;
  availableQuota: number;
  storageUsagePercent: number;
  categories: {
    images: CategoryStat;
    documents: CategoryStat;
    media: CategoryStat;
    archives: CategoryStat;
    others: CategoryStat;
  };
  recentUploads: Array<{
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
    folderId: string | null;
  }>;
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
