import { Link } from 'react-router-dom'
import Button from '../components/common/Button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Nav */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">SparkMate</span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Login
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Clean Spaces. <br /> Better Places.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Premium professional cleaning services with instant booking, automated schedule manager, and real-time tracking portals for clients and staff.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg">
                <i className="fa-solid fa-calendar-check mr-2" /> Book in 60 Seconds
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                <i className="fa-solid fa-right-to-bracket mr-2" /> Staff/Client Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Cleaning Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-house-chimney', title: 'Standard Cleaning', desc: 'Dusting, vacuuming, mopping, trash empty, kitchen counter wipe-down, bathroom sanitization. Perfect for keeping homes and offices neat weekly.' },
              { icon: 'fa-broom', title: 'Deep Cleaning', desc: 'Detail cleaning including skirting boards, window frames, inside microwave, door handles, limescale removal, grout scrubbing, and mattress dusting.' },
              { icon: 'fa-truck-moving', title: 'Move In/Out', desc: 'Comprehensive preparation clean for tenancy handovers. Includes inside oven, fridge, kitchen cupboards, drawers, window sills, and heavy steam vacuums.' },
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`fa-solid ${service.icon} text-2xl`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold">SparkMate</span>
          </div>
          <p className="text-gray-400">
            © 2026 SparkMate Inc. All rights reserved. Clean Spaces, Better Places.
          </p>
        </div>
      </footer>
    </div>
  )
}
