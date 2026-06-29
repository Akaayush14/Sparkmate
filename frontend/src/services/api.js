import axios from 'axios'
import { auth } from '../config/firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const getMe = () => api.get('/auth/me')
export const syncUser = (data) => api.post('/auth/sync', data)
export const getClientBookings = (params) => api.get('/bookings', { params })
export const createBooking = (data) => api.post('/bookings', data)
export const getBookingById = (id) => api.get(`/bookings/${id}`)
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`)

export default api
