// pages/admin/PurchaseStats.tsx
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from "framer-motion";
import { IconShoppingCart, IconChartLine, IconCalendarStats, IconCurrencyDollar, IconDownload } from "@tabler/icons-react";
import { serverURL } from '@/utils/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon }) => (
  <div className="rounded-xl p-6 bg-gray-800 shadow-md">
    <div className="flex items-center space-x-4">
      <Icon className="w-8 h-8 text-blue-500" />
      <div>
        <h3 className="text-base font-medium text-gray-300">{title}</h3>
        <p className="text-2xl font-semibold text-gray-100">{value}</p>
      </div>
    </div>
  </div>
);

interface Stats {
  totalPurchases: number;
  todayPurchases: number;
  weekPurchases: number;
  monthPurchases: number;
  yearPurchases: number;
  purchaseGrowth: { _id: string; count: number; totalAmountUSD: number; totalAmountNPR: number }[];
  currencyStats: { _id: string; totalAmount: number; count: number }[];
  yoyGrowth: number;
  momGrowth: number;
  wowGrowth: number;
  dailyPurchases: { _id: string; count: number; totalAmountUSD: number; totalAmountNPR: number }[];
}

const PurchaseStatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [period, setPeriod] = useState<'yearly' | 'monthly' | 'custom'>('yearly');

  useEffect(() => {
    const fetchStats = async () => {
      const config = {
        method: "GET",
        url: `${serverURL}/admin/stats/purchases`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      try {
        const response = await axios(config);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching purchase stats:', error);
      }
    };

    fetchStats();
  }, []);

  const fetchCustomStats = async () => {
    if (!startDate || !endDate) return;

    const config = {
      method: "POST",
      url: `${serverURL}/admin/stats/purchases`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    try {
      const response = await axios(config);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching custom purchase stats:', error);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    if (period === 'custom') {
      fetchCustomStats();
    }
  }, [startDate, endDate, period]);

  const downloadCSV = async () => {
    const config = {
      method: "POST",
      url: `${serverURL}/admin/stats/purchases/download`,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: {
        period,
        year,
        month,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
      responseType: 'blob' as const,
    };

    try {
      const response = await axios(config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `purchases_${period}_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading purchase stats:', error);
    }
  };

  if (!stats) return <div className="flex justify-center items-center h-screen bg-black text-white">Loading...</div>;

  return (
    <div className="container mx-auto p-8 bg-black text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Purchase Statistics</h1>

      <div className="bg-gray-800 shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Download Purchase Data</h2>
        <div className="flex flex-wrap items-end space-x-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'yearly' | 'monthly' | 'custom')}
              className="p-2 border rounded-md bg-gray-700 text-white"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {period === 'yearly' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="p-2 border rounded-md bg-gray-700 text-white"
              />
            </div>
          )}

          {period === 'monthly' && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="p-2 border rounded-md bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="p-2 border rounded-md bg-gray-700 text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {period === 'custom' && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Custom Date Range</label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate ?? undefined}
                endDate={endDate ?? undefined}
                selectsRange
                className="p-2 border rounded-md bg-gray-700 text-white"
              />
            </div>
          )}

          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            <IconDownload className="w-5 h-5 mr-2 inline-block" />
            Download CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Purchases" value={stats.totalPurchases || 0} icon={IconShoppingCart} />
        <StatCard title="Today's Purchases" value={stats.todayPurchases || 0} icon={IconShoppingCart} />
        <StatCard title="This Week's Purchases" value={stats.weekPurchases || 0} icon={IconShoppingCart} />
        <StatCard title="This Month's Purchases" value={stats.monthPurchases || 0} icon={IconShoppingCart} />
        <StatCard title="This Year's Purchases" value={stats.yearPurchases || 0} icon={IconShoppingCart} />
        <StatCard 
          title="Year-over-Year Growth" 
          value={stats.yoyGrowth != null ? `${stats.yoyGrowth.toFixed(2)}%` : 'N/A'} 
          icon={IconChartLine} 
        />
        <StatCard 
          title="Month-over-Month Growth" 
          value={stats.momGrowth != null ? `${stats.momGrowth.toFixed(2)}%` : 'N/A'} 
          icon={IconCalendarStats} 
        />
        <StatCard 
          title="Week-over-Week Growth" 
          value={stats.wowGrowth != null ? `${stats.wowGrowth.toFixed(2)}%` : 'N/A'} 
          icon={IconCalendarStats} 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-xl p-6 bg-gray-800 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Purchase Growth</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.purchaseGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" stroke="#ffffff" />
                <YAxis yAxisId="left" stroke="#ffffff" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#333' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" name="Count" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="totalAmountUSD" name="USD Amount" stroke="#10b981" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="totalAmountNPR" name="NPR Amount" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-gray-800 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Currency Distribution</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.currencyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#333' }} />
                <Bar dataKey="totalAmount" name="Total Amount" fill="#3b82f6" />
                <Bar dataKey="count" name="Count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-gray-800 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Daily Purchases (Last 30 Days)</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyPurchases || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" stroke="#ffffff" />
                <YAxis yAxisId="left" stroke="#ffffff" />
                <YAxis yAxisId="right" orientation="right" stroke="#ffffff" />
                <Tooltip contentStyle={{ backgroundColor: '#333', borderColor: '#333' }} />
                <Line yAxisId="left" type="monotone" dataKey="count" name="Count" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="totalAmountUSD" name="USD Amount" stroke="#10b981" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="totalAmountNPR" name="NPR Amount" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PurchaseStatsPage;