"use client";
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { serverURL } from "@/utils/utils";
import {
  FiSearch,
  FiUser,
  FiDollarSign,
  FiCreditCard,
  FiShoppingBag,
  FiToggleLeft,
  FiToggleRight,
  FiFileText,
} from 'react-icons/fi';

// Interfaces
interface UserDetails {
  _id: string;
  name: string;
  email: string;
  type: string;
  status: string;
  createdAt: string;
  creditBalance: number;
  totalPurchases: number;
}

interface Transaction {
  _id: string;
  transactionId: string;
  amount: number;
  date: string;
  status: string;
  type: string;
  currency?: string;
}

interface Invoice {
  _id: string;
  invoiceId: string;
  amount: number;
  date: string;
  currency: string;
  paymentMethod: string;
  taxPercent: number;
}

interface CreditTransaction {
  _id: string;
  type: string;
  amount: number;
  date: string;
}

interface UserData {
  user: UserDetails;
  transactions: {
    all: Transaction[];
    imePay: Transaction[];
    paddle: Transaction[];
  };
  purchases: any[];
  invoices: Invoice[];
  creditTransactions: CreditTransaction[];
  summaries: {
    transactions: {
      totalImePayTransactions: number;
      totalPaddleTransactions: number;
      successfulTransactions: number;
      failedTransactions: number;
    };
    financial: {
      totalSpentNPR: number;
      totalSpentUSD: number;
      totalCreditsEarned: number;
      totalCreditsUsed: number;
    };
  };
}

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${serverURL}/admin/user-search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.user) {
        fetchUserDetails(response.data.user._id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Search failed');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await axios.get(`${serverURL}/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch user details');
    }
  };

  const handleStatusChange = async () => {
    if (!userData) return;

    try {
      const newStatus = userData.user.status === 'active' ? 'inactive' : 'active';
      await axios.put(
        `${serverURL}/admin/user/${userData.user._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success('Status updated successfully');
      fetchUserDetails(userData.user._id);
      setIsStatusModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      {/* Search Section */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email or user ID"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            disabled={loading}
          >
            <FiSearch /> Search
          </button>
        </form>
      </div>

      {/* User Details Section */}
      {userData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FiUser /> User Information
                </h2>
                <p className="text-gray-600">{userData.user.email}</p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  userData.user.status === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {userData.user.status === 'active' ? <FiToggleRight /> : <FiToggleLeft />}
                {userData.user.status}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Credits Balance</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <FiCreditCard /> {userData.user.creditBalance}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Total Purchases</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <FiShoppingBag /> {userData.user.totalPurchases}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Total Spent (NPR)</p>
                  <p className="font-bold">₨ {userData.summaries.financial.totalSpentNPR}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Spent (USD)</p>
                  <p className="font-bold">$ {userData.summaries.financial.totalSpentUSD}</p>
                </div>
                <div>
                  <p className="text-gray-600">Credits Earned</p>
                  <p className="font-bold text-green-600">
                    {userData.summaries.financial.totalCreditsEarned}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Credits Used</p>
                  <p className="font-bold text-red-600">
                    {userData.summaries.financial.totalCreditsUsed}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Summary Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FiDollarSign /> Transactions Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">IME Pay Transactions</p>
                <p className="font-bold">{userData.summaries.transactions.totalImePayTransactions}</p>
              </div>
              <div>
                <p className="text-gray-600">Paddle Transactions</p>
                <p className="font-bold">{userData.summaries.transactions.totalPaddleTransactions}</p>
              </div>
              <div>
                <p className="text-gray-600">Successful Transactions</p>
                <p className="font-bold text-green-600">
                  {userData.summaries.transactions.successfulTransactions}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Failed Transactions</p>
                <p className="font-bold text-red-600">
                  {userData.summaries.transactions.failedTransactions}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FiDollarSign /> Recent Transactions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Type</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.transactions.all.slice(0, 5).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.type}</td>
                      <td className="text-right">
                        {transaction.currency === 'USD' ? '$' : '₨'} {transaction.amount}
                      </td>
                      <td className={`text-right ${
                        transaction.status === 'completed' || transaction.status === 'paid'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Credit Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <FiCreditCard /> Recent Credit Transactions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Date</th>
                    <th className="text-left">Type</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {userData.creditTransactions.slice(0, 5).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.type}</td>
                      <td className="text-right">{transaction.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Status Change</h3>
            <p>
              Are you sure you want to change the user's status to{' '}
              <span className="font-bold">
                {userData?.user.status === 'active' ? 'inactive' : 'active'}
              </span>
              ?
            </p>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;