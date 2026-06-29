import express from 'express'
import { getMe, syncUser } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/me', protect, getMe)
router.post('/sync', protect, syncUser)

export default router
