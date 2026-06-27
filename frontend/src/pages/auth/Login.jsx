import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Mock login - replace with actual API call later
      const mockUser = {
        id: 1,
        email: email,
        role: email.includes('admin') ? 'admin' : email.includes('staff') ? 'staff' : 'client',
        name: email.split('@')[0],
      }
      login(mockUser, 'mock-token-123')
      
      // Redirect based on role
      if (mockUser.role === 'admin') {
        navigate('/admin')
      } else if (mockUser.role === 'staff') {
        navigate('/staff')
      } else {
        navigate('/client')
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setLoading(false)
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded" />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : (
              <>
                <i className="fa-solid fa-right-to-bracket mr-2" /> Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-3 font-medium">Demo Accounts:</p>
          <div className="space-y-2 text-xs">
            <p><strong>Admin:</strong> admin@sparkmate.com (any password)</p>
            <p><strong>Client:</strong> client@sparkmate.com (any password)</p>
            <p><strong>Staff:</strong> staff@sparkmate.com (any password)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
