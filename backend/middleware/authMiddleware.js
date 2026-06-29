import admin from '../config/firebase.js'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const decoded = await admin.auth().verifyIdToken(token)

    let user = await User.findOne({ firebaseUid: decoded.uid })

    if (!user) {
      const name = decoded.name || decoded.email?.split('@')[0]
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        emailVerified: decoded.email_verified,
        name: name,
        role: 'client'
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' })
    }

    next()
  }
}
