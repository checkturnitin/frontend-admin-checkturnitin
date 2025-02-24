"use client";
import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiDollarSign, FiDownload, FiSearch, FiCalendar, FiRefreshCw } from "react-icons/fi";
import { serverURL } from "@/utils/utils";
import { toast } from "react-toastify";

const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    USD: "$", EUR: "€", NPR: "₹", GBP: "£",
  };
  return symbols[currencyCode] || currencyCode;
};

interface PurchaseData {
  _id: string;
  date: string;
  user: string;
  email: string;
  item: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    startDate: "",
    endDate: "",
    email: "",
  });
  const [totalPurchases, setTotalPurchases] = useState(0);
  const limit = 10;

  const fetchPurchases = async (pageNumber: number, params = {}) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${serverURL}/admin/purchases`, {
        params: { page: pageNumber, limit, ...params },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPurchases(response.data.purchasesData);
      setTotalPages(response.data.totalPages);
      setTotalPurchases(response.data.totalPurchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to fetch purchases. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases(page);
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPurchases(1, searchParams);
  };

  const handleReset = () => {
    setSearchParams({ startDate: "", endDate: "", email: "" });
    setPage(1);
    fetchPurchases(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FiDollarSign className="mr-2" /> Purchases
        </h1>
      </header>

      <div className="mb-6 bg-gray-800 shadow rounded-lg p-6">
        <form onSubmit={handleSearch} className="flex flex-wrap items-end space-x-4">
          <div className="flex-grow min-w-[200px] mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiCalendar className="inline mr-1" /> Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={searchParams.startDate}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
              />
              <input
                type="date"
                value={searchParams.endDate}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
                className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
              />
            </div>
          </div>
          <div className="flex-grow min-w-[200px] mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FiSearch className="inline mr-1" /> Email Search
            </label>
            <input
              type="text"
              placeholder="Search by email"
              value={searchParams.email}
              onChange={(e) => setSearchParams({ ...searchParams, email: e.target.value })}
              className="form-input mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
              Search
            </button>
            <button type="button" onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              <FiRefreshCw className="inline mr-1" /> Reset
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  {["#", "Date", "User", "Email", "Item", "Total Price", "Payment Method", "Invoice"].map((header) => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {purchases.map((purchase, index) => (
                  <tr key={purchase._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {totalPurchases - (page - 1) * limit - index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{purchase.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{purchase.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <Link href={`mailto:${purchase.email}`} className="text-indigo-400 hover:text-indigo-600">
                        {purchase.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{purchase.item}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getCurrencySymbol(purchase.currency)} {purchase.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{purchase.paymentMethod}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/invoice/${purchase._id}`} className="text-indigo-400 hover:text-indigo-600">
                        <FiDownload className="inline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-l"
            >
              Previous
            </button>
            <span className="text-sm text-gray-300">
              Page {page} of {totalPages}
            </span>
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