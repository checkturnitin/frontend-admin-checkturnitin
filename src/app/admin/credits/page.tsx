"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FiCreditCard,
  FiSearch,
  FiCalendar,
  FiRefreshCw,
  FiFilter,
} from "react-icons/fi";
import { serverURL } from "@/utils/utils";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CreditTransactionData {
  _id: string;
  date: string;
  user: string;
  email: string;
  type: string;
  amount: number;
}

interface TodayUsageData {
  _id: string;
  totalAmount: number;
}

export default function CreditTransactionsPage() {
  const [transactions, setTransactions] = useState<CreditTransactionData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: "",
    endDate: "",
    email: "",
    type: "",
  });
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [todayUsage, setTodayUsage] = useState<TodayUsageData[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  // Limit for pagination
  const limit = 10;

  // Transaction types including credit_referral
  const transactionTypes = [
    "credit_added",
    "credit_used",
    "credit_purchase",
    "credit_bonus",
    "credit_referral", // Ensure this is included
    "credit_reused",
  ];

  // Fetch transactions with search params
  const fetchTransactions = async (pageNumber: number, params = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${serverURL}/admin/credit-transactions`,
        {
          params: { page: pageNumber, limit, ...params },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setTransactions(response.data.transactionsData);
      setTotalPages(response.data.totalPages);
      setTotalTransactions(response.data.totalTransactions);
      setTodayUsage(response.data.todayUsage);
      setTopUsers(response.data.topUsers);
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      toast.error("Failed to fetch credit transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on page load
  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions(1, searchParams);
  };

  // Handle reset of filters
  const handleReset = () => {
    setSearchParams({ startDate: "", endDate: "", email: "", type: "" });
    setPage(1);
    fetchTransactions(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FiCreditCard className="mr-2" /> Credit Transactions
        </h1>
      </header>

      {/* Search Filters */}
      <div className="mb-6 bg-gray-800 shadow rounded-lg p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-end space-x-4"
        >
          {/* Date Range Filter */}
          <div className="flex-grow min-w-[200px] mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiCalendar className="inline mr-1" /> Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) =>
                  setSearchParams({
                    ...searchParams,
                    startDate: e.target.value,
                  })
                }
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
              />
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, endDate: e.target.value })
                }
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
              />
            </div>
          </div>

          {/* Email Filter */}
          <div className="flex-grow min-w-[200px] mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiSearch className="inline mr-1" /> Email Search
            </label>
            <input
              type="text"
              placeholder="Search by email"
              value={searchParams.email}
              onChange={(e) =>
                setSearchParams({ ...searchParams, email: e.target.value })
              }
              className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
            />
          </div>

          {/* Transaction Type Filter */}
          <div className="flex-grow min-w-[200px] mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiFilter className="inline mr-1" /> Transaction Type
            </label>
            <select
              value={searchParams.type}
              onChange={(e) =>
                setSearchParams({ ...searchParams, type: e.target.value })
              }
              className="form-select mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
            >
              <option value="">All Types</option>
              {transactionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ")} {/* Display as human-readable */}
                </option>
              ))}
            </select>
          </div>

          {/* Search and Reset Buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              <FiRefreshCw className="inline mr-1" /> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Today's Usage and Top Users */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart for Today's Usage */}
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={todayUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{ backgroundColor: "#333", borderColor: "#333" }}
              />
              <Legend />
              <Bar dataKey="totalAmount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Users List */}
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Top Users Today</h2>
          <ul>
            {topUsers.map((user) => (
              <li key={user._id} className="mb-2">
                <span className="font-medium">{user.name}</span> ({user.email}):{" "}
                {user.totalSpent}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          {/* Table for Transactions */}
          <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              {/* Table Headers */}
              <thead className="bg-gray-700">
                <tr>
                  {["#", "Date", "User", "Email", "Type", "Amount"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {transactions.map((transaction, index) => (
                  <tr key={transaction._id} className="hover:bg-gray-700">
                    {/* Row Data */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray_300">
                      {totalTransactions - (page - 1) * limit - index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                      {transaction.user}
                    </td>
                    {/* Email with mailto link */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link
                        href={`mailto:${transaction.email}`}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        {transaction.email}
                      </Link>
                    </td>
                    {/* Type with human-readable format */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.type.replace("_", " ")}
                    </td>
                    {/* Amount */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            {/* Previous Button */}
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l"
            >
              Previous
            </button>

            {/* Page Info */}
            <span className="text-sm text-gray-300">
              Page {page} of {totalPages}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
