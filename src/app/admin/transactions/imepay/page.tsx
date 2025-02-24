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
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils";

interface TransactionData {
  _id: string;
  date: string;
  merchantCode: string;
  refId: string;
  tokenId: string;
  amount: number | string;
  status: string;
  itemTitle: string;
  userName: string;
  userEmail: string;
  msisdn: string;
  responseDate: string;
  transactionId: string;
}

interface SearchParams {
  startDate: string;
  endDate: string;
  email: string;
  refId: string;
  tokenId: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: "",
    endDate: "",
    email: "",
    refId: "",
    tokenId: "",
  });
  const [totalTransactions, setTotalTransactions] = useState(0);

  const limit = 10;

  const fetchTransactions = async (
    pageNumber: number,
    params: SearchParams
  ) => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: pageNumber,
        limit,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        ...(params.email && { email: params.email }),
        ...(params.refId && { refId: params.refId }),
        ...(params.tokenId && { tokenId: params.tokenId }),
      };

      const response = await axios.get(`${serverURL}/admin/ime-transactions`, {
        params: queryParams,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setTransactions(response.data.transactionsData);
      setTotalPages(response.data.totalPages);
      setTotalTransactions(response.data.totalTransactions);
    } catch (error) {
      console.error("Error fetching IME Pay transactions:", error);
      toast.error("Failed to fetch IME Pay transactions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, searchParams);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions(1, searchParams);
  };

  const handleReset = () => {
    const resetParams = {
      startDate: "",
      endDate: "",
      email: "",
      refId: "",
      tokenId: "",
    };
    setSearchParams(resetParams);
    setPage(1);
    fetchTransactions(1, resetParams);
  };

  const handleRecheck = async (transaction: TransactionData) => {
    try {
      const response = await axios.post(
        `${serverURL}/admin/ime-recheck-transaction`,
        { RefId: transaction.refId, TokenId: transaction.tokenId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      toast.success(response.data.message);
      fetchTransactions(page, searchParams);
    } catch (error) {
      console.error("Error rechecking IME Pay transaction:", error);
      toast.error("Failed to recheck IME Pay transaction. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(numAmount);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FiDollarSign className="mr-2" /> IME Pay Transactions
        </h1>
      </header>

      {/* Search Form */}
      <div className="mb-6 bg-gray-800 shadow rounded-lg p-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-end gap-4"
        >
          {/* Date Range */}
          <div className="flex-grow min-w-[200px]">
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
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) =>
                  setSearchParams({ ...searchParams, endDate: e.target.value })
                }
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
              />
            </div>
          </div>

          {/* Email Search */}
          <div className="flex-grow min-w-[200px]">
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
              className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>

          {/* Ref ID Search */}
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ref ID Search
            </label>
            <input
              type="text"
              placeholder="Search by Ref ID"
              value={searchParams.refId}
              onChange={(e) =>
                setSearchParams({ ...searchParams, refId: e.target.value })
              }
              className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>

          {/* Token ID Search */}
          <div className="flex-grow min-w-[200px]">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Token ID Search
            </label>
            <input
              type="text"
              placeholder="Search by Token ID"
              value={searchParams.tokenId}
              onChange={(e) =>
                setSearchParams({ ...searchParams, tokenId: e.target.value })
              }
              className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white"
            />
          </div>

          {/* Search Buttons */}
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
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading transactions...</p>
        </div>
      ) : (
        <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  {[
                    "#",
                    "Date",
                    "Merchant Code",
                    "Ref ID",
                    "Token ID",
                    "Amount (NPR)",
                    "Status",
                    "Item",
                    "User",
                    "Email",
                    "MSISDN",
                    "Response Date",
                    "Transaction ID",
                    "Actions",
                  ].map((header) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.merchantCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.refId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.tokenId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status.toLowerCase() === "success"
                            ? "bg-green-100 text-green-800"
                            : transaction.status.toLowerCase() === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.itemTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link
                        href={`mailto:${transaction.userEmail}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {transaction.userEmail}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.msisdn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(transaction.responseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.transactionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.status.toLowerCase() === "success" ? (
                        <FiCheckCircle
                          className="text-green-500 h-5 w-5"
                          title="Success"
                        />
                      ) : transaction.status.toLowerCase() === "failed" ? (
                        <FiXCircle
                          className="text-red-500 h-5 w-5"
                          title="Failed"
                        />
                      ) : (
                        <button
                          onClick={() => handleRecheck(transaction)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Recheck Transaction"
                        >
                          <FiRefreshCw className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Results Message */}
          {transactions.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <div className="text-gray-300">
            <span className="font-medium">{page}</span>
            <span className="mx-2">/</span>
            <span>{totalPages}</span>
            <span className="ml-4 text-gray-400">
              Total: {totalTransactions} transactions
            </span>
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-r disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Toast Container for Notifications */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* ToastContainer will be rendered here by react-toastify */}
      </div>
    </div>
  );
}
