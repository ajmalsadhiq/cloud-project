# CloudVault ☁️

**CloudVault** is an enterprise-grade cloud-native file storage and management platform inspired by Google Drive, Dropbox, and Linear. It provides secure, scalable file storage with direct-to-S3 presigned uploads, granular folder hierarchies, real-time storage quota tracking, and an intuitive modern interface with dark/light mode.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript, Zod Validation, RESTful Architecture
- **Database**: MongoDB Atlas / Mongoose (Metadata, Ownership, Quotas)
- **Object Storage**: AWS S3 (AWS SDK for JavaScript v3) with Presigned URLs
- **Authentication**: JWT (JSON Web Tokens) & bcrypt password hashing
- **Deployment & DevOps**: Docker, Docker Compose, Nginx, AWS EC2 ready

---

## 🏗️ Architecture Highlights

- **Direct-to-S3 Presigned Uploads**: Files stream directly from the client to AWS S3 without overloading backend memory or consuming EC2 bandwidth.
- **Private S3 Objects**: All stored objects are strictly private with temporary, time-bound presigned URLs generated on-demand for downloads and previews.
- **Strict Quota Enforcement**: Real-time validation ensures users cannot exceed their allocated storage tier.
- **Multi-level Folder Organization**: Nested folder trees maintained in MongoDB with instant breadcrumb path navigation.
- **Enterprise Security**: Helmet headers, CORS restrictions, authentication rate-limiting, and comprehensive MIME type validation.

---

## 📁 Repository Structure

```text
cloud/
├── backend/            # Express.js + TypeScript REST API
├── frontend/           # Next.js App Router client application
├── docker-compose.yml  # Local multi-service orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- (Optional) Docker & Docker Compose
- MongoDB Atlas connection string (or local MongoDB)
- AWS S3 Bucket & IAM credentials (for S3 storage)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB and AWS S3 credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access CloudVault.
