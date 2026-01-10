import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/Auth-context";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Reports = () => {
  const { authToken } = useAuth();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    description: "",
  });

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "Fetching location...",
  });

  const [tempLocation, setTempLocation] = useState(null);

  const [showMap, setShowMap] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchError, setSearchError] = useState("");

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  /* ================= DATA ================= */

  const incidentTypes = [
    {
      id: 1,
      title: "Harassment",
      description: "Verbal, Physical",
      icon: "ri-user-voice-line",
    },
    {
      id: 2,
      title: "Theft",
      description: "Robbery, Theft",
      icon: "ri-handbag-line",
    },
    {
      id: 3,
      title: "Assault",
      description: "Physical harm",
      icon: "ri-alarm-warning-line",
    },
    {
      id: 4,
      title: "Stalking",
      description: "Being followed",
      icon: "ri-eye-line",
    },
    {
      id: 5,
      title: "Poor Lighting",
      description: "Dark areas",
      icon: "ri-lightbulb-flash-line",
    },
    {
      id: 6,
      title: "Other",
      description: "Other issue",
      icon: "ri-more-2-line",
    },
  ];

  const riskLevels = [
    { id: 1, description: "Minor concern", icon: "🟢" },
    { id: 2, description: "Moderate risk", icon: "🟡" },
    { id: 3, description: "Danger zone", icon: "🔴" },
  ];

  /* ================= LOCATION ================= */

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "Unknown location";
    } catch {
      return "Unknown location";
    }
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        setLocation({
          lat: coords.latitude,
          lng: coords.longitude,
          address,
        });
      },
      () => setLocation({ address: "Location permission denied" }),
      { enableHighAccuracy: true }
    );
  }, []);

  /* ================= MAP MODAL ================= */

  useEffect(() => {
    if (!showMap || !location.lat) return;

    setTempLocation(location);

    mapRef.current = L.map("picker-map").setView(
      [location.lat, location.lng],
      15
    );

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
    ).addTo(mapRef.current);

    markerRef.current = L.marker([location.lat, location.lng], {
      draggable: true,
    }).addTo(mapRef.current);

    mapRef.current.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      markerRef.current.setLatLng([lat, lng]);
      const address = await reverseGeocode(lat, lng);
      setTempLocation({ lat, lng, address });
    });

    markerRef.current.on("dragend", async (e) => {
      const { lat, lng } = e.target.getLatLng();
      const address = await reverseGeocode(lat, lng);
      setTempLocation({ lat, lng, address });
    });

    return () => {
      mapRef.current.remove();
      mapRef.current = null;
    };
  }, [showMap]); // ✅ Only showMap

  /* ================= MANUAL SEARCH ================= */

  const searchPlace = async () => {
    if (!searchText.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
      );
      const data = await res.json();

      if (!data.length) {
        setSearchError("Place not found");
        return;
      }

      const place = data[0];
      const lat = parseFloat(place.lat);
      const lng = parseFloat(place.lon);

      setSearchError("");

      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 15);

      setTempLocation({
        lat,
        lng,
        address: place.display_name,
      });
    } catch {
      setSearchError("Search failed");
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedIncident || !selectedRisk || !location.lat) {
      alert("Please complete all required fields");
      return;
    }

    await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ...formData,
        whatHappened: selectedIncident, // Frontend sends ID, backend expects string or ID? Frontend logic maps to ID.
        riskVal: selectedRisk,
        lng: location.lng,
        lat: location.lat,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
          address: location.address,
        },
      }),
    });

    alert("Report submitted successfully");
  };

  const handleChange = (k, v) => setFormData({ ...formData, [k]: v });

  /* ================= UI ================= */

  return (
  <>
      <div className="min-h-screen bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] px-6 py-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* LEFT */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-center lg:text-left">
              Report Un<span className="text-[#A7C7E7]">safe Zone</span>
            </h1>

            <p className="text-gray-600 max-w-lg mb-8 text-center lg:text-left">
              Help keep your community safe by reporting locations that feel
              unsafe or suspicious.
            </p>

            {/* LOCATION CARD */}
            <div className="mb-8 p-4 rounded-2xl bg-[#a7c7e7] flex flex-col lg:flex-row justify-between items-center">
              <div className="text-white">
                <p className="text-xs opacity-80 text-center lg:text-left">
                  REPORTING FROM
                </p>
                <p className="font-semibold  text-center lg:text-left">
                  {location.address}
                </p>
              </div>
              <button
                onClick={() => setShowMap(true)}
                className="bg-white text-[#a7c7e7] px-5 py-2 rounded-xl font-semibold mt-1 lg:mt-0 w-full lg:w-auto"
              >
                Edit
              </button>
            </div>

            {/* INCIDENT TYPES */}
            <p className="mb-4 text-sm text-gray-500">What happened?</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {incidentTypes.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedIncident(item.id)}
                  className={`cursor-pointer p-4 rounded-2xl transition-all duration-200
                ${selectedIncident === item.id
                      ? "bg-[#a7c7e7] text-white shadow-sm"
                      : "bg-white hover:shadow-sm"
                    }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-[#f2f6fb] flex items-center justify-center text-xl text-[#a7c7e7]">
                      <i className={item.icon} />
                    </div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-white p-8 rounded-3xl shadow-sm">
            <h2 className="text-xl font-semibold mb-6 text-center lg:text-left">
              Your Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="First name"
                className="input bg-[#f2f6fb] px-3 py-3 rounded-xl"
              />
              <input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Last name"
                className="input bg-[#f2f6fb] px-3 py-3 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Email address"
                className="input bg-[#f2f6fb] px-3 py-3 rounded-xl"
              />
              <input
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Phone number"
                className="input bg-[#f2f6fb] px-3 py-3 rounded-xl"
              />
            </div>

            {/* Risk */}
            <p className="text-sm mb-3 text-gray-500">Severity</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {riskLevels.map((risk) => (
                <div
                  key={risk.id}
                  onClick={() => setSelectedRisk(risk.id)}
                  className={`cursor-pointer p-3 rounded-xl text-center transition
                ${selectedRisk === risk.id
                      ? "bg-[#a7c7e7] text-white"
                      : "bg-[#f2f6fb]"
                    }`}
                >
                  <p className="text-lg">{risk.icon}</p>
                  <p className="text-xs font-semibold">{risk.description}</p>
                </div>
              ))}
            </div>

            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what happened"
              className="w-full h-28 p-4 rounded-xl bg-[#f2f6fb] resize-none mb-3 outline-none"
            />

            <p className="text-xs text-gray-400 mb-4">
              Your information is private and will never be shared publicly.
            </p>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold hover:opacity-90 transition"
            >
              Submit Report
            </button>
          </div>
        </div>

        {/* MAP MODAL */}
        {showMap && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {/* CARD */}
            <div
              className="
        bg-linear-to-br from-[#f4f8fc] to-[#eef3f9]
        w-[85%] sm:w-[75%] lg:w-[70%]
        h-[80vh]
        rounded-3xl
        shadow-2xl
        flex flex-col
        animate-slideUp
        mt-25
      "
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-400">
                <h2 className="text-lg font-semibold">Choose Location</h2>

                <button
                  onClick={() => setShowMap(false)}
                  className="w-9 h-9 flex items-center justify-center font-bold text-black rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  ✕
                </button>
              </div>

              {/* SEARCH */}
              <div className="px-5 py-4">
                <div className="flex flex-col lg:flex-row gap-3">
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search area or landmark"
                    className="
              flex-1 px-4 py-3 rounded-xl
              border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-[#a7c7e7]
            "
                  />
                  <button
                    onClick={searchPlace}
                    className="
              px-6 py-3 rounded-xl
              bg-[#a7c7e7] text-white font-semibold
              hover:opacity-90
            "
                  >
                    Search
                  </button>
                </div>

                {searchError && (
                  <p className="text-[#a7c7e7] text-sm mt-2">{searchError}</p>
                )}
              </div>

              {/* MAP */}
              <div className="flex-1 px-4">
                <div
                  id="picker-map"
                  className="w-full h-full rounded-2xl overflow-hidden"
                />
              </div>

              {/* ACTION BAR */}
              <div className="px-5 py-4 border-t border-gray-400 flex justify-between gap-3">
                <button
                  onClick={() => setShowMap(false)}
                  className="
            flex-1 py-3 rounded-xl
            bg-gray-100 font-semibold
          "
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!tempLocation) return;
                    setLocation(tempLocation);
                    setShowMap(false);
                  }}
                  className="
            flex-1 py-3 rounded-xl
            bg-[#a7c7e7] text-white font-semibold
            hover:opacity-90
          "
                >
                  Set Location
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;
