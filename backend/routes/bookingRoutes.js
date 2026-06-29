import express from 'express'
import { 
  getBookings, 
  createBooking, 
  getBookingById, 
  cancelBooking, 
  updateBookingStatus 
} from '../controllers/bookingController.js'
import { protect, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.get('/', getBookings)
router.post('/', requireRole('client'), createBooking)
router.get('/:id', getBookingById)
router.patch('/:id/cancel', requireRole('client'), cancelBooking)
router.patch('/:id/status', requireRole('admin'), updateBookingStatus)

export default router
