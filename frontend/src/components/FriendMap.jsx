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
import { getAuth } from "firebase/auth";

// Leaflet icon fix
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

// Auto-center on self
const Recenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 15);
    }, [lat, lng]);
    return null;
};

export default function FriendMap() {
    const [myLocation, setMyLocation] = useState(null);
    const [friends, setFriends] = useState({});

    // 🔐 REGISTER (same as HelpMate)
    useEffect(() => {
        const register = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            socket.emit("register-user", { token });
        };

        register();
    }, []);

    // 📍 OWN LOCATION (view only)
    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setMyLocation({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
            },
            (err) => console.error("Geo error:", err),
            { enableHighAccuracy: true }
        );
    }, []);

    // 👥 FRIEND LOCATIONS (ONLY event used in HelpMate)
    useEffect(() => {
        const handleFriendLocation = ({ userId, latitude, longitude, name }) => {
            setFriends((prev) => ({
                ...prev,
                [userId]: { latitude, longitude, name },
            }));
        };

        socket.on("friend-live-location", handleFriendLocation);

        return () => {
            socket.off("friend-live-location", handleFriendLocation);
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
        <div className="w-full h-full flex justify-center bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] pb-15">
            <MapContainer id="map"
                center={defaultCenter}
                zoom={6}
                className="w-[80%] h-[70vh] mt-10"
            >
                <TileLayer
                    attribution="© OpenStreetMap"
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* 🔴 You */}
                {myLocation && (
                    <>
                        <Marker position={[myLocation.latitude, myLocation.longitude]}>
                            <Popup>You are here</Popup>
                        </Marker>
                        <Recenter
                            lat={myLocation.latitude}
                            lng={myLocation.longitude}
                        />
                    </>
                )}

                {/* 👥 Friends */}
                {Object.entries(friends).map(([id, loc]) => (
                    <Marker key={id} position={[loc.latitude, loc.longitude]}>
                        <Popup>
                            <strong>Name:</strong> {loc.name || "Friend"}<br />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
        </>
    );
}
