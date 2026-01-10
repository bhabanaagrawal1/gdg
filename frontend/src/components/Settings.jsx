import React, { useEffect, useState } from "react";
import { z } from "zod";
import { auth } from "../config/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth-context";

/* ================= ZOD ================= */

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
});

const uidSchema = z
  .string()
  .min(4, "UID too short")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid UID format");

/* ================= COMPONENT ================= */

const Settings = () => {
  const navigate = useNavigate();
  const { authToken } = useAuth();

  const [profile, setProfile] = useState({
    uid: "",
    fullName: "",
    email: "",
  });

  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [newUID, setNewUID] = useState("");

  /* ================= AUTH + PROFILE ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      // 1. Set basic info from Firebase (fallback)
      let name = user.displayName || "";
      let email = user.email || "";
      let displayedUid = user.uid; // Default to Firebase UID

      // 2. Fetch latest from Backend DB
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.name) name = data.name;
          if (data.email) email = data.email;
          if (data.uid) displayedUid = data.uid; // Prefer MongoDB ID from backend
          console.log("Fetched profile from DB:", data);
        }
      } catch (err) {
        console.error("Failed to fetch profile from backend:", err);
      }

      setProfile({
        uid: displayedUid,
        fullName: name,
        email: email,
      });
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= PROFILE SAVE ================= */

  const saveProfile = async () => {
    setError("");

    const validation = profileSchema.safeParse({
      fullName: profile.fullName,
      email: profile.email,
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setSaving(true);

    await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        name: profile.fullName,
        email: profile.email,
      }),
    });

    setSaving(false);
    setEditing(false);
  };

  /* ================= CONTACTS ================= */

  const addUID = () => {
    setError("");

    const valid = uidSchema.safeParse(newUID);
    if (!valid.success) {
      setError(valid.error.errors[0].message);
      return;
    }

    if (contacts.includes(newUID)) {
      setError("UID already added");
      return;
    }

    setContacts([...contacts, newUID]);
    setNewUID("");
  };

  const removeUID = (uid) => {
    setContacts(contacts.filter((u) => u !== uid));
  };

  const saveContacts = async () => {
    await fetch(`${import.meta.env.VITE_BACKEND_URL}api/user/addfriends`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ friends: contacts }),
    });
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f4f8fc] to-[#eef3f9] px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-sm p-6 sm:p-10">
        <h1 className="text-3xl font-bold mb-8">
          Settings <span className="text-[#a7c7e7]">Profile</span>
        </h1>

        {/* UID */}
        <label className="text-xs text-gray-500">Your UID</label>
        <input
          value={profile.uid}
          disabled
          className="w-full mb-5 px-4 py-3 rounded-xl bg-[#f2f6fb] cursor-not-allowed"
        />

        {/* NAME */}
        <label className="text-xs text-gray-500">Full Name</label>
        <input
          value={profile.fullName}
          disabled={!editing}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
          className={`w-full mb-4 px-4 py-3 rounded-xl ${editing
            ? "border focus:ring-2 focus:ring-[#a7c7e7] outline-none"
            : "bg-[#f2f6fb]"
            }`}
        />

        {/* EMAIL */}
        <label className="text-xs text-gray-500">Email</label>
        <input
          value={profile.email}
          disabled={!editing}
          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          className={`w-full mb-4 px-4 py-3 rounded-xl ${editing
            ? "border focus:ring-2 focus:ring-[#a7c7e7] outline-none"
            : "bg-[#f2f6fb]"
            }`}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-6 py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="flex-1 px-6 py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 px-6 py-3 rounded-xl bg-gray-100"
            >
              Cancel
            </button>
          </div>
        )}

        {/* CONTACTS */}
        <h2 className="mt-10 mb-4 text-[#a7c7e7] font-semibold">
          Emergency Contacts (UIDs)
        </h2>

        {contacts.map((uid) => (
          <div
            key={uid}
            className="flex justify-between items-center bg-[#f2f6fb] px-4 py-3 rounded-xl mb-2"
          >
            <span className="font-mono text-sm">{uid}</span>
            <button onClick={() => removeUID(uid)}>✕</button>
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <input
            value={newUID}
            onChange={(e) => setNewUID(e.target.value)}
            placeholder="Enter user UID"
            className="flex-1 px-4 py-3 rounded-xl bg-[#f2f6fb] focus:ring-2 focus:ring-[#a7c7e7] outline-none"
          />
          <button
            onClick={addUID}
            className="px-6 py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold"
          >
            Add
          </button>
        </div>

        <button
          onClick={saveContacts}
          className="mt-6 px-6 py-3 rounded-xl bg-[#a7c7e7] text-white font-semibold"
        >
          Save Emergency Contacts
        </button>
      </div>
    </div>
  );
};

export default Settings;
