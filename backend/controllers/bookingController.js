import Booking from '../models/Booking.js'

export const getBookings = async (req, res, next) => {
  try {
    let query = {}
    
    if (req.user.role === 'client') {
      query.clientId = req.user._id
    } else if (req.user.role === 'staff') {
      query.staffId = req.user._id
    }

    if (req.query.status) {
      query.status = req.query.status
    }

    if (req.query.date) {
      query.date = new Date(req.query.date)
    }

    const bookings = await Booking.find(query).populate('clientId staffId')
    res.status(200).json({ success: true, data: { bookings } })
  } catch (error) {
    next(error)
  }
}

export const createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      clientId: req.user._id,
      status: 'pending'
    }
    const booking = await Booking.create(bookingData)
    res.status(201).json({ success: true, data: { booking } })
  } catch (error) {
    next(error)
  }
}

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('clientId staffId')
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    let authorized = false
    if (req.user.role === 'admin') {
      authorized = true
    } else if (req.user.role === 'client' && booking.clientId._id.toString() === req.user._id.toString()) {
      authorized = true
    } else if (req.user.role === 'staff' && booking.staffId && booking.staffId._id.toString() === req.user._id.toString()) {
      authorized = true
    }

    if (!authorized) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    res.status(200).json({ success: true, data: { booking } })
  } catch (error) {
    next(error)
  }
}

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    if (booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot cancel non-pending booking' })
    }

    booking.status = 'cancelled'
    await booking.save()

    res.status(200).json({ success: true, data: { booking } })
  } catch (error) {
    next(error)
  }
}

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, staffId } = req.body
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, staffId },
      { new: true }
    )

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    res.status(200).json({ success: true, data: { booking } })
  } catch (error) {
    next(error)
  }
}
