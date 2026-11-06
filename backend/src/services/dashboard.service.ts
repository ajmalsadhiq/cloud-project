import { Types } from 'mongoose';
import { File } from '../models/File.model.js';
import { Folder } from '../models/Folder.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/apiResponse.js';

export interface CategoryStat {
  count: number;
  totalSize: number;
}

export interface DashboardStatsResult {
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
    createdAt: Date;
    folderId: string | null;
  }>;
}

export class DashboardService {
  static async getStats(userId: string): Promise<DashboardStatsResult> {
    const userObjectId = new Types.ObjectId(userId);

    // Fetch user details for quota
    const user = await User.findById(userObjectId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Run parallel queries for dashboard performance
    const [fileCount, folderCount, recentFiles, categoryAggregation] = await Promise.all([
      File.countDocuments({ ownerId: userObjectId }),
      Folder.countDocuments({ ownerId: userObjectId }),
      File.find({ ownerId: userObjectId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name originalName mimeType size createdAt folderId'),
      File.aggregate([
        { $match: { ownerId: userObjectId } },
        {
          $group: {
            _id: null,
            totalBytes: { $sum: '$size' },
            imagesCount: {
              $sum: {
                $cond: [{ $regexMatch: { input: '$mimeType', regex: /^image\//i } }, 1, 0],
              },
            },
            imagesSize: {
              $sum: {
                $cond: [{ $regexMatch: { input: '$mimeType', regex: /^image\//i } }, '$size', 0],
              },
            },
            docsCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: '$mimeType', regex: /pdf|word|document|sheet|presentation|text/i } },
                      { $regexMatch: { input: '$originalName', regex: /\.(pdf|docx|doc|xlsx|xls|pptx|txt|csv|md)$/i } },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            docsSize: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: '$mimeType', regex: /pdf|word|document|sheet|presentation|text/i } },
                      { $regexMatch: { input: '$originalName', regex: /\.(pdf|docx|doc|xlsx|xls|pptx|txt|csv|md)$/i } },
                    ],
                  },
                  '$size',
                  0,
                ],
              },
            },
            mediaCount: {
              $sum: {
                $cond: [{ $regexMatch: { input: '$mimeType', regex: /^(video|audio)\//i } }, 1, 0],
              },
            },
            mediaSize: {
              $sum: {
                $cond: [{ $regexMatch: { input: '$mimeType', regex: /^(video|audio)\//i } }, '$size', 0],
              },
            },
            archivesCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: '$mimeType', regex: /zip|tar|gzip|compressed|7z|rar/i } },
                      { $regexMatch: { input: '$originalName', regex: /\.(zip|tar|gz|7z|rar)$/i } },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            archivesSize: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $regexMatch: { input: '$mimeType', regex: /zip|tar|gzip|compressed|7z|rar/i } },
                      { $regexMatch: { input: '$originalName', regex: /\.(zip|tar|gz|7z|rar)$/i } },
                    ],
                  },
                  '$size',
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const agg = categoryAggregation[0] || {
      totalBytes: 0,
      imagesCount: 0,
      imagesSize: 0,
      docsCount: 0,
      docsSize: 0,
      mediaCount: 0,
      mediaSize: 0,
      archivesCount: 0,
      archivesSize: 0,
    };

    const storageConsumed = agg.totalBytes || 0;
    const storageQuota = user.storageQuota || 1073741824; // 1 GB fallback
    const availableQuota = Math.max(0, storageQuota - storageConsumed);
    const storageUsagePercent = Math.min(100, Math.round((storageConsumed / storageQuota) * 100 * 10) / 10);

    // Calculate "Others" category
    const categorizedCount = agg.imagesCount + agg.docsCount + agg.mediaCount + agg.archivesCount;
    const categorizedSize = agg.imagesSize + agg.docsSize + agg.mediaSize + agg.archivesSize;
    const othersCount = Math.max(0, fileCount - categorizedCount);
    const othersSize = Math.max(0, storageConsumed - categorizedSize);

    // Sync storageUsed in user record if slight discrepancy exists
    if (user.storageUsed !== storageConsumed) {
      user.storageUsed = storageConsumed;
      await user.save().catch(() => {});
    }

    return {
      totalFiles: fileCount,
      totalFolders: folderCount,
      storageConsumed,
      storageQuota,
      availableQuota,
      storageUsagePercent,
      categories: {
        images: { count: agg.imagesCount, totalSize: agg.imagesSize },
        documents: { count: agg.docsCount, totalSize: agg.docsSize },
        media: { count: agg.mediaCount, totalSize: agg.mediaSize },
        archives: { count: agg.archivesCount, totalSize: agg.archivesSize },
        others: { count: othersCount, totalSize: othersSize },
      },
      recentUploads: recentFiles.map((f) => ({
        id: f._id.toString(),
        name: f.name,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        createdAt: f.createdAt,
        folderId: f.folderId ? f.folderId.toString() : null,
      })),
    };
  }
}
