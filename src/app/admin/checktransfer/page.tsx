"use client";
import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils"; // Ensure serverURL utility is defined
import debounce from "lodash.debounce"; // You might need to install lodash.debounce

interface CheckTransferData {
  _id: string;
  checkId: {
    _id: string; // Assuming _id or another unique key
  };
  fromStaffId: {
    _id: string;
    name: string;
  };
  toStaffId: {
    _id: string;
    name: string;
  };
  reason: string;
  status: string;
}

interface StaffData {
  _id: string;
  name: string;
  isOnline: boolean;
}

interface PendingCheckData {
  _id: string;
  userId: {
    email: string;
  };
}

export default function CheckTransferPage() {
  const [transfers, setTransfers] = useState<CheckTransferData[]>([]);
  const [onlineStaff, setOnlineStaff] = useState<StaffData[]>([]);
  const [offlineStaff, setOfflineStaff] = useState<StaffData[]>([]);
  const [pendingChecks, setPendingChecks] = useState<PendingCheckData[]>([]);
  const [suggestedChecks, setSuggestedChecks] = useState<PendingCheckData[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [fromStaffId, setFromStaffId] = useState<string | null>(null);
  const [toStaffId, setToStaffId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [checkSearch, setCheckSearch] = useState<string>("");
  const [fetchError, setFetchError] = useState<boolean>(false);

  useEffect(() => {
    fetchCheckTransfersAndStaff();
  }, []);

  const debouncedFetchSuggestedChecks = useCallback(
    debounce(async (staffId: string, search: string) => {
      if (!isValidObjectId(search)) return; // Only fetch if search term is a potential ObjectId

      if (staffId && search) {
        try {
          const response = await axios.get(`${serverURL}/admin/staff-pending-checks/${staffId}`, {
            params: { search },
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setSuggestedChecks(response.data.data);
        } catch (error) {
          console.error("Error fetching pending checks:", error);
          toast.error("Failed to fetch pending checks.");
        }
      }
    }, 300), [fromStaffId, checkSearch]
  );

  useEffect(() => {
    if (fromStaffId) {
      debouncedFetchSuggestedChecks(fromStaffId, checkSearch);
    }
  }, [fromStaffId, checkSearch, debouncedFetchSuggestedChecks]);

  const fetchCheckTransfersAndStaff = async () => {
    try {
      setFetchError(false);
      const response = await axios.get(`${serverURL}/admin/staff-status-transferhistory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTransfers(response.data.data.transferHistory);
      setOnlineStaff(response.data.data.onlineStaff);
      setOfflineStaff(response.data.data.offlineStaff);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch check transfers and staff status.");
      setFetchError(true);
    }
  };

  const handleTransfer = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCheck || !toStaffId || !fromStaffId || !reason) return;

    try {
      await axios.post(`${serverURL}/admin/transfer-check`, {
        checkId: selectedCheck,
        fromStaffId,
        toStaffId,
        reason,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success("Check transferred successfully");
      setIsModalOpen(false);
      fetchCheckTransfersAndStaff();
      
    } catch (error) {
      console.error("Error transferring check:", error);
      toast.error("Failed to transfer check.");
    }
  };

  const isValidObjectId = (str: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(str);
  };

  return (
    <div className="container mx-auto px-8 py-8 bg-gray-900 text-white">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">Check Transfers</h1>
      </header>

      {/* Online/Offline Staff Lists */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Staff Status</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {/* Online Staff */}
          <div className="w-full md:w-2/5 p-4 bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 text-green-500">Online Staff</h3>
            <ul>
              {onlineStaff.map(staff => (
                <li key={staff._id} className="mb-2">
                  <span className="inline-block bg-green-500 text-white rounded-full px-3 py-1 mr-2">●</span>
                  {staff.name} (ID: {staff._id})
                </li>
              ))}
            </ul>
          </div>

          {/* Offline Staff */}
          <div className="w-full md:w-2/5 p-4 bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2 text-red-500">Offline Staff</h3>
            <ul>
              {offlineStaff.map(staff => (
                <li key={staff._id} className="mb-2">
                  <span className="inline-block bg-red-500 text-white rounded-full px-3 py-1 mr-2">●</span>
                  {staff.name} (ID: {staff._id})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Button to Open Modal */}
      <div className="text-center mb-8">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Open Transfer Modal
        </button>
      </div>

      {/* Transfer History */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-center">Transfer History</h2>
        <div className="bg-gray-800 shadow rounded-lg p-6">
          <table className="min-w-full text-center text-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Check ID</th>
                <th className="px-4 py-2">From</th>
                <th className="px-4 py-2">To</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer._id}>
                  <td className="border px-4 py-2">{transfer.checkId._id}</td> {/* Ensure checkId._id exists */}
                  <td className="border px-4 py-2">{transfer.fromStaffId.name}</td>
                  <td className="border px-4 py-2">{transfer.toStaffId.name}</td>
                  <td className="border px-4 py-2">{transfer.reason}</td>
                  <td className="border px-4 py-2">{transfer.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && !fetchError && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg w-11/12 max-w-lg mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">Transfer Check</h2>
            <form onSubmit={handleTransfer}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider" htmlFor="fromStaffId">
                  From Staff
                </label>
                <select
                  id="fromStaffId"
                  value={fromStaffId || ""}
                  onChange={(e) => setFromStaffId(e.target.value)}
                  className="form-select mt-1 block w-full bg-gray-700 text-white"
                >
                  <option value="">Select Staff</option>
                  {onlineStaff.concat(offlineStaff).map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.isOnline ? "Online" : "Offline"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider" htmlFor="checkSearch">
                  Search Check ID
                </label>
                <input
                  id="checkSearch"
                  type="text"
                  value={checkSearch}
                  onChange={(e) => setCheckSearch(e.target.value)}
                  className="form-input mt-1 block w-full bg-gray-700 text-white"
                  placeholder="Enter check ID..."
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider" htmlFor="checkId">
                  Suggested Checks
                </label>
                <select
                  id="checkId"
                  value={selectedCheck || ""}
                  onChange={(e) => setSelectedCheck(e.target.value)}
                  className="form-select mt-1 block w-full bg-gray-700 text-white"
                  disabled={!fromStaffId}
                >
                  <option value="">Select a Check</option>
                  {suggestedChecks.map((check) => (
                    <option key={check._id} value={check._id}>
                      {check._id} - {check.userId.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider" htmlFor="toStaffId">
                  To Staff
                </label>
                <select
                  id="toStaffId"
                  value={toStaffId || ""}
                  onChange={(e) => setToStaffId(e.target.value)}
                  className="form-select mt-1 block w-full bg-gray-700 text-white"
                >
                  <option value="">Select Staff</option>
                  {onlineStaff.concat(offlineStaff).map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.isOnline ? "Online" : "Offline"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-300 uppercase tracking-wider" htmlFor="reason">
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="form-input mt-1 block w-full bg-gray-700 text-white"
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors"
                >
                  Transfer Check
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}