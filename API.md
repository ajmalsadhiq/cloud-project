# CloudVault REST API Specification

Comprehensive documentation for the CloudVault Cloud File Storage Platform REST API.

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Rate Limit**: 30 requests / 15 minutes
- **Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "64f1...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "storageQuota": 1073741824,
        "storageUsed": 0,
        "createdAt": "2026-11-06T..."
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 1.2 Login User
- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Rate Limit**: 30 requests / 15 minutes
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Authentication successful",
    "data": {
      "user": {
        "id": "64f1...",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "storageQuota": 1073741824,
        "storageUsed": 0
      },
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### 1.3 Get Current Profile
- **Method**: `GET`
- **Path**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64f1...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "storageQuota": 1073741824,
      "storageUsed": 2048576
    }
  }
  ```

---

## 2. Dashboard Endpoints

### 2.1 Get Dashboard Telemetry & Quota Stats
- **Method**: `GET`
- **Path**: `/api/dashboard/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalFiles": 12,
      "totalFolders": 3,
      "storageConsumed": 15728640,
      "storageQuota": 1073741824,
      "availableQuota": 1058013184,
      "storageUsagePercent": 1.5,
      "categories": {
        "images": { "count": 4, "totalSize": 8388608 },
        "documents": { "count": 6, "totalSize": 5242880 },
        "media": { "count": 1, "totalSize": 2097152 },
        "archives": { "count": 1, "totalSize": 0 },
        "others": { "count": 0, "totalSize": 0 }
      },
      "recentUploads": [
        {
          "id": "64f2...",
          "name": "invoice_october.pdf",
          "originalName": "invoice_october.pdf",
          "mimeType": "application/pdf",
          "size": 1048576,
          "createdAt": "2026-11-06T..."
        }
      ]
    }
  }
  ```

---

## 3. Folder Management Endpoints

### 3.1 Create Folder
- **Method**: `POST`
- **Path**: `/api/folders`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Financial Reports",
    "parentFolderId": null
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64f3...",
      "name": "Financial Reports",
      "parentFolderId": null,
      "createdAt": "2026-11-06T..."
    }
  }
  ```

### 3.2 List Folders
- **Method**: `GET`
- **Path**: `/api/folders?parentFolderId=<id>&search=<query>`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "64f3...",
        "name": "Financial Reports",
        "parentFolderId": null,
        "itemCount": 4,
        "createdAt": "2026-11-06T..."
      }
    ]
  }
  ```

### 3.3 Get Folder Hierarchy & Breadcrumbs
- **Method**: `GET`
- **Path**: `/api/folders/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "folder": { "id": "64f4...", "name": "Q4", "parentFolderId": "64f3..." },
      "breadcrumbs": [
        { "id": "64f3...", "name": "Financial Reports" },
        { "id": "64f4...", "name": "Q4" }
      ]
    }
  }
  ```

### 3.4 Rename Folder
- **Method**: `PATCH`
- **Path**: `/api/folders/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "name": "2026 Financial Reports" }`

### 3.5 Delete Folder (Recursive)
- **Method**: `DELETE`
- **Path**: `/api/folders/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "deletedFolderCount": 3,
      "deletedFileCount": 8,
      "releasedBytes": 8388608
    }
  }
  ```

---

## 4. File Management Endpoints

### 4.1 Request Presigned S3 Upload URL
- **Method**: `POST`
- **Path**: `/api/files/upload-url`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "originalName": "presentation.pdf",
    "mimeType": "application/pdf",
    "size": 5242880,
    "folderId": "64f3..."
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://bucket.s3.us-east-1.amazonaws.com/users/...?X-Amz-Signature=...",
      "s3Key": "users/64f1.../64f3.../uuid-presentation.pdf",
      "originalName": "presentation.pdf",
      "mimeType": "application/pdf",
      "size": 5242880,
      "folderId": "64f3..."
    }
  }
  ```

### 4.2 Confirm S3 Upload
- **Method**: `POST`
- **Path**: `/api/files/confirm-upload`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "presentation.pdf",
    "originalName": "presentation.pdf",
    "mimeType": "application/pdf",
    "size": 5242880,
    "s3Key": "users/64f1.../64f3.../uuid-presentation.pdf",
    "folderId": "64f3..."
  }
  ```

### 4.3 List Files with Filters & Sorting
- **Method**: `GET`
- **Path**: `/api/files?folderId=<id>&type=documents&sortBy=createdAt&sortOrder=desc&search=<query>`
- **Headers**: `Authorization: Bearer <token>`

### 4.4 Get Presigned Download/Preview URL
- **Method**: `GET`
- **Path**: `/api/files/:id/download`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "downloadUrl": "https://bucket.s3.us-east-1.amazonaws.com/...&response-content-disposition=inline...",
      "expiresIn": 900
    }
  }
  ```

### 4.5 Move File
- **Method**: `PATCH`
- **Path**: `/api/files/:id/move`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ "targetFolderId": "64f4..." }`

### 4.6 Delete File
- **Method**: `DELETE`
- **Path**: `/api/files/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "64f2...",
      "name": "presentation.pdf",
      "freedBytes": 5242880
    }
  }
  ```
