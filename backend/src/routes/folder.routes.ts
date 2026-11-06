import { Router } from 'express';
import { FolderController } from '../controllers/folder.controller.js';
import { authenticateJwt } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createFolderSchema, renameFolderSchema } from '../validators/folder.validator.js';

const router = Router();

// All folder routes require valid JWT
router.use(authenticateJwt);

router.post('/', validateBody(createFolderSchema), FolderController.createFolder);
router.get('/', FolderController.getFolders);
router.get('/:id', FolderController.getFolderById);
router.patch('/:id', validateBody(renameFolderSchema), FolderController.renameFolder);
router.delete('/:id', FolderController.deleteFolder);

export default router;
