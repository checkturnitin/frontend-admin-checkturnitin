// src/app/admin/transactions/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FiDollarSign,
  FiSearch,
  FiCalendar,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import { serverURL } from "@/utils/utils";
import "react-toastify/dist/ReactToastify.css";

interface TransactionData {
  _id: string;
  merchantCode: string;
  productReferenceNumber: string;
  amountRequested: number;
  amountPaid: string;
  requestDate: string;
  responseDate: string;
  transactionUuid: string;
  traceId: string;
  status: string;
  itemTitle: string;
  userName: string;
  userEmail: string;
}

interface SearchParams {
  startDate: string;
  endDate: string;
  email: string;
  prn: string;
  uid: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: "",
    endDate: "",
    email: "",
    prn: "",
    uid: "",
  });
  const [totalTransactions, setTotalTransactions] = useState(0);

  const limit = 10;

  // Fetch transactions from the server
  const fetchTransactions = async (pageNumber: number, params: SearchParams) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${serverURL}/admin/fonepay-transactions`, {
        params: { ...params, page: pageNumber, limit },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setTransactions(response.data.transactionsData);
      setTotalPages(response.data.totalPages);
      setTotalTransactions(response.data.totalTransactions);
    } catch (error) {
      console.error("Error fetching Fonepay transactions:", error);
      toast.error("Failed to fetch Fonepay transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, searchParams);
  }, [page]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions(1, searchParams);
  };

  // Reset search parameters and reload transactions
  const handleReset = () => {
    const resetParams = {
      startDate: "",
      endDate: "",
      email: "",
      prn: "",
      uid: "",
    };
    setSearchParams(resetParams);
    setPage(1);
    fetchTransactions(1, resetParams);
  };

  // Recheck transaction status
  const handleRecheck = async (transaction: TransactionData) => {
    try {
      const response = await axios.post(
        `${serverURL}/admin/fonepay-recheck-transaction`,
        { prn: transaction.productReferenceNumber },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      toast.success(response.data.message);
      fetchTransactions(page, searchParams);
    } catch (error) {
      console.error("Error rechecking Fonepay transaction:", error);
      toast.error("Failed to recheck Fonepay transaction. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Format amount as currency
  const formatAmount = (amount: number | string) => {
    if (amount === "Incomplete") return "-";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(numAmount);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white min-h-screen">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FiDollarSign className="mr-2" /> Fonepay Transactions
        </h1>
      </header>

      {/* Search Form */}
      <div className="mb-6 bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-4">
          {/* Date Range */}
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiCalendar className="inline mr-1" /> Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Search Fields */}
          {["email", "prn", "uid"].map((field) => (
            <div key={field} className="flex-grow min-w-[200px]">
              <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                {field} Search
              </label>
              <input
                type="text"
                placeholder={`Search by ${field}`}
                value={searchParams[field as keyof SearchParams]}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, [field]: e.target.value })
                }
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>
          ))}

          {/* Buttons */}
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

      {/* Transactions Table */}
      <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                {["#", "Date", "Merchant Code", "PRN", "UID", "Amount (NPR)", "Status", "Item", "User", "Email", "Response Date", "Actions"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {transactions.map((transaction, index) => (
                <tr key={transaction._id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm">{(page - 1) * limit + index + 1}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(transaction.requestDate)}</td>
                  <td className="px-6 py-4 text-sm">{transaction.merchantCode}</td>
                  <td className="px-6 py-4 text-sm">{transaction.productReferenceNumber}</td>
                  <td className="px-6 py-4 text-sm">{transaction.traceId}</td>
                  <td className="px-6 py-4 text-sm">{formatAmount(transaction.amountRequested)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        transaction.status === "true"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {transaction.status === "true" ? "Success" : "Failed"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{transaction.itemTitle}</td>
                  <td className="px-6 py-4 text-sm">{transaction.userName}</td>
                  <td className="px-6 py-4 text-sm">{transaction.userEmail}</td>
                  <td className="px-6 py-4 text-sm">{formatDate(transaction.responseDate)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleRecheck(transaction)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                    >
                      Recheck
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-400">
          Total Transactions: {totalTransactions}
        </p>
        <div className="space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-500"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-500"
          >
            Next
          </button>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default TransactionsPage;
