import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function StaffDashboard() {
  const [activeView, setActiveView] = useState('jobs')
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-gray-900 text-white p-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-broom text-green-400 text-xl" />
            <h1 className="text-xl font-bold">SparkMate Staff</h1>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="text-sm">
            <i className="fa-solid fa-right-from-bracket mr-2" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-6 pb-24">
        {activeView === 'jobs' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-600 font-medium">TODAY'S SCHEDULE</span>
              <Button variant="secondary" size="sm">
                <i className="fa-solid fa-location-crosshairs mr-2" /> Proximity Bypass
              </Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
              <p className="text-gray-500">No jobs assigned for today</p>
            </div>
          </div>
        )}

        {activeView === 'earnings' && (
          <div>
            <div className="bg-gradient-to-r from-gray-900 to-blue-600 text-white rounded-xl p-6 mb-6 text-center">
              <p className="text-sm opacity-80 uppercase mb-2">Weekly Earnings</p>
              <h2 className="text-4xl font-bold mb-1">$342.50</h2>
              <p className="text-sm opacity-80">12.5 hrs clocked this week</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
              <h3 className="font-semibold mb-2">
                <i className="fa-solid fa-award text-green-500 mr-2" /> Rating Bonus Tracker
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">5-Star Bonus (+$10 each):</span>
                <strong className="text-gray-900">2 completed (+$20)</strong>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-3">Completed Jobs Ledger</h3>
            <div className="text-gray-500 text-center py-8">No completed jobs yet</div>
          </div>
        )}

        {activeView === 'sos' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border-2 border-red-400 p-8 mb-6 text-center">
              <i className="fa-solid fa-triangle-exclamation text-red-500 text-5xl mb-4 animate-pulse" />
              <h2 className="text-xl font-bold mb-2">SOS Alert Dispatch</h2>
              <p className="text-gray-600 text-sm mb-6">
                For isolated sites or emergency safety issues. Pressing triggers a distress call to dispatch and alerts active supervisors with your GPS coordinates.
              </p>
              <Button variant="danger" className="w-full py-4 text-lg">
                <i className="fa-solid fa-phone-volume mr-2" /> BROADCAST EMERGENCY
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold mb-4">Training & SOP SOPs</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">
                    <i className="fa-solid fa-play text-blue-600 mr-2" /> Deep Clean disinfection standards
                  </span>
                  <Button variant="secondary" size="sm">Watch</Button>
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-gray-700">
                    <i className="fa-solid fa-clipboard text-blue-600 mr-2" /> Chemical dilutions guide
                  </span>
                  <Button variant="secondary" size="sm">View Chart</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h2 className="text-xl font-bold">{user?.name || 'Staff Member'}</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
              <h3 className="font-semibold mb-3">Compliance Credentials</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-circle-check text-green-500" /> DBS Background Check Checked
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-circle-check text-green-500" /> ID Verification Validated
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <i className="fa-solid fa-circle-check text-green-500" /> Cleaning Certification Course
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h3 className="font-semibold mb-3">Low Supply stock Alert</h3>
              <div className="space-y-4">
                <select className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option>Eco-clean spray (1L)</option>
                  <option>Microfiber towels (pack)</option>
                  <option>Mop replacement heads</option>
                  <option>Trash Liners (roll)</option>
                </select>
                <Button variant="secondary" className="w-full text-sm">
                  <i className="fa-solid fa-box-open mr-2" /> Request Stock Restock
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {[
            { id: 'jobs', label: 'Jobs', icon: 'fa-list-check' },
            { id: 'earnings', label: 'Earnings', icon: 'fa-coins' },
            { id: 'sos', label: 'Safety', icon: 'fa-shield-cat' },
            { id: 'profile', label: 'Profile', icon: 'fa-user-circle' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`py-4 flex flex-col items-center gap-1 text-sm ${
                activeView === item.id ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-xl`} />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
