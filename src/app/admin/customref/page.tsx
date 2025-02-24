"use client";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils";
import { FiUser, FiKey } from "react-icons/fi";

const CustomizeReferralCode = () => {
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomizeReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !referralCode.trim()) {
      toast.error("Please provide both email and referral code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${serverURL}/admin/customize-referral-code`,
        { email, referralCode },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success("Referral code updated successfully!");
      setEmail("");
      setReferralCode("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to update referral code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <h1 className="text-2xl font-bold mb-6">Customize Referral Code</h1>

      <form
        onSubmit={handleCustomizeReferralCode}
        className="bg-white rounded-lg shadow p-6"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="referralCode"
            className="block text-sm font-medium text-gray-700"
          >
            Referral Code
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="text"
              id="referralCode"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter new referral code"
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Referral Code"}
        </button>
      </form>
    </div>
  );
};

export default CustomizeReferralCode;
