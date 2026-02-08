import React from "react";
import { useSOS } from "../context/SosContext";
import { useNavigate } from "react-router-dom";

const Active = () => {
  const navigate = useNavigate();
  const { stopSOS } = useSOS();

  return (
    <div className="w-full min-h-screen bg-[url('https://i.pinimg.com/1200x/0f/7b/9c/0f7b9c1dacc38936e0f40c13381f068c.jpg')] bg-cover bg-center flex flex-col justify-center items-center px-4">
      
      {/* Icon */}
      <i className="ri-error-warning-line text-white text-6xl sm:text-7xl lg:text-9xl"></i>

      {/* Text */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mt-3">
        SOS ACTIVE
      </h1>

      <h3 className="text-sm sm:text-base lg:text-xl font-light text-white mt-1 mb-5 text-center">
        Emergency alerts sent to all contacts
      </h3>

      {/* Status Card */}
      <div className="w-[90%] max-w-sm sm:max-w-md lg:max-w-lg bg-white rounded-2xl flex flex-col gap-4 p-4">
        
        <div className="bg-green-100 rounded-2xl flex items-center p-4">
          <i className="ri-phone-line text-2xl text-green-600 mr-4"></i>
          <div>
            <h1 className="text-sm sm:text-base font-medium">
              Calling Emergency Services
            </h1>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
        </div>

        <div className="bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] rounded-2xl flex items-center p-4">
          <i className="ri-map-pin-line text-2xl text-blue-400 mr-4"></i>
          <div>
            <h1 className="text-sm sm:text-base font-medium">
              Live Location Sharing
            </h1>
            <p className="text-xs text-gray-500">Broadcasting to contacts</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={() => {
          stopSOS();
          navigate("/sos");
        }}
        className="w-[90%] max-w-sm sm:max-w-md lg:max-w-lg mt-6 py-3 bg-orange-500 rounded-2xl text-base sm:text-lg text-white shadow hover:opacity-80"
      >
        I'm Safe — Cancel Alert
      </button>

      <button
        onClick={() => navigate("/home")}
        className="w-[90%] max-w-sm sm:max-w-md lg:max-w-lg mt-3 py-3 bg-white/20 rounded-2xl text-base sm:text-lg text-white hover:opacity-80"
      >
        Return to Home
      </button>
    </div>
  );
};

export default Active;
