import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { socket } from "../sockets/sockets";

// Leaflet marker fix
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = [20.2961, 85.8245];

// Helper to auto-center map
const Recenter = ({ lat, lng, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], zoom);
    }, [lat, lng, zoom]);
    return null;
};

export default function PoliceLiveDashboard() {
    const [users, setUsers] = useState({});
    const [policeStationId, setPoliceStationId] = useState(null);
    const [mapCenter, setMapCenter] = useState(null); // [lat, lng]

    useEffect(() => {
        const storedId = localStorage.getItem("policeStationId");
        if (storedId) setPoliceStationId(storedId);

        const storedCoords = localStorage.getItem("police_coords");
        if (storedCoords) {
            try {
                const [lng, lat] = JSON.parse(storedCoords); // GeoJSON is [lng, lat]
                setMapCenter([lat, lng]);
            } catch (e) {
                console.error("Invalid coords", e);
            }
        }
    }, []);

    /* ===============================
       REGISTER POLICE
    =============================== */
    useEffect(() => {
        if (!policeStationId) return;

        console.log("Registering police station:", policeStationId);
        socket.emit("register-police", { policeStationId });

        return () => {
            socket.off("user-live-location");
        };
    }, [policeStationId]);

    /* ===============================
       RECEIVE USER LOCATIONS
    =============================== */
    useEffect(() => {
        const handleUserLocation = (data) => {
            // Expecting: { userId, latitude, longitude, name }
            console.log("Police Map received:", data);
            const { userId, latitude, longitude, name } = data;
            setUsers((prev) => ({
                ...prev,
                [userId]: { latitude, longitude, name },
            }));
        };

        socket.on("user-live-location", handleUserLocation);

        return () => {
            socket.off("user-live-location", handleUserLocation);
        };
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
        <div className="w-full h-screen flex flex-col">
            <div className="text-center lg:text-left bg-[#97b8d8] text-white p-4 shadow-md z-1">
                <h1 className="text-xl font-bold">Police Live Dashboard</h1>
                <p className="text-xs text-white">Station ID: {policeStationId || "Loading..."}</p>
            </div>
            <MapContainer
                center={defaultCenter}
                zoom={6}
                className="w-full flex-1"
            >
                <TileLayer
                    attribution="© OpenStreetMap"
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {mapCenter && <Recenter lat={mapCenter[0]} lng={mapCenter[1]} zoom={14} />}

                {/* Live Users */}
                {Object.entries(users).map(([userId, loc]) => (
                    <Marker
                        key={userId}
                        position={[loc.latitude, loc.longitude]}
                    >
                        <Popup>
                            <strong>Name:</strong> {loc.name || "Unknown"}<br />
                            <strong>User ID:</strong> {userId}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
        </>
    );
}
