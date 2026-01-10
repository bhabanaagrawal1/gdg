import React, { useState } from 'react'
import Sign from '../components/Sign'
import PoliceSign from '../components/PoliceSign'

const Signin = () => {
  const [view, setView] = useState('selection')

  if (view === 'user') {
    return (
      <div className="relative">
        <button
          onClick={() => setView('selection')}
          className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:opacity-80"
        >
          <i className="ri-arrow-left-line text-xl"></i>
        </button>
        <Sign />
      </div>
    )
  }

  if (view === 'police') {
    return (
      <PoliceSign onBack={() => setView('selection')} />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] p-4">
      <div className="flex flex-col md:flex-row gap-8 max-w-4xl w-full">

        {/* User Card */}
        <div
          onClick={() => setView('user')}
          className="flex-1 bg-white rounded-3xl p-10 shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
        >
          <div className="h-40 bg-[#dbeafe] rounded-2xl mb-6 flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-[#a7c7e7]">
            Civilian
          </h2>
          <p className="text-gray-500">
            Login to access safety features, SOS alerts, and community maps.
          </p>
        </div>

        {/* Police Card */}
        <div
          onClick={() => setView('police')}
          className="flex-1 bg-white rounded-3xl p-10 shadow-sm cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all duration-300 group"
        >
          <div className="h-40 bg-[#e2e8f0] rounded-2xl mb-6 flex items-center justify-center">
            <span className="text-6xl">👮‍♂️</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-[#2c3e50]">
            Police
          </h2>
          <p className="text-gray-500">
            Official portal for station verification, monitoring, and response.
          </p>
        </div>

      </div>
    </div>
  )
}

export default Signin
