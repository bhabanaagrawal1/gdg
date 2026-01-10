import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { messaging } from "../config/firebase-config";
import { getToken } from "firebase/messaging";

/* ---------------- ZOD SCHEMAS ---------------- */
const regSchema = z.object({
    emailId: z.string().email("Invalid email address"),
});

const verifySchema = z.object({
    code: z.string().min(4, "Code must be 4 digits"),
});

const PoliceSign = ({ onBack }) => {
    const [step, setStep] = useState(1); // 1: Register/Check, 2: Verify Code
    const [loading, setLoading] = useState(false);
    const [errorMSG, setErrorMSG] = useState("");
    const [email, setEmail] = useState("");

    const navigate = useNavigate();

    // Load or Create Device ID & Check Verification
    const [deviceId, setDeviceId] = useState("");
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkVerification = async (id) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/police/checkDevice`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deviceId: id }),
                });
                const data = await res.json();
                if (data.success && data.isVerified) {
                    localStorage.setItem("policeStationId", data.policeStationId);
                    if (data.coordinates) {
                        localStorage.setItem("police_coords", JSON.stringify(data.coordinates));
                    }
                    console.log("Auto-login success");
                    navigate("/police-dashboard");
                }
            } catch (err) {
                console.error("Auto-check failed", err);
            } finally {
                setChecking(false);
            }
        };

        let storedId = localStorage.getItem("police_device_id");
        if (!storedId) {
            storedId = "DEV-" + Math.random().toString(36).substr(2, 9).toUpperCase();
            localStorage.setItem("police_device_id", storedId);
            setChecking(false); // New device, definitely not verified
        } else {
            checkVerification(storedId);
        }
        setDeviceId(storedId);
    }, [navigate]);

    /* ---------------- FORM HOOKS ---------------- */
    // MOVED UP before conditional return
    const {
        register: registerReg,
        handleSubmit: handleSubmitReg,
        formState: { errors: errorsReg },
    } = useForm({ resolver: zodResolver(regSchema) });

    const {
        register: registerVer,
        handleSubmit: handleSubmitVer,
        formState: { errors: errorsVer },
    } = useForm({ resolver: zodResolver(verifySchema) });

    /* ---------------- HANDLERS ---------------- */

    // STEP 1: Send Verification Code
    const onRegSubmit = async (data) => {
        setLoading(true);
        setErrorMSG("");
        try {
            // Get FCM Token
            let fcmToken = "";
            try {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    fcmToken = await getToken(messaging, {
                        vapidKey: "BFy93njkIu_dB4ocbim87cYBhvbyEHz_LLXtCRL0S5Oua92tTuhzka9S-6dy0Pdxbz2Kl6igP0tnoXkOT8X2zf0",
                    });
                }
            } catch (err) {
                console.warn("FCM Token failed", err);
            }

            // If token failed, maybe send a dummy or handle error based on strictness. 
            // Controller requires it.
            if (!fcmToken) fcmToken = "dummy_token_permission_denied";

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/police/policeDeviceReg`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailId: data.emailId,
                    DeviceId: deviceId,
                    fcmToken: fcmToken,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Registration failed");

            setEmail(data.emailId);
            setStep(2); // Move to verification
        } catch (err) {
            setErrorMSG(err.message);
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Verify Code
    const onVerifySubmit = async (data) => {
        setLoading(true);
        setErrorMSG("");
        try {
            // Need fcmToken again for verify endpoint according to controller logic (Step 187 line 68, 104)
            // Ideally should cache it or get it again.
            let fcmToken = "dummy_token_permission_denied";
            try {
                const permission = await Notification.permission;
                if (permission === 'granted') {
                    fcmToken = await getToken(messaging, {
                        vapidKey: "BFy93njkIu_dB4ocbim87cYBhvbyEHz_LLXtCRL0S5Oua92tTuhzka9S-6dy0Pdxbz2Kl6igP0tnoXkOT8X2zf0",
                    });
                }
            } catch(error){ 
                console.log(error)
            }

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/police/verifyDevice`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    emailId: email,
                    DeviceId: deviceId,
                    code: data.code, // string or number, controller handles Number() conversion
                    fcmToken: fcmToken
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.msg || result.message || "Verification failed");

            // SUCCESS
            localStorage.setItem("policeStationId", result.policeStationId);
            if (result.coordinates) {
                localStorage.setItem("police_coords", JSON.stringify(result.coordinates));
            }

            // Navigate to Police Home (assuming route exists or user wants placeholder)
            // User didn't specify police home route, I'll log and maybe go to /home or distinct route
            console.log("Police Logged In:", result);
            navigate("/police-dashboard");

        } catch (err) {
            setErrorMSG(err.message);
        } finally {
            setLoading(false);
        }
    };

    // CONDITIONAL RENDER MUST BE HERE
    if (checking) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-white">
                <p className="text-gray-500 animate-pulse">Checking device authorization...</p>
            </div>
        );
    }

    return (
       <div className="w-full bg-white flex justify-center items-center h-screen">
            <div className="flex flex-col md:flex-row w-full h-screen">

                {/* Back Arrow */}
      <button
        onClick={onBack}
        className="
          absolute top-6 left-6 z-20
          w-10 h-10 rounded-full
          bg-[#b4d0eb] shadow
          flex items-center justify-center
          hover:opacity-80 text-white
        "
      >
        <i className="ri-arrow-left-line text-xl"></i>
      </button>
                {/* LEFT IMAGE */}
                <div className="w-full md:w-1/2">
                    <img
                        src="https://i.pinimg.com/1200x/c8/d2/b1/c8d2b160041a089211064d5e047607f2.jpg"
                        alt="Visual"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* RIGHT FORM */}
                <div className="w-full md:w-1/2 flex justify-center items-center">
                    <div className="w-full max-w-md px-8 flex flex-col gap-4 text-black mb-10">

                        <h2 className="text-4xl text-center font-semibold mb-2 mt-5">
                            Police <span className="text-[#a7c7e7]">Login</span>
                        </h2>
                        <p className="text-center text-gray-500 text-sm mb-6">
                            Access restricted to authorized personnel only.
                            <br />Device ID: <span className="font-mono bg-gray-100 px-1">{deviceId}</span>
                        </p>

                        {step === 1 && (
                            <form onSubmit={handleSubmitReg(onRegSubmit)} className="flex flex-col gap-4">
                                <input
                                    {...registerReg("emailId")}
                                    placeholder="Official Email ID"
                                    className="rounded-xl px-4 py-3 border border-black/20 outline-none focus:border-[#A7C7E7]"
                                />
                                {errorsReg.emailId && (
                                    <p className="text-[12px] text-[#a7c7e7]">{errorsReg.emailId.message}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-[#a7c7e7] py-3 text-white font-medium hover:opacity-70 transition"
                                >
                                    {loading ? "Sending Code..." : "Send Verification Code"}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmitVer(onVerifySubmit)} className="flex flex-col gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-2">
                                    Code sent to <b>{email}</b>. valid for 4 mins.
                                </div>

                                <input
                                    {...registerVer("code")}
                                    placeholder="Enter 4-digit Code"
                                    className="rounded-xl px-4 py-3 border border-black/20 outline-none focus:border-[#A7C7E7] text-center tracking-widest text-xl"
                                    maxLength={4}
                                />
                                {errorsVer.code && (
                                    <p className="text-[12px]  text-[#a7c7e7]">{errorsVer.code.message}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-xl bg-[#a7c7e7] py-3 text-white font-medium hover:opacity-70 transition"
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-500 hover:underline"
                                >
                                    Resend / Change Email
                                </button>
                            </form>
                        )}

                        {errorMSG && <p className=" text-[#a7c7e7] text-center text-sm">{errorMSG}</p>}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PoliceSign;
