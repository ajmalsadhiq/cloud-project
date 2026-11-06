import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IFolderDocument extends Document {
  ownerId: Types.ObjectId;
  name: string;
  parentFolderId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolderDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      minlength: [1, 'Folder name cannot be empty'],
      maxlength: [120, 'Folder name cannot exceed 120 characters'],
      validate: {
        validator: function (v: string) {
          // Disallow reserved filesystem / path traversal characters
          return !/[\/\\:\*\?"<>\|]/.test(v);
        },
        message: 'Folder name contains invalid characters: / \\ : * ? " < > |',
      },
    },
    parentFolderId: {
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
        if (ret.parentFolderId) {
          ret.parentFolderId = ret.parentFolderId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for fast folder listings and hierarchy queries
folderSchema.index({ ownerId: 1, parentFolderId: 1, name: 1 }, { unique: true });
folderSchema.index({ ownerId: 1, createdAt: -1 });

export const Folder: Model<IFolderDocument> = mongoose.model<IFolderDocument>('Folder', folderSchema);
