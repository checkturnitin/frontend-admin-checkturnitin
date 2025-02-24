// pages/admin/UserStats.tsx
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import {
  IconUsers,
  IconChartLine,
  IconCalendarStats,
  IconDownload,
} from "@tabler/icons-react";
import { serverURL } from "@/utils/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  totalUsers: number;
  todayUsers: number;
  weekUsers: number;
  monthUsers: number;
  yearUsers: number;
  userGrowth: { _id: string; count: number }[];
  userTypes: { _id: string; count: number }[];
  userStatuses: { _id: string; count: number }[];
  yoyGrowth: number;
  momGrowth: number;
  wowGrowth: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const UserStatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [period, setPeriod] = useState<"yearly" | "monthly" | "custom">(
    "yearly"
  );

  useEffect(() => {
    const fetchStats = async () => {
      const config = {
        method: "GET",
        url: `${serverURL}/admin/stats/users`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      try {
        const response = await axios(config);
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    fetchStats();
  }, []);

  const fetchCustomStats = async () => {
    if (!startDate || !endDate) return;

    const config = {
      method: "POST",
      url: `${serverURL}/admin/stats/users`,
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
      console.error("Error fetching custom user stats:", error);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start ?? undefined);
    setEndDate(end ?? undefined);
  };

  useEffect(() => {
    if (period === "custom") {
      fetchCustomStats();
    }
  }, [startDate, endDate, period]);

  const downloadCSV = async () => {
    const config = {
      method: "POST",
      url: `${serverURL}/admin/stats/users/download`,
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
      responseType: "blob" as const,
    };

    try {
      const response = await axios(config);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_${period}_${new Date().toISOString()}.csv`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading user stats:", error);
    }
  };

  if (!stats)
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        Loading...
      </div>
    );

  return (
    <div className="container mx-auto p-8 bg-black text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">User Statistics</h1>

      <div className="bg-gray-800 shadow-md rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Download User Data</h2>
        <div className="flex flex-wrap items-end space-x-4 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Period
            </label>
            <select
              value={period}
              onChange={(e) =>
                setPeriod(e.target.value as "yearly" | "monthly" | "custom")
              }
              className="p-2 border rounded-md bg-gray-700 text-white"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {period === "yearly" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="p-2 border rounded-md bg-gray-700 text-white"
              />
            </div>
          )}

          {period === "monthly" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="p-2 border rounded-md bg-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="p-2 border rounded-md bg-gray-700 text-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1, 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {period === "custom" && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Custom Date Range
              </label>
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
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={IconUsers}
        />
        <StatCard
          title="New Users Today"
          value={stats.todayUsers}
          icon={IconUsers}
        />
        <StatCard
          title="New Users This Week"
          value={stats.weekUsers}
          icon={IconUsers}
        />
        <StatCard
          title="New Users This Month"
          value={stats.monthUsers}
          icon={IconUsers}
        />
        <StatCard
          title="New Users This Year"
          value={stats.yearUsers}
          icon={IconUsers}
        />
        <StatCard
          title="Year-over-Year Growth"
          value={stats.yoyGrowth ? `${stats.yoyGrowth.toFixed(2)}%` : "N/A"}
          icon={IconChartLine}
        />
        <StatCard
          title="Month-over-Month Growth"
          value={stats.momGrowth ? `${stats.momGrowth.toFixed(2)}%` : "N/A"}
          icon={IconCalendarStats}
        />

        <StatCard
          title="Week-over-Week Growth"
          value={stats.wowGrowth ? `${stats.wowGrowth.toFixed(2)}%` : "N/A"}
          icon={IconCalendarStats}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-xl p-6 bg-gray-800 shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">User Growth</h2>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="rounded-xl p-6 bg-gray-800 shadow-md">
            <h2 className="text-2xl font-bold mb-4">User Types</h2>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.userTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {stats.userTypes.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl p-6 bg-gray-800 shadow-md">
            <h2 className="text-2xl font-bold mb-4">User Statuses</h2>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.userStatuses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {stats.userStatuses.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserStatsPage;
