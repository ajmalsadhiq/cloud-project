import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Folder } from '../models/Folder.model.js';
import { File } from '../models/File.model.js';
import { AuthService } from '../services/auth.service.js';
import { FolderService } from '../services/folder.service.js';
import { FileService } from '../services/file.service.js';
import { DashboardService } from '../services/dashboard.service.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

async function runE2ETests() {
  console.log('\n========================================================');
  console.log('   🧪 CloudVault Automated End-to-End Local Test Suite');
  console.log('========================================================\n');

  try {
    await connectDatabase();
    assert(mongoose.connection.readyState === 1, 'MongoDB database connection established');

    const testEmail = `test.runner.${Date.now()}@cloudvault.internal`;
    const testPassword = 'Password123!';

    // --- TEST SUITE 1: AUTHENTICATION & USER MANAGEMENT ---
    console.log('\n--- Test Suite 1: Authentication & User Lifecycle ---');

    // 1. User Registration
    const regRes = await AuthService.register({
      name: 'E2E Test User',
      email: testEmail,
      password: testPassword,
    });
    assert(!!regRes.token, 'AuthService.register generates valid JWT');
    assert(regRes.user.email === testEmail, 'AuthService.register records correct email');
    assert(regRes.user.storageQuota === config.defaultStorageQuota, 'Default storage quota set (1 GB)');
    assert(regRes.user.storageUsed === 0, 'Initial storage used is 0');

    // 2. Duplicate Registration Rejection
    let duplicateRejected = false;
    try {
      await AuthService.register({
        name: 'Duplicate User',
        email: testEmail,
        password: testPassword,
      });
    } catch (err: any) {
      duplicateRejected = err.statusCode === 409;
    }
    assert(duplicateRejected, 'Duplicate registration correctly rejected with 409 Conflict');

    // 3. User Login
    const loginRes = await AuthService.login({
      email: testEmail,
      password: testPassword,
    });
    assert(!!loginRes.token, 'AuthService.login returns token for valid credentials');

    // 4. Invalid Password Rejection
    let invalidPassRejected = false;
    try {
      await AuthService.login({
        email: testEmail,
        password: 'WrongPassword!',
      });
    } catch (err: any) {
      invalidPassRejected = err.statusCode === 401;
    }
    assert(invalidPassRejected, 'Invalid login credentials rejected with 401 Unauthorized');

    const userId = regRes.user.id;

    // --- TEST SUITE 2: FOLDER MANAGEMENT & HIERARCHY ---
    console.log('\n--- Test Suite 2: Folder Management & Virtual Hierarchy ---');

    // 5. Create Root Folder
    const rootFolder = await FolderService.createFolder(userId, {
      name: 'Work Documents',
    });
    assert(rootFolder.name === 'Work Documents', 'FolderService creates root folder');
    assert(rootFolder.parentFolderId === null, 'Root folder has null parentFolderId');

    // 6. Prevent Duplicate Folder Name in Same Parent
    let duplicateFolderRejected = false;
    try {
      await FolderService.createFolder(userId, {
        name: 'Work Documents',
      });
    } catch (err: any) {
      duplicateFolderRejected = err.statusCode === 409;
    }
    assert(duplicateFolderRejected, 'Duplicate folder name in same directory rejected with 409');

    // 7. Create Nested Subfolder
    const subFolder = await FolderService.createFolder(userId, {
      name: 'Financial Reports',
      parentFolderId: rootFolder.id,
    });
    assert(subFolder.parentFolderId === rootFolder.id, 'Subfolder references parent correctly');

    // 8. Breadcrumbs Path Calculation
    const folderDetails = await FolderService.getFolderById(userId, subFolder.id);
    const breadcrumbTrail = folderDetails.breadcrumbs.map((b) => b.name).join(' > ');
    assert(
      breadcrumbTrail === 'Work Documents > Financial Reports',
      'Breadcrumbs calculation matches hierarchy',
      `Got: ${breadcrumbTrail}`
    );

    // 9. Rename Folder
    const renamed = await FolderService.renameFolder(userId, subFolder.id, 'Q4 Financials');
    assert(renamed.name === 'Q4 Financials', 'FolderService.renameFolder updates name successfully');

    // --- TEST SUITE 3: FILE MANAGEMENT & QUOTA ENFORCEMENT ---
    console.log('\n--- Test Suite 3: File Management, S3 Signing & Quotas ---');

    // 10. Presigned Upload URL Generation
    const fileSize1 = 5 * 1024 * 1024; // 5 MB
    const uploadUrlResult = await FileService.requestUploadUrl(userId, {
      originalName: 'q4_report.pdf',
      mimeType: 'application/pdf',
      size: fileSize1,
      folderId: subFolder.id,
    });
    assert(!!uploadUrlResult.uploadUrl, 'Presigned upload URL generated');
    assert(uploadUrlResult.s3Key.includes(userId), 'S3 key incorporates owner ID namespace');

    // 11. Storage Quota Exceeded Prevention
    let quotaExceededRejected = false;
    try {
      await FileService.requestUploadUrl(userId, {
        originalName: 'massive_archive.zip',
        mimeType: 'application/zip',
        size: 2 * 1024 * 1024 * 1024, // 2 GB (exceeds 1 GB quota)
        folderId: subFolder.id,
      });
    } catch (err: any) {
      quotaExceededRejected = err.statusCode === 400 && err.message.includes('quota');
    }
    assert(quotaExceededRejected, 'Uploads exceeding storage quota correctly rejected with 400 Bad Request');

    // 12. Confirm File Upload & Storage Tracking
    const confirmedFile = await FileService.confirmUpload(userId, {
      name: 'q4_report.pdf',
      originalName: 'q4_report.pdf',
      mimeType: 'application/pdf',
      size: fileSize1,
      s3Key: uploadUrlResult.s3Key,
      folderId: subFolder.id,
    });
    assert(confirmedFile.name === 'q4_report.pdf', 'FileService.confirmUpload creates MongoDB record');

    // 13. Verify User Storage Consumed Updated
    const updatedUser = await User.findById(userId);
    assert(updatedUser?.storageUsed === fileSize1, 'User storageUsed incremented by file size (5 MB)');

    // 14. Presigned Download URL Generation
    const downloadRes = await FileService.getDownloadUrl(userId, confirmedFile.id);
    assert(!!downloadRes.downloadUrl, 'Presigned download URL generated with expiration');

    // 15. Move File to Root Directory
    const movedFile = await FileService.moveFile(userId, confirmedFile.id, {
      targetFolderId: null,
    });
    assert(movedFile.folderId === null, 'File moved to root directory');

    // --- TEST SUITE 4: DASHBOARD METRICS AGGREGATION ---
    console.log('\n--- Test Suite 4: Dashboard Aggregation Engine ---');

    // 16. Dashboard Stats Telemetry
    const stats = await DashboardService.getStats(userId);
    assert(stats.totalFiles === 1, 'Dashboard stats reports totalFiles: 1');
    assert(stats.totalFolders === 2, 'Dashboard stats reports totalFolders: 2');
    assert(stats.storageConsumed === fileSize1, 'Dashboard stats reports accurate storageConsumed (5 MB)');
    assert(stats.categories.documents.count === 1, 'Documents category count incremented');
    assert(stats.recentUploads.length === 1, 'Recent uploads activity contains uploaded file');

    // --- TEST SUITE 5: CLEANUP & RECURSIVE DELETIONS ---
    console.log('\n--- Test Suite 5: Deletions & Quota Reversal ---');

    // 17. Delete Single File
    const deleteFileRes = await FileService.deleteFile(userId, confirmedFile.id);
    assert(deleteFileRes.freedBytes === fileSize1, 'FileService.deleteFile frees file bytes');

    const userAfterFileDelete = await User.findById(userId);
    assert(userAfterFileDelete?.storageUsed === 0, 'User storageUsed decremented to 0 after file deletion');

    // 18. Recursive Folder Deletion
    const deleteFolderRes = await FolderService.deleteFolder(userId, rootFolder.id);
    assert(deleteFolderRes.deletedFolderCount === 2, 'Recursive folder deletion deleted parent and child folders');

    // Clean up test user
    await User.findByIdAndDelete(userId);
    console.log('\n  🧹 Test user and residual database records cleaned up successfully.');

    // --- SUMMARY ---
    console.log('\n========================================================');
    console.log(`   🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error running E2E tests:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runE2ETests();
