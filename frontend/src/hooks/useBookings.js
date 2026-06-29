import { useState, useEffect } from 'react'
import { getClientBookings } from '../services/api'

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getClientBookings()
      setBookings(response.data.data.bookings)
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings
  }
}
