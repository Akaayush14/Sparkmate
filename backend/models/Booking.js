import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  address: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['office', 'deep-clean', 'regular', 'end-of-lease', 'carpet']
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled']
  },
  checklist: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

export default mongoose.model('Booking', bookingSchema)
