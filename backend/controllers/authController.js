import User from '../models/User.js'

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: { user: req.user } })
  } catch (error) {
    next(error)
  }
}

export const syncUser = async (req, res, next) => {
  try {
    const { name, emailVerified } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, emailVerified },
      { new: true }
    )
    res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    next(error)
  }
}
