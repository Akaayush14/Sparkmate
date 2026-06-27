import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('client')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock registration
    alert('Account created! Please check your email to verify.')
    navigate('/verify-email')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">SparkMate</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
        </div>

        {/* Role toggle */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-colors ${
              role === 'client'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-100 border-gray-200 text-gray-700'
            }`}
            onClick={() => setRole('client')}
          >
            <i className="fa-solid fa-user-tie mr-2" /> Client
          </button>
          <button
            type="button"
            className={`py-3 px-4 rounded-lg font-medium border-2 transition-colors ${
              role === 'staff'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-gray-100 border-gray-200 text-gray-700'
            }`}
            onClick={() => setRole('staff')}
          >
            <i className="fa-solid fa-broom mr-2" /> Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          {role === 'staff' && (
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm text-gray-600 font-medium">Staff Information</p>
              <Input label="Home Address" placeholder="123 Main St" />
              <Input label="Years of Experience" type="number" min="0" />
              <Input label="Areas Willing to Work" placeholder="Downtown, Westside" />
              <Input label="Emergency Contact Name" placeholder="Jane Doe" />
              <Input label="Emergency Contact Phone" placeholder="+1 (555) 000-0000" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you have your own transportation?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="transport" value="yes" className="text-blue-600" />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="transport" value="no" className="text-blue-600" />
                    No
                  </label>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            <i className="fa-solid fa-user-plus mr-2" /> Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
