import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { getToken } from "firebase/messaging";
import { messaging } from "../config/firebase-config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [authToken, setAuthToken] = useState("");

  async function requestPermission() {
    console.log(Notification.permission);

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Generate Token
      const token = await getToken(messaging, {
        vapidKey:
          "BFy93njkIu_dB4ocbim87cYBhvbyEHz_LLXtCRL0S5Oua92tTuhzka9S-6dy0Pdxbz2Kl6igP0tnoXkOT8X2zf0",
      });
      console.log("Token Gen", token);
      // Send this token  to server ( db)
    } else if (permission === "denied") {
      alert("You denied for the notification");
      return;
    }
  }

  useEffect(() => {
    // Req user for notification permission
    requestPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuth(true);
        const token = await user.getIdToken();
        setAuthToken(token);

        try {
          // Sync with backend to get Mongoose ID
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}), // Body can be empty, middleware handles token
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


