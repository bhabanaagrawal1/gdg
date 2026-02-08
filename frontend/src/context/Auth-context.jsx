import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase-config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [authToken, setAuthToken] = useState("");

  async function requestPermission() {
    try {
      console.log(Notification.permission);

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Generate Token
        let token;
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          token = await getToken(messaging, {
            vapidKey: "BFy93njkIu_dB4ocbim87cYBhvbyEHz_LLXtCRL0S5Oua92tTuhzka9S-6dy0Pdxbz2Kl6igP0tnoXkOT8X2zf0",
            serviceWorkerRegistration: registration
          });
        } else {
          token = await getToken(messaging, {
            vapidKey: "BFy93njkIu_dB4ocbim87cYBhvbyEHz_LLXtCRL0S5Oua92tTuhzka9S-6dy0Pdxbz2Kl6igP0tnoXkOT8X2zf0",
          });
        }
        console.log("Token Gen", token);
        return token;
      } else if (permission === "denied") {
        alert("You denied for the notification");
        return null;
      }
    } catch (error) {
      console.error("Error requesting permission or getting token:", error);
      return null;
    }
  }

  useEffect(() => {
    // Req user for notification permission
    requestPermission();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground Message received: ", payload);
      // Optional: Show a toast or in-app notification here
      // alert(`New Notification: ${payload.notification?.title}`);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuth(true);
        const token = await user.getIdToken();
        setAuthToken(token);

        try {
          // Get FCM Token before syncing
          const fcmToken = await requestPermission();

          // Sync with backend to get Mongoose ID
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            // Include fcmToken in the body
            body: JSON.stringify({ fcmToken }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.userdetails && data.userdetails.uid) {
              localStorage.setItem("mongo_id", data.userdetails.uid);
              console.log("Synced with backend. Mongo ID:", data.userdetails.uid);
            }
          }
        } catch (error) {
          console.error("Backend sync failed:", error);
        }


      } else {
        setIsAuth(false);
        setAuthToken("");
        localStorage.removeItem("mongo_id");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
