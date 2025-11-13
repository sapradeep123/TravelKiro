import { Router } from 'express';
import albumController from '../controllers/albumController';
import photoCommentController from '../controllers/photoCommentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Album CRUD
router.post('/', albumController.createAlbum);
router.get('/', albumController.getAlbums);
router.get('/:id', albumController.getAlbum);
router.put('/:id', albumController.updateAlbum);
router.delete('/:id', albumController.deleteAlbum);

// Photo management
router.post('/:id/photos', albumController.addPhotos);
router.delete('/:id/photos/:photoId', albumController.removePhoto);
router.put('/:id/photos/:photoId/comment-status', albumController.updateCommentStatus);

// Photo comments (using album-photos prefix for clarity)
const photoRouter = Router();
photoRouter.use(authenticate);
photoRouter.get('/:id/comments', photoCommentController.getComments);
photoRouter.post('/:id/comments', photoCommentController.addComment);

// Comment operations
const commentRouter = Router();
commentRouter.use(authenticate);
commentRouter.delete('/:id', photoCommentController.deleteComment);
commentRouter.post('/:id/report', photoCommentController.reportComment);

export { photoRouter, commentRouter };
export default router;
