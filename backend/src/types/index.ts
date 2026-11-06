export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  storageQuota: number;
  storageUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFolder {
  _id: string;
  ownerId: string;
  name: string;
  parentFolderId: string | null;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile {
  _id: string;
  ownerId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}
