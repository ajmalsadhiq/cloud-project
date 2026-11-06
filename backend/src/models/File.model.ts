import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IFileDocument extends Document {
  ownerId: Types.ObjectId;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  s3Key: string;
  folderId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFileDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'File owner is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    originalName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      lowercase: true,
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [0, 'File size must be positive'],
    },
    s3Key: {
      type: String,
      required: [true, 'S3 object key is required'],
      unique: true,
      index: true,
      trim: true,
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id ? ret._id.toString() : '';
        if (ret.folderId) {
          ret.folderId = ret.folderId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// High performance compound indexes
fileSchema.index({ ownerId: 1, folderId: 1 });
fileSchema.index({ ownerId: 1, name: 1 });
fileSchema.index({ ownerId: 1, createdAt: -1 });
fileSchema.index({ ownerId: 1, mimeType: 1 });

export const File: Model<IFileDocument> = mongoose.model<IFileDocument>('File', fileSchema);
