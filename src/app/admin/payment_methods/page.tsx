"use client";
import axios from "axios";
import { serverURL } from "@/utils/utils";
import { FiCreditCard } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

type PaymentMethodData = {
  enabled: boolean;
  currencies: string[];
};

type PaymentMethods = {
  stripe: PaymentMethodData;
  paddle: PaymentMethodData;
  imepay: PaymentMethodData;
  esewa: PaymentMethodData;
  khalti: PaymentMethodData;
  fonepay: PaymentMethodData;
};

const PaymentMethodIcons: { [key: string]: string } = {
  stripe: "/payment-icons/stripe.svg",
  paddle: "/payment-icons/paddle.svg",
  imepay: "/payment-icons/imepay.svg",
  esewa: "/payment-icons/esewa.svg",
  khalti: "/payment-icons/khalti.svg",
  fonepay: "/payment-icons/fonepay.svg",
};

export default function Page() {
  const [data, setData] = useState<PaymentMethods | null>(null);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    setLoading(true);
    const config = {
      method: "GET",
      url: `${serverURL}/admin/payment-methods`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    };

    try {
      const response = await axios(config);
      setData(response.data);
    } catch (error) {
      toast.error("Error fetching payment methods");
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updatedData: PaymentMethods) => {
    setLoading(true);
    const config = {
      method: "POST",
      url: `${serverURL}/admin/payment-methods`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      data: updatedData,
    };

    try {
      const response = await axios(config);
      setData(response.data);
      toast.success("Payment method updated successfully");
    } catch (error) {
      toast.error("Error saving payment methods");
      console.error("Error saving payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleToggle = (method: keyof PaymentMethods) => {
    if (data) {
      const updatedData = {
        ...data,
        [method]: { ...data[method], enabled: !data[method].enabled },
      };
      setData(updatedData);
      saveData(updatedData);
    }
  };

  const getPaymentMethodDescription = (method: string): string => {
    const descriptions: { [key: string]: string } = {
      stripe: "International payments in USD",
      paddle: "Global payment processing in USD",
      imepay: "Domestic payments in NPR",
      esewa: "Digital wallet payments in NPR",
      khalti: "Mobile payment gateway in NPR",
      fonepay: "Digital payment network in NPR",
    };
    return descriptions[method] || "Payment gateway";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FiCreditCard className="text-emerald-400" />
            Payment Methods
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your available payment methods and their settings
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {data &&
            Object.entries(data)
              .filter(([method]) =>
                ["stripe", "paddle", "imepay", "esewa", "khalti", "fonepay"].includes(method)
              )
              .map(([method, details], index) => (
                <motion.div
                  key={method}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                        {PaymentMethodIcons[method] ? (
                          <img
                            src={PaymentMethodIcons[method]}
                            alt={method}
                            className="w-6 h-6"
                          />
                        ) : (
                          <FiCreditCard className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {method}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {getPaymentMethodDescription(method)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Supported currencies: {details.currencies?.join(", ")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(method as keyof PaymentMethods)}
                      className={`transition-all duration-300 px-4 py-2 rounded-full font-medium ${
                        details.enabled
                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {details.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </motion.div>
              ))}
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}