"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  FiUser,
  FiDollarSign,
  FiRefreshCw,
  FiShoppingCart,
  FiCreditCard,
  FiSearch,
  FiToggleLeft,
  FiToggleRight,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiCalendar,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { serverURL } from "../../../utils/utils";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ErrorBoundary } from "react-error-boundary";

// Interfaces
interface UserData {
  _id: string;
  name: string;
  email: string;
  type: string;
  referralCode: string;
  status: string;
  createdAt: string;
}

interface Purchase {
  _id: string;
  itemId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface Transaction {
  _id: string;
  MerchantCode: string;
  RefId: string;
  TranAmount: number;
  RequestDate: string;
  TransactionId: string;
  ImeTxnStatus: number;
}

interface CreditTransaction {
  _id: string;
  type: string;
  amount: number;
  date: string;
}

interface Credit {
  _id: string;
  balance: number;
  createdAt: string;
}

// List Components
const PurchasesList = ({ purchases = [] }: { purchases: Purchase[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 5;

  if (!purchases || purchases.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-black">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-blac">
          <FiShoppingCart className="mr-2" /> Recent Purchases
        </h2>
        <p className="text-gray-500 text-center">No purchases found</p>
      </div>
    );
  }

  const sortedPurchases = [...purchases].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "amount") {
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPurchases.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-white shadow rounded-lg p-6 text-black">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiShoppingCart className="mr-2" /> Recent Purchases
      </h2>
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            setSortBy("date");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
          className={`px-3 py-1 rounded ${
            sortBy === "date" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => {
            setSortBy("amount");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
          className={`px-3 py-1 rounded ${
            sortBy === "amount" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((purchase) => (
              <tr key={purchase._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchase.transactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchase.amount} {purchase.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchase.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronLeft />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(purchases.length / itemsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(purchases.length / itemsPerPage))
            )
          }
          disabled={currentPage === Math.ceil(purchases.length / itemsPerPage)}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

const TransactionsList = ({
  transactions = [],
}: {
  transactions: Transaction[];
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 5;

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-black">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiDollarSign className="mr-2" /> Recent Transactions
        </h2>
        <p className="text-gray-500 text-center">No transactions found</p>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "desc"
        ? new Date(b.RequestDate).getTime() - new Date(a.RequestDate).getTime()
        : new Date(a.RequestDate).getTime() - new Date(b.RequestDate).getTime();
    } else if (sortBy === "amount") {
      return sortOrder === "desc"
        ? b.TranAmount - a.TranAmount
        : a.TranAmount - b.TranAmount;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="bg-white shadow rounded-lg p-6 text-black">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiDollarSign className="mr-2" /> Recent Transactions
      </h2>
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => {
            setSortBy("date");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
          className={`px-3 py-1 rounded ${
            sortBy === "date" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => {
            setSortBy("amount");
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          }}
          className={`px-3 py-1 rounded ${
            sortBy === "amount" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Amount {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.TransactionId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.TranAmount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.ImeTxnStatus === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {transaction.ImeTxnStatus === 1 ? "Success" : "Failed"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.RequestDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronLeft />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(transactions.length / itemsPerPage)}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(prev + 1, Math.ceil(transactions.length / itemsPerPage))
            )
          }
          disabled={
            currentPage === Math.ceil(transactions.length / itemsPerPage)
          }
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};




const CreditTransactionsList = ({ creditTransactions = [] }: { creditTransactions: CreditTransaction[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const itemsPerPage = 5;

  if (!creditTransactions || creditTransactions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-black">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiCreditCard className="mr-2" /> Credit Transactions
        </h2>
        <p className="text-gray-500 text-center">No credit transactions found</p>
      </div>
    );
  }

  const sortedTransactions = [...creditTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'amount') {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const getTypeColor = (type: string) => {
    const colors = {
      credit_added: 'bg-green-100 text-green-800',
      credit_used: 'bg-red-100 text-red-800',
      credit_purchase: 'bg-blue-100 text-blue-800',
      credit_bonus: 'bg-yellow-100 text-yellow-800',
      credit_referral: 'bg-purple-100 text-purple-800',
      credit_reused: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiCreditCard className="mr-2" /> Credit Transactions
      </h2>
      <div className="mb-4 flex justify-end space-x-2">
        <button 
          onClick={() => {
            setSortBy('date');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
          className={`px-3 py-1 rounded ${
            sortBy === 'date' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button 
          onClick={() => {
            setSortBy('amount');
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          }}
          className={`px-3 py-1 rounded ${
            sortBy === 'amount' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((transaction) => (
              <tr key={transaction._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                    {transaction.type.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronLeft />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(creditTransactions.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(creditTransactions.length / itemsPerPage)))}
          disabled={currentPage === Math.ceil(creditTransactions.length / itemsPerPage)}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};



const CreditsList = ({ credits }: { credits: Credit[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const itemsPerPage = 5;

  if (!credits || credits.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiCreditCard className="mr-2" /> Credits History
        </h2>
        <p className="text-gray-500 text-center">No credits history found</p>
      </div>
    );
  }

  const sortedCredits = [...credits].sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortBy === "balance") {
      return sortOrder === "desc"
        ? b.balance - a.balance
        : a.balance - b.balance;
    }
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedCredits.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FiCreditCard className="mr-2" /> Credits History
      </h2>
      <div className="mb-4 flex justify-end space-x-2">
        <button
          onClick={() => handleSort("date")}
          className={`px-3 py-1 rounded transition-colors ${
            sortBy === "date" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
        <button
          onClick={() => handleSort("balance")}
          className={`px-3 py-1 rounded transition-colors ${
            sortBy === "balance" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Balance {sortBy === "balance" && (sortOrder === "asc" ? "↑" : "↓")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((credit) => (
              <tr key={credit._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(credit.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {credit.balance}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {Math.ceil(credits.length / itemsPerPage)}
        </span>
        <button
          onClick={() => paginate(Math.min(Math.ceil(credits.length / itemsPerPage), currentPage + 1))}
          disabled={currentPage === Math.ceil(credits.length / itemsPerPage)}
          className="px-3 py-1 rounded bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


const UserDetailsPage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [userData, setUserData] = useState<UserData | null>(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [addCreditAmount, setAddCreditAmount] = useState('');
  const [addCreditType, setAddCreditType] = useState('credit_bonus');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const fetchUserData = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${serverURL}/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const { user, creditBalance, purchases, transactions, creditTransactions } = response.data;

      console.log(response);
      
      setUserData(user);
      setCreditBalance(creditBalance || 0);
      setPurchases(purchases || []);
      setTransactions(transactions || []);
      setCreditTransactions(creditTransactions || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddCreditModalOpen(true);
  };

  const confirmAddCredits = async () => {
    if (!userData) return;
    try {
      const response = await axios.post(
        `${serverURL}/admin/user/${userData._id}/add-credits`,
        {
          amount: Number(addCreditAmount),
          type: addCreditType,
          adminPin
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('Credits added successfully');
      setCreditBalance(response.data.creditBalance);
      fetchUserData(userData._id);
      setAddCreditAmount('');
      setAdminPin('');
      setIsAddCreditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add credits');
    }
  };

  const handleUpdateStatus = async () => {
    if (!userData) return;
    try {
      const newStatus = userData.status === 'active' ? 'inactive' : 'active';
      await axios.put(
        `${serverURL}/admin/user/${userData._id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      toast.success('User status updated successfully');
      setUserData({ ...userData, status: newStatus });
      setIsStatusModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${serverURL}/admin/user-search?query=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.user) {
        fetchUserData(response.data.user._id);
      } else {
        toast.error('User not found');
        setUserData(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to search user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton height={30} width={200} />
        <div className="mt-8">
          <Skeleton height={50} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <FiUser className="mr-2" /> User Details
        </h1>
        <form onSubmit={handleSearch} className="flex items-center text-black`">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Email"
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
          >
            <FiSearch />
          </button>
        </form>
      </div>

      {userData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Information Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-semibold">{userData.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold">{userData.email}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                  userData.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {userData.status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Credit Balance</p>
                <p className="font-semibold">{creditBalance}</p>
              </div>
              <div>
                <p className="text-gray-600">Created At</p>
                <p className="font-semibold">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className={`px-4 py-2 rounded-md ${
                  userData.status === 'active'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {userData.status === 'active' ? 'Deactivate' : 'Activate'} User
              </button>
              <button
                onClick={() => setIsAddCreditModalOpen(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Add Credits
              </button>
            </div>
          </div>

          {/* Lists */}
          <div className="grid grid-cols-1 gap-8">
            <CreditTransactionsList creditTransactions={creditTransactions} />
            <PurchasesList purchases={purchases} />
            <TransactionsList transactions={transactions} />
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No user data available
        </div>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Status Change</h2>
            <p>Are you sure you want to {userData?.status === 'active' ? 'deactivate' : 'activate'} this user?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credit Modal */}
      {isAddCreditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Add Credits</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={addCreditAmount}
                  onChange={(e) => setAddCreditAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={addCreditType}
                  onChange={(e) => setAddCreditType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="credit_bonus">Bonus Credit</option>
                  <option value="credit_referral">Referral Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Admin PIN
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsAddCreditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddCredits}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Add Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;