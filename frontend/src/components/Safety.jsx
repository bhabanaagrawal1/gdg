import React, { useEffect, useRef } from "react";
import { socket } from "../sockets/sockets";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

import { getAuth } from "firebase/auth";

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
        timeout: 10000,
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

  return (
    <>
      <style>
        {`
      .leaflet-container {
        z-index: 0;
      }
    `}
      </style>
      <div className="w-full z-0 h-screen flex justify-center bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] relative">
        <div id="map" className="w-[80%] h-[70vh] lg:h-[60vh] mt-10" />

        {safetyScore && (
          <div className="absolute top-12 right-[12%] bg-white p-3 rounded-xl shadow-lg z-10 border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Safety Score</p>
            <p className={`text-2xl font-bold ${Number(safetyScore) > 80 ? 'text-green-500' : Number(safetyScore) > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
              {safetyScore}/100
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Safety;
