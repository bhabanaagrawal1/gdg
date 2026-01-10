import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase-config";
import { googleLogin } from "../config/auth"; // Firebase login function
import { useAuth } from "../context/Auth-context";



/*ZOD SCHEMAS*/
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Sign = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const schema = isSignUp ? signUpSchema : signInSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (data) => console.log(isSignUp ? "SIGN UP" : "SIGN IN", data);

  // Ref to form wrapper to measure height
  const formWrapperRef = useRef(null);
  const [forceHeight, setForceHeight] = useState(false);

  useEffect(() => {
    if (!formWrapperRef.current) return;
    const height = formWrapperRef.current.scrollHeight;
    setForceHeight(height > window.innerHeight);
  }, [errors, isSignUp]);

  const navigate = useNavigate();

  useEffect(() => {
  console.log("Firebase Auth object:", auth);
}, []);

const { isAuth } = useAuth();

useEffect(() => {
    if (isAuth) navigate("/home"); // redirect if logged in
  }, [isAuth,navigate]);

const handleGoogleLogin = async () => {
  try {
    await googleLogin();   // opens Google popup
    // After login, onAuthStateChanged in AuthContext fires
    // Then isAuth becomes true automatically
    navigate("/home");         // redirect to home/dashboard
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div
      className={`w-full bg-white flex justify-center ${
        forceHeight ? "items-start" : "items-center"
      } h-screen`}
    >
      <div className="flex flex-col md:flex-row w-full h-screen">


        {/* LEFT IMAGE */}
        <div className="w-full md:w-1/2">
          <img
            src="https://i.pinimg.com/736x/75/fe/3d/75fe3d3f83e0878e500596e21b004f3e.jpg"
            alt="Visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT FORM */}
        <div
          className="w-full md:w-1/2 flex justify-center items-center"
          ref={formWrapperRef}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md px-8 flex flex-col gap-4 text-black"
          >
            <h2 className="text-4xl text-center font-semibold mb-2 mt-7">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            {isSignUp && (
              <>
                <input
                  {...register("name")}
                  placeholder="Full Name"
                  className="rounded-xl px-4 py-3 border border-black/20 outline-none focus:border-[#A7C7E7]"
                />
                {errors.name && (
                  <p className="text-[12px] text-[#A7C7E7]">{errors.name.message}</p>
                )}
              </>
            )}

            <input
              {...register("email")}
              placeholder="Email"
              className="rounded-xl px-4 py-3 border border-black/20 outline-none focus:border-[#A7C7E7]"
            />
            {errors.email && (
              <p className="text-[12px] text-[#A7C7E7]">{errors.email.message}</p>
            )}

            <input
              type="password"
              {...register("password")}
              placeholder="Password"
              className="rounded-xl px-4 py-3 border border-black/20 outline-none focus:border-[#A7C7E7]"
            />
            {errors.password && (
              <p className="text-[12px] text-[#A7C7E7]">{errors.password.message}</p>
            )}

            <button
              type="submit"
              className="rounded-xl bg-[#A7C7E7] py-3 text-white font-medium"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>

            {/* OR */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px bg-black/30" />
              <span className="text-sm font-medium">OR</span>
              <div className="flex-1 h-px bg-black/30" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#A7C7E7] py-3 text-white font-medium"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 bg-white rounded-full p-0.5"
              />
              Continue with Google
            </button>

            {/* Toggle */}
            <p className="text-sm text-center mt-4 mb-5">
              {isSignUp
                ? "Already have an account?"
                : "Don’t have an account?"}
              <span
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-1 underline cursor-pointer font-medium"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Sign;
