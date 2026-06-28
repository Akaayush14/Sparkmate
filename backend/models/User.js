import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'client', 'staff'],
    default: 'client',
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export default mongoose.model('User', userSchema)
