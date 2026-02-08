import { useEffect, useState, useRef } from "react";
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
    const friendsMarkersRef = useRef({});

    // 🔐 REGISTER (same as HelpMate)
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log("Socket Registering User:", user.uid);
                const token = await user.getIdToken();
                socket.connect();
                socket.emit("register-user", { token });
            }
        });

        return () => unsubscribe();
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

    // 👥 FRIEND LOCATIONS (Optimized with direct Leaflet manipulation)
    const FriendsLayer = () => {
        const map = useMap();

        useEffect(() => {
            const handleFriendLocation = ({ userId, latitude, longitude, name }) => {
                if (friendsMarkersRef.current[userId]) {
                    // Update existing marker
                    friendsMarkersRef.current[userId].setLatLng([latitude, longitude]);
                } else {
                    // Create new marker
                    const marker = L.marker([latitude, longitude])
                        .addTo(map)
                        .bindPopup(`<strong>Name:</strong> ${name || "Friend"}`);
                    friendsMarkersRef.current[userId] = marker;
                }
            };

            const handleDisconnect = ({ userId }) => {
                if (friendsMarkersRef.current[userId]) {
                    friendsMarkersRef.current[userId].remove();
                    delete friendsMarkersRef.current[userId];
                }
            };

            socket.on("friend-live-location", handleFriendLocation);
            socket.on("user-offline", handleDisconnect);

            return () => {
                socket.off("friend-live-location", handleFriendLocation);
                socket.off("user-offline", handleDisconnect);
                // Cleanup markers on unmount
                Object.values(friendsMarkersRef.current).forEach((marker) => marker.remove());
                friendsMarkersRef.current = {};
            };
        }, [map]);

        return null;
    };

    return (
        <div className="w-full h-screen flex justify-center">
            <MapContainer
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

                {/* 👥 Friends Optimized Layer */}
                <FriendsLayer />
            </MapContainer>
        </div>
    );
}
