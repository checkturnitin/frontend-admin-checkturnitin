"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils";

const AddBonus = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddBonus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !amount.trim()) {
      toast.error("Please fill out both email and amount fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      toast.error("Bonus amount must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${serverURL}/admin/add-bonus`,
        { email, amount: numericAmount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Bonus successfully added!");
      console.log(response.data);
      setEmail("");
      setAmount("");
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Failed to add bonus. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Add Bonus Credits</h1>
      <form
        onSubmit={handleAddBonus}
        className="bg-white shadow rounded-lg p-6 max-w-md text-black"
      >
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            User Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700"
          >
            Bonus Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter bonus amount"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Bonus"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBonus;
