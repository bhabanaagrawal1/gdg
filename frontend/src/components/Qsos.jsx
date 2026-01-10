import React from "react";
import { useNavigate } from "react-router-dom";


const Qsos = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      id: 1,
      title: "Emergency Contacts Alerted",
      description:
        "All your emergency contacts receive instant notifications with your location",
    },
    {
      id: 2,
      title: "Live Location Sharing",
      description:
        "Your real-time location is continuously shared until help arrives to you",
    },
    {
      id: 3,
      title: "Authorities Notified",
      description:
        "Nearby police units and emergency services are automatically alerted",
    },
    {
      id: 4,
      title: "Offline Mode Activated",
      description:
        "SMS alerts sent even if internet connection is lost",
    },
  ];

  return (
    <div
      className="
        relative w-full
        min-h-screen lg:h-screen
        bg-[url('https://static.vecteezy.com/system/resources/previews/004/519/310/large_2x/red-and-white-color-gradient-background-free-photo.jpg')]
        lg:bg-[url('https://cdn.prod.website-files.com/5a9ee6416e90d20001b20038/628a0ab590f189eb851723da_red-white-gradient.png')]
        bg-cover bg-bottom
        flex justify-center items-center
        px-4 pt-24 lg:pt-0
      "
    >
      {/* Back Arrow */}
      <button
        onClick={() => navigate("/")}
        className="
          absolute top-6 left-6 z-20
          w-10 h-10 rounded-full
          bg-white shadow
          flex items-center justify-center
          hover:opacity-80
        "
      >
        <i className="ri-arrow-left-line text-xl"></i>
      </button>

      {/* Main Card */}
      <div
        className="
          w-full max-w-6xl
          bg-white rounded-4xl shadow-sm
          flex gap-6 p-6
          lg:h-[85%]
          max-lg:flex-col mb-10 lg:mb-0
        "
      >
        {/* LEFT SECTION */}
        <div
          className="
            w-1/2 max-lg:w-full
            bg-gray-50 rounded-4xl
            flex justify-center items-center
            py-10 lg:py-0
          "
        >
          <div className="text-center px-6 w-full max-w-sm">
            <h1 className="text-[18px] lg:text-2xl font-bold">Emergency SOS</h1>
            <p className="text-xs text-gray-400 font-light mb-7">
              Quick access to emergency services
            </p>

            {/* Image */}
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden bg-white shadow flex items-center justify-center">
                <img
                  src="https://i.pinimg.com/1200x/97/8c/00/978c005c12bf4fbfcb080b6d53093840.jpg"
                  alt="SOS"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold mb-1">Emergency Alert</h2>
            <p className="text-[14px] lg:text-[16px] text-gray-400 font-light mb-5">
              Press and hold to activate emergency SOS
            </p>

            <button
              className="
                w-full py-3 text-[16px] lg:text-xl font-semibold rounded-[10px]
                bg-linear-to-bl from-red-400 via-red-600 to-red-800
                text-white hover:opacity-80
              "
              onClick={() => navigate("/sos-ring")}
            >
              Activating SOS
            </button>

            {/* Timer */}
            <div className="mt-4">
              <div className="py-3 px-4 rounded-[10px] bg-gray-200 shadow-sm text-center lg:text-left">
                <h3 className="font-semibold text-sm flex justify-center lg:justify-start items-center gap-1 lg:gap-2">
                  <i className="ri-time-line"></i>
                  5-Second Safety Timer
                </h3>
                <p className="text-xs text-gray-600 font-light text-center lg:text-left">
                  You'll have 5 seconds to cancel before emergency alerts are sent
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className="
            w-[45%] max-lg:w-full
            flex items-center
          "
        >
          <div className="px-4 w-full">
            <h1 className="text-[20px] lg:text-2xl font-semibold mb-6">
              What happens when SOS is activated:
            </h1>

            {steps.map((item) => (
              <div key={item.id} className="flex gap-4 mb-5 lg:mb-3">
                {/* Perfect Circle */}
                <div
                  className="
                    w-11 h-11 rounded-full bg-gray-200
                    flex items-center justify-center
                    text-lg font-semibold leading-none
                  "
                >
                  {item.id}
                </div>

                <div>
                  <p className="lg:text-base font-bold text-[14px]">{item.title}</p>
                  <p className="text-[10px] text-gray-400 font-light lg:text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start text-[14px] lg:text-[16px]">
              <button className="flex items-center gap-2 py-3 w-full justify-center bg-gray-300 font-bold rounded-[10px] shadow hover:opacity-70">
                <i className="ri-phone-line"></i>
                Edit Contact
              </button>

              <button className="flex items-center gap-2 py-3 w-full justify-center bg-gray-300 font-bold rounded-[10px] shadow hover:opacity-70">
                <i className="ri-shield-line"></i>
                Safety Score
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Qsos;
