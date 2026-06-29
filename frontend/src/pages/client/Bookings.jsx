import { useState } from 'react'
import Button from '../../components/common/Button'
import BookingCard from '../../components/client/BookingCard'
import BookingForm from '../../components/client/BookingForm'
import { useBookings } from '../../hooks/useBookings'
import { cancelBooking } from '../../services/api'

export default function Bookings() {
  const [showForm, setShowForm] = useState(false)
  const { bookings, loading, error, refetch } = useBookings()

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId)
      refetch()
    } catch (err) {
      console.error('Failed to cancel booking:', err)
    }
  }

  const handleBookingCreated = () => {
    setShowForm(false)
    refetch()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading bookings...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <Button onClick={() => setShowForm(true)}>
          <i className="fa-solid fa-plus mr-2"></i>New Booking
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Create your first booking to get started!</p>
          <Button onClick={() => setShowForm(true)}>
            <i className="fa-solid fa-plus mr-2"></i>Create Booking
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <BookingCard 
              key={booking._id} 
              booking={booking} 
              onCancel={handleCancelBooking} 
            />
          ))}
        </div>
      )}

      {showForm && (
        <BookingForm 
          onSuccess={handleBookingCreated} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  )
}
