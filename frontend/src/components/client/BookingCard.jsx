import Button from '../common/Button'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function BookingCard({ booking, onCancel }) {
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      onCancel(booking._id)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{formatDate(booking.date)}</h3>
          <p className="text-gray-600">{booking.time}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status]}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
      
      <div className="space-y-2 text-gray-700">
        <p><i className="fa-solid fa-building mr-2 text-gray-500"></i>{booking.address}</p>
        <p><i className="fa-solid fa-clock mr-2 text-gray-500"></i>{booking.duration} hours</p>
        <p><i className="fa-solid fa-broom mr-2 text-gray-500"></i>{booking.type.replace('-', ' ')}</p>
        <p className="font-semibold text-lg"><i className="fa-solid fa-dollar-sign mr-2 text-green-600"></i>${booking.price}</p>
        {booking.notes && <p className="text-sm text-gray-500 italic">{booking.notes}</p>}
      </div>

      {booking.status === 'pending' && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={handleCancel}>
            <i className="fa-solid fa-times mr-2"></i>Cancel Booking
          </Button>
        </div>
      )}
    </div>
  )
}
