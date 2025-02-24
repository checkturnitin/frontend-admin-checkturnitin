"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { serverURL } from "@/utils/utils";
import { FiCreditCard, FiDollarSign, FiHome, FiShoppingCart, FiUsers } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const currencySymbols: Record<string, string> = {
  USD: "$",
  NPR: "₨",
};

type DashboardData = {
  items: number;
  users: number;
  purchasesByCurrency: Record<string, number>;
  purchaseCountByCurrency: Record<string, number>;
  todayPurchasesByCurrency: Record<string, number>;
  todayPurchaseCountByCurrency: Record<string, number>;
};

const DashboardCard = ({
  icon: Icon,
  title,
  value,
  link,
}: {
  icon: React.ElementType;
  title: string;
  value: number;
  link: string;
}) => (
  <Link href={link}>
    <Card className="hover:shadow-lg transition-all duration-300 bg-gray-800 border border-gray-700">
      <CardHeader className="flex items-center gap-4">
        <Icon className="text-blue-400 text-3xl" />
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-white">{value > 0 ? value.toLocaleString() : "N/A"}</p>
      </CardContent>
    </Card>
  </Link>
);

const EarningsCard = ({
  currency,
  amount,
  todayAmount,
  todayCount,
}: {
  currency: string;
  amount: number;
  todayAmount: number;
  todayCount: number;
}) => (
  <Card className="bg-gray-800 border border-gray-700 flex-1">
    <CardHeader>
      <CardTitle className="text-white text-lg">{currency} Earnings</CardTitle>
    </CardHeader>
    <CardContent className="text-center">
      <p className="text-3xl font-bold text-blue-400">
        {currencySymbols[currency]} {amount > 0 ? amount.toLocaleString() : "N/A"}
      </p>
      <div className="mt-3 text-gray-400">
        <p>Today: {currencySymbols[currency]} {todayAmount > 0 ? todayAmount.toLocaleString() : "N/A"}</p>
        <p>Today's Purchases: {todayCount > 0 ? todayCount : "N/A"}</p>
      </div>
    </CardContent>
  </Card>
);

export default function Page() {
  const adminPath = "/admin";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const response = await axios.get(`${serverURL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FiHome className="mr-2" /> Dashboard
          </h1>
          <Button variant="outline" className="text-white border-gray-600">Refresh</Button>
        </div>
        <p className="text-lg text-gray-400 mb-8">{today}</p>

        {/* Earnings Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading
            ? Array(3)
                .fill(null)
                .map((_, i) => <Skeleton key={i} className="h-36 bg-gray-700 rounded-lg" />)
            : data?.purchasesByCurrency &&
              Object.entries(data.purchasesByCurrency).map(([currency, amount]) => (
                <EarningsCard
                  key={currency}
                  currency={currency}
                  amount={amount}
                  todayAmount={data.todayPurchasesByCurrency[currency] || 0}
                  todayCount={data.todayPurchaseCountByCurrency[currency] || 0}
                />
              ))}
        </div>

        {/* Dashboard Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <Skeleton className="h-28 bg-gray-700 rounded-lg" />
              <Skeleton className="h-28 bg-gray-700 rounded-lg" />
            </>
          ) : (
            <>
              <DashboardCard
                icon={FiShoppingCart}
                title="Shop Items"
                value={data?.items || 0}
                link={`${adminPath}/shop`}
              />
              <DashboardCard
                icon={FiUsers}
                title="Users"
                value={data?.users || 0}
                link={`${adminPath}/users`}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
