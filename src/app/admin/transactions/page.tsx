"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { serverURL } from "@/utils/utils";

const PaymentGateways = () => {
  const router = useRouter();

  const handleRedirect = (gateway: string) => {
    router.push(`/admin/transactions/${gateway}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Gateways</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-blue-500 p-4 rounded-lg text-white cursor-pointer"
          onClick={() => handleRedirect('fonepay')}
        >
          <h2 className="text-xl font-semibold">Fonepay (NPR)</h2>
          <p>View Fonepay transactions</p>
        </div>
        <div 
          className="bg-green-500 p-4 rounded-lg text-white cursor-pointer"
          onClick={() => handleRedirect('imepay')}
        >
          <h2 className="text-xl font-semibold">IME Pay (NPR)</h2>
          <p>View IME Pay transactions</p>
        </div>
        <div 
          className="bg-purple-500 p-4 rounded-lg text-white cursor-pointer"
          onClick={() => handleRedirect('paddle')}
        >
          <h2 className="text-xl font-semibold">Paddle (USD)</h2>
          <p>View Paddle transactions</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentGateways;