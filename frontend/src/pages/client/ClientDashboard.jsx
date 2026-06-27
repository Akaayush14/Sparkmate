import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function ClientDashboard() {
  const [activeView, setActiveView] = useState('overview')
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const stats = [
    { label: 'Total Cleans', value: '1', icon: 'fa-sparkles', color: 'bg-blue-500' },
    { label: 'Loyalty Points', value: '340', icon: 'fa-award', color: 'bg-green-500' },
    { label: 'Invited Friends', value: '0', icon: 'fa-percent', color: 'bg-yellow-500' },
    { label: 'Registered Sites', value: '2', icon: 'fa-building', color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">SparkMate</span>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
              { id: 'bookings', label: 'Bookings', icon: 'fa-calendar-check' },
              { id: 'invoices', label: 'Invoices & Pay', icon: 'fa-file-invoice-dollar' },
              { id: 'reports', label: 'Cleaning Reports', icon: 'fa-clipboard-list' },
              { id: 'chat', label: 'Messages', icon: 'fa-comments' },
              { id: 'settings', label: 'Settings', icon: 'fa-sliders' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className={`fa-solid ${item.icon}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6 border-t">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Welcome back,</p>
            <p className="font-medium text-gray-900">{user?.name}</p>
          </div>
          <Link to="/" className="block w-full mb-3">
            <Button variant="secondary" className="w-full">
              <i className="fa-solid fa-house mr-2" /> Home Website
            </Button>
          </Link>
          <Button variant="danger" className="w-full" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <Button>
            <i className="fa-solid fa-plus mr-2" /> New Booking
          </Button>
        </div>

        {activeView === 'overview' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                      <i className={`fa-solid ${stat.icon} text-xl`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-4">
                  <i className="fa-solid fa-clock text-blue-600 mr-2" /> Next Cleaning Job
                </h2>
                <div className="text-gray-500">No upcoming jobs scheduled</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <i className="fa-solid fa-gift text-green-600 mr-2" /> Refer & Earn $25
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Share the SparkMate cleaning experience. When a friend signs up using your code, you both earn $25 credit!
                  </p>
                  <div className="flex items-center justify-between bg-gray-50 border border-dashed border-blue-300 rounded-lg p-4">
                    <code className="font-bold text-lg text-blue-600">SPARK-{user?.name?.toUpperCase() || 'USER'}</code>
                    <Button variant="secondary" size="sm">
                      Copy Code
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    <i className="fa-solid fa-chart-line mr-2" /> Spend Analytics
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Current Month Spend:</span>
                    <strong className="text-gray-900">$180.00</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView !== 'overview' && (
          <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {activeView.charAt(0).toUpperCase() + activeView.slice(1)} View
            </h2>
            <p className="text-gray-600">This section will be implemented in the next phase.</p>
          </div>
        )}
      </main>
    </div>
  )
}
