// src/app/admin/stats/credits/page.tsx
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
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  IconCreditCard,
  IconChartLine,
  IconCalendarStats,
  IconDownload,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconCoin,
  IconUsers,
} from "@tabler/icons-react";
import { serverURL } from "@/utils/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number | null;
  subtitle?: string;
  status?: "success" | "warning" | "error";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  status,
}) => (
  <div
    className={`rounded-xl p-6 bg-gray-800 shadow-md ${
      status === "error"
        ? "border-red-500 border-2"
        : status === "warning"
        ? "border-yellow-500 border-2"
        : status === "success"
        ? "border-green-500 border-2"
        : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-base font-medium text-gray-300">{title}</h3>
        <p className="text-2xl font-semibold text-gray-100">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        {trend !== undefined && trend !== null && (
          <p
            className={`text-sm ${
              trend >= 0 ? "text-green-400" : "text-red-400"
            } mt-1`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
          </p>
        )}
      </div>
      <Icon
        className={`w-8 h-8 ${
          status === "error"
            ? "text-red-500"
            : status === "warning"
            ? "text-yellow-500"
            : status === "success"
            ? "text-green-500"
            : "text-blue-500"
        }`}
      />
    </div>
  </div>
);

interface ValidationStats {
  isBalanced: boolean;
  currentBalance: number;
  expectedBalance: number;
  difference: number;
  breakdown: {
    totalAdded: number;
    totalUsed: number;
    byType: {
      [key: string]: {
        total: number;
        count: number;
      };
    };
  };
}

interface Stats {
  systemBalance: {
    total: number;
    used: number;
    available: number;
    isBalanced: boolean;
    expectedBalance: number;
    difference: number;
  };
  usage: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  growth: {
    yoy: number | null;
    mom: number | null;
    wow: number | null;
  };
  creditTypes: {
    _id: string;
    total: number;
    count: number;
  }[];
  creditGrowth: {
    period: string;
    added: number;
    used: number;
  }[];
  topUsers: {
    id: string;
    name: string;
    email: string;
    credits: number;
  }[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const CreditStatsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [validation, setValidation] = useState<ValidationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([fetchStats(), fetchValidation()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${serverURL}/admin/stats/credits`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching credit stats:", error);
      setError("Failed to fetch statistics");
    }
  };

  const fetchValidation = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/admin/stats/credits/validation`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setValidation(response.data);
    } catch (error) {
      console.error("Error fetching validation:", error);
      setError("Failed to fetch system validation");
    }
  };

  const downloadData = async (type: string) => {
    try {
      const response = await axios.get(
        `${serverURL}/admin/stats/credits/download/${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `credit_${type}_${new Date().toISOString()}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(`Error downloading ${type}:`, error);
      setError(`Failed to download ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <IconAlertTriangle className="w-6 h-6 mr-2 text-red-500" />
        {error}
      </div>
    );
  }

  if (!stats || !validation) return null;

  return (
    <div className="container mx-auto p-8 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Credit Statistics</h1>
        <div className="space-x-4">
          <button
            onClick={() => downloadData("balances")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            <IconDownload className="w-5 h-5 mr-2 inline-block" />
            Download Balances
          </button>
          <button
            onClick={() => downloadData("transactions")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
          >
            <IconDownload className="w-5 h-5 mr-2 inline-block" />
            Download Transactions
          </button>
        </div>
      </div>

      {/* System Validation Status */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <div className="flex items-center mb-4">
          {validation.isBalanced ? (
            <IconCheck className="w-8 h-8 text-green-500 mr-2" />
          ) : (
            <IconX className="w-8 h-8 text-red-500 mr-2" />
          )}
          <h2 className="text-2xl font-bold">System Validation Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Current Balance"
            value={validation.currentBalance}
            icon={IconCreditCard}
            status={validation.isBalanced ? "success" : "error"}
          />
          <StatCard
            title="Expected Balance"
            value={validation.expectedBalance}
            icon={IconCreditCard}
            status={validation.isBalanced ? "success" : "warning"}
          />
          <StatCard
            title="Difference"
            value={validation.difference}
            icon={IconCreditCard}
            status={validation.difference === 0 ? "success" : "error"}
            subtitle={
              validation.isBalanced
                ? "System is balanced"
                : "Needs reconciliation"
            }
          />
        </div>
      </div>

      {/* Credit Type Breakdown */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Credit Type Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(validation.breakdown.byType).map(([type, data]) => (
            <StatCard
              key={type}
              title={type.replace("_", " ").toUpperCase()}
              value={data.total}
              icon={IconCoin}
              subtitle={`${data.count} transactions`}
            />
          ))}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Usage"
          value={stats.usage.today}
          icon={IconCreditCard}
        />
        <StatCard
          title="Weekly Usage"
          value={stats.usage.week}
          icon={IconCreditCard}
          trend={stats.growth.wow}
        />
        <StatCard
          title="Monthly Usage"
          value={stats.usage.month}
          icon={IconCreditCard}
          trend={stats.growth.mom}
        />
        <StatCard
          title="Yearly Usage"
          value={stats.usage.year}
          icon={IconCreditCard}
          trend={stats.growth.yoy}
        />
      </div>

      {/* Credit Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Credit Growth Over Time</h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <LineChart data={stats.creditGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="added"
                name="Credits Added"
                stroke="#0088FE"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="used"
                name="Credits Used"
                stroke="#00C49F"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Credit Types Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Credit Types Distribution</h2>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={stats.creditTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="total"
                nameKey="_id"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(1)}%)`
                }
              >
                {stats.creditTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800 rounded-xl p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-4">Top Credit Users</h2>
        <div className="grid grid-cols-1 gap-4">
          {stats.topUsers.map((user, index) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center">
                <IconUsers className="w-6 h-6 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {user.credits.toLocaleString()} credits
                </p>
                <p className="text-sm text-gray-400">Rank #{index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default CreditStatsPage;
