import Router from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import fileController from '../controllers/file.controller.js'

const router = new Router()

const {
	createDir,
	fetchFiles,
	uploadFile,
	deleteFile,
	searchFile,
	downloadFile,
	uploadAvatar,
	deleteAvatar,
} = fileController

router.post('', authMiddleware, createDir)
router.get('', authMiddleware, fetchFiles)
router.delete('', authMiddleware, deleteFile)
router.get('/search', authMiddleware, searchFile)
router.post('/upload', authMiddleware, uploadFile)
router.post('/avatar', authMiddleware, uploadAvatar)
router.get('/download', authMiddleware, downloadFile)
router.delete('/avatar', authMiddleware, deleteAvatar)

export default router
