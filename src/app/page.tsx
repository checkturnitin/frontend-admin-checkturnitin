"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { serverURL } from "@/utils/utils";

const quotes = [
  "Empowering AI, Empowering You",
  "Innovate with Intelligence",
  "Shaping the Future of AI",
  "Smart Solutions for a Smarter World",
  "Unleashing the Power of AI",
];

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quote, setQuote] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      setIsLoggedIn(true);
      router.push("/admin/dashboard");
    }
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const login = async () => {
    try {
      const response = await axios.post(`${serverURL}/users/admin-login`, {
        email,
        password,
      });
      toast.success("Logged In!");
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      router.push("/admin/dashboard");
    } catch (error) {
      console.log(error);
      toast.error("Email or Password is wrong");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-indigo-700 flex flex-col justify-center items-center text-white p-12">
        <h1 className="text-5xl font-bold mb-6">CheckTurnitin Admin</h1>
        <p className="text-2xl italic">{quote}</p>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        {isLoggedIn ? (
          <div className="text-center">
            <p className="text-2xl mb-6 font-semibold text-indigo-700">Welcome to the Admin Panel!</p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-800 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 max-w-md w-full border border-gray-200">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6">Admin Login</h2>
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-4"
              placeholder="Enter your email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <input
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 mb-4"
              placeholder="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <button
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg transition-all duration-300 mb-4 hover:bg-indigo-800"
              onClick={login}
            >
              Login
            </button>
            <div className="flex justify-end">
              <Link href="/forgotpassword" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot Password?
              </Link>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
}
