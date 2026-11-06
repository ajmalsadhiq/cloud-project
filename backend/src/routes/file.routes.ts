import { Router } from 'express';
import { FileController } from '../controllers/file.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  uploadUrlSchema,
  confirmUploadSchema,
  moveFileSchema,
  renameFileSchema,
} from '../validators/file.validator.js';

const router = Router();

// All file endpoints require valid JWT authentication
router.use(authenticateJwt);

router.get('/', FileController.getFiles);
router.post('/upload-url', validateBody(uploadUrlSchema), FileController.requestUploadUrl);
router.post('/confirm-upload', validateBody(confirmUploadSchema), FileController.confirmUpload);
router.get('/:id', FileController.getFileById);
router.get('/:id/download', FileController.getDownloadUrl);
router.patch('/:id/rename', validateBody(renameFileSchema), FileController.renameFile);
router.patch('/:id/move', validateBody(moveFileSchema), FileController.moveFile);
router.delete('/:id', FileController.deleteFile);

export default router;
