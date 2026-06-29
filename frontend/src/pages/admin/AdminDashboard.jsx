import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const stats = [
    { label: 'Active Jobs', value: '1', icon: 'fa-truck-moving', color: 'bg-blue-500' },
    { label: 'Revenue', value: '$395.00', icon: 'fa-circle-dollar-to-slot', color: 'bg-green-500' },
    { label: 'Customer Satisfaction', value: '--', icon: 'fa-star', color: 'bg-yellow-500' },
    { label: 'System Alerts', value: '0', icon: 'fa-bell', color: 'bg-red-500' },
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
            <span className="text-xl font-bold text-gray-900">SparkMate Admin</span>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-line' },
              { id: 'dispatch', label: 'Dispatch Board', icon: 'fa-calendar-days' },
              { id: 'staff', label: 'Staff CRM', icon: 'fa-people-carry-box' },
              { id: 'billing', label: 'Billing & CRM', icon: 'fa-file-invoice-dollar' },
              { id: 'inventory', label: 'Inventory', icon: 'fa-warehouse' },
              { id: 'analytics', label: 'Analytics', icon: 'fa-chart-pie' },
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
            <p className="text-sm text-gray-600 mb-2">Logged in as:</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="text-gray-600">SparkMate Operations Console</p>
        </div>

        {activeView === 'dashboard' && (
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    <i className="fa-solid fa-earth-americas text-blue-600 mr-2" /> Live Staff Location Monitor
                  </h2>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    <i className="fa-solid fa-circle fa-beat mr-1" /> Live Syncing
                  </span>
                </div>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                  Map Placeholder
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Alerts Inbox</h2>
                  <Button variant="secondary" size="sm">Clear All</Button>
                </div>
                <div className="text-gray-400 text-center py-8">No alerts</div>
              </div>
            </div>
          </div>
        )}

        {activeView !== 'dashboard' && (
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
