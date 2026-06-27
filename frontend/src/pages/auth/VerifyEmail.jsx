import { Link } from 'react-router-dom'
import Button from '../../components/common/Button'

export default function VerifyEmail() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="text-xl font-bold text-gray-900">SparkMate</span>
        </div>
        
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-check-circle text-4xl" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
        <p className="text-gray-600 mb-8">
          Your email address has been verified. You can now login to your SparkMate account.
        </p>
        
        <Link to="/login">
          <Button size="lg" className="w-full">
            <i className="fa-solid fa-right-to-bracket mr-2" /> Login Now
          </Button>
        </Link>
      </div>
    </div>
  )
}
