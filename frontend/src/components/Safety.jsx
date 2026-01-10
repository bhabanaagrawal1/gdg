import React, { useEffect, useRef } from "react";
import { socket } from "../sockets/sockets";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const mapIncident = (id) => {
  switch (id) {
    case 1: return "Harassment";
    case 2: return "Theft";
    case 3: return "Assault";
    case 4: return "Stalking";
    case 5: return "Poor Lighting";
    case 6: return "Other";
    default: return "Unknown";
  }
};

const mapRisk = (id) => {
  switch (id) {
    case 1: return "Minor Concern 🟢";
    case 2: return "Moderate Risk 🟡";
    case 3: return "Immediate Danger 🔴";
    default: return "Unknown";
  }
};


const Safety = () => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const lastEmitRef = useRef(0);
  const navigate = useNavigate();

  // 🔁 MAP + LIVE LOCATION
  useEffect(() => {
    const map = L.map("map").setView([0, 0], 2);
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Register User for Socket
    const register = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
      socket.emit("register-user", { token });
    };
    register();

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        if (!mapRef.current) return;

        // 🔴 OWN LIVE MARKER
        if (!markersRef.current.me) {
          markersRef.current.me = L.marker([latitude, longitude]).addTo(map);
          map.setView([latitude, longitude], 16);
        } else {
          markersRef.current.me.setLatLng([latitude, longitude]);
          map.panTo([latitude, longitude], { animate: true });
        }

        // 🔁 THROTTLED SOCKET EMIT (every 1.5s)
        const now = Date.now();
        if (now - lastEmitRef.current > 1500) {
          socket.emit("send-location", { latitude, longitude });
          console.log("location: ", { latitude, longitude })
          lastEmitRef.current = now;
        }
      },
      (err) => console.error("Geolocation error:", err),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      map.remove();
    };
  }, []);

  // 👥 OTHER USERS (LIVE)
  useEffect(() => {
    const handleLocation = ({ userId, latitude, longitude }) => {
      if (!mapRef.current || !userId) return;

      if (markersRef.current[userId]) {
        markersRef.current[userId].setLatLng([latitude, longitude]);
      } else {
        markersRef.current[userId] = L.marker([latitude, longitude]).addTo(
          mapRef.current
        );
      }

    };


    const handleDisconnect = ({ userId }) => {
      if (markersRef.current[userId]) {
        mapRef.current.removeLayer(markersRef.current[userId]);
        delete markersRef.current[userId];
      }
    };

    socket.on("friend-live-location", handleLocation);
    socket.on("user-offline", handleDisconnect);

    return () => {
      socket.off("friend-live-location", handleLocation);
      socket.off("user-offline", handleDisconnect);
    };
  }, []);


  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/reports`);
        const reports = await res.json();

        reports.forEach((report) => {
          const [lng, lat] = report.location.coordinates;

          // Avoid duplicate markers
          if (markersRef.current[`report-${report._id}`]) return;

          const marker = L.marker([lat, lng]).addTo(mapRef.current);

          marker.bindPopup(`
          <div style="font-size:13px">
            <p><strong>Incident:</strong> ${mapIncident(report.whatHappened)}</p>
            <p><strong>Severity:</strong> ${mapRisk(report.risk)}</p>
          </div>
        `);

          markersRef.current[`report-${report._id}`] = marker;
        });
      } catch (err) {
        console.error("Failed to load reports", err);
      }
    };

    if (mapRef.current) {
      fetchReports();
    }
  }, []);


  const [safetyScore, setSafetyScore] = React.useState(null);

  useEffect(() => {
    // ... ref logic ...
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const fetchScore = async (latitude, longitude) => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/safeScore?lat=${latitude}&lng=${longitude}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        // data = { safescore: number, totalCases, data: [] }
        if (data.safescore !== undefined) {
          setSafetyScore(data.safescore.toFixed(1));
        }
      } catch (error) {
        console.error("Error fetching safety score:", error);
      }
    };

    // Trigger explicit fetch when we have location
    navigator.geolocation.getCurrentPosition((pos) => {
      fetchScore(pos.coords.latitude, pos.coords.longitude);
    });
  }, []);

  const progress = (safetyScore / 100) * CIRCUMFERENCE;

  return (
    <>
      <style>
        {`
      .leaflet-container {
        z-index: 0;
      }
    `}
      </style>
      <div className="w-full z-0 h-auto flex flex-col items-center justify-center bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] relative">
        
<div className="w-[90%] lg:w-[80%] h-auto lg:h-130 flex flex-col lg:flex-row justify-between items-center gap-8 mt-15">

  {/* LEFT CARD */}
  <div className="w-full lg:w-1/2 h-full bg-white rounded-3xl shadow-sm flex flex-col items-center px-4 lg:px-0">
    
    {/* Header */}
    <div className="flex justify-center items-center">
      <div id='three' className="px-3 py-1 text-base lg:text-xl rounded-3xl bg-[#a7c7e7] text-white inline-block mt-8 lg:mt-10 mb-5">
        <i className="ri-sparkling-fill"></i>&nbsp;Real-time Analysis
      </div>
    </div>

    <h1 className="text-center text-[#a7c7e7] text-3xl lg:text-4xl font-extrabold mb-3">
      Your Safety Score
    </h1>

    <p className="text-gray-400 text-center text-sm lg:text-base line-clamp-2 px-4 lg:px-17 mb-6">
      Real-time safety analysis in your current area. Stay informed, stay safe.
    </p>

    {/* SAFETY SCORE RING */}
    <div className="relative flex justify-center items-center mb-6">
      <svg width="140" height="140" className="lg:w-40 lg:h-40">
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          stroke="#E5E7EB"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="70"
          cy="70"
          r={RADIUS}
          stroke="#a7c7e7"
          strokeWidth="12"
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - progress}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-3xl lg:text-4xl font-extrabold text-[#a7c7e7]">
          {safetyScore}
        </span>
        <span className="text-xs lg:text-sm text-gray-400">out of 100</span>
      </div>
    </div>

    {/* ACTION BUTTONS */}
<div className="flex flex-col sm:flex-row gap-4 mt-6 mb-8">
  
  {/* SOS BUTTON */}
  <button onClick={()=>navigate('/sos')}
    className="px-10 py-3 bg-[#a7c7e7] text-white text-lg font-semibold rounded-2xl shadow-sm hover:opacity-70 transition"
  >
   <i class="ri-alarm-warning-line"></i> SOS
  </button>

  {/* ADD TRUSTED UID BUTTON */}
  <button onClick={()=>navigate('/setting')}
    className="px-8 py-3 border-2 border-[#a7c7e7] text-[#a7c7e7] text-lg font-semibold rounded-2xl hover:bg-[#a7c7e7] hover:text-white transition"
  >
    <i class="ri-add-line"></i> Add Trusted UID
  </button>

</div>

  </div>

  {/* RIGHT CARD */}
  <div className="w-full lg:w-[45%] h-full bg-white rounded-3xl shadow-sm flex flex-col justify-center items-center py-4">

    {/* ITEM */}
    <div className="w-[90%] lg:w-[85%] h-auto lg:h-30 bg-blue-100 my-4 rounded-2xl flex items-center gap-4 px-5 py-4 lg:py-0">
      <div className="text-[#a7c7e7] bg-white text-4xl lg:text-5xl rounded-2xl shadow-sm p-2">
        <i className="ri-share-line"></i>
      </div>
      <div>
        <h1 className="text-[18px] lg:text-[20px] text-white">
          Share Your Location
        </h1>
        <p className="text-gray-400 text-[12px] lg:text-[13px]">
          Let trusted contacts know where you are in real-time
        </p>
      </div>
    </div>

    {/* ITEM */}
    <div className="w-[90%] lg:w-[85%] h-auto lg:h-30 bg-blue-100 my-4 rounded-2xl flex items-center gap-4 px-5 py-4 lg:py-0">
      <div className="text-[#a7c7e7] bg-white text-4xl lg:text-5xl rounded-2xl shadow-sm p-2">
        <i className="ri-chat-3-line"></i>
      </div>
      <div>
        <h1 className="text-[18px] lg:text-[20px] text-white">
          Stay Connected
        </h1>
        <p className="text-gray-400 text-[12px] lg:text-[13px]">
          Keep your phone charged and check in regularly
        </p>
      </div>
    </div>

    {/* ITEM */}
    <div className="w-[90%] lg:w-[85%] h-auto lg:h-30 bg-blue-100 my-4 rounded-2xl flex items-center gap-4 px-5 py-4 lg:py-0">
      <div className="text-[#a7c7e7] bg-white text-4xl lg:text-5xl rounded-2xl shadow-sm p-2">
        <i className="ri-map-pin-line"></i>
      </div>
      <div>
        <h1 className="text-[18px] lg:text-[20px] text-white">
          Know Safe Spots
        </h1>
        <p className="text-gray-400 text-[12px] lg:text-[13px]">
          Identify nearby stores and public places you can go to
        </p>
      </div>
    </div>

  </div>
</div>
<div className="w-full h-auto  flex justify-center pb-10">
          <div id="map" className="w-[80%] h-[70vh] lg:h-[60vh] mt-10" />
          {safetyScore && (
            <div className="absolute top-12 right-[12%] bg-white p-3 rounded-xl shadow-lg z-10 border border-gray-100">
              <p className="text-sm text-gray-500 font-medium">Safety Score</p>
              <p
                className={`text-2xl font-bold ${
                  Number(safetyScore) > 80
                    ? "text-green-500"
                    : Number(safetyScore) > 50
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {safetyScore}/100
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Safety;
