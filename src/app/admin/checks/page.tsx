"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils";

interface CheckData {
  _id: string;
  userId: {
    email: string;
  };
  checkedBy: {
    name: string;
  } | null;
  priority: string;
  deliveryTime: string | null;
}

interface CheckStatistics {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}

interface PendingPriorityCounts {
  low: number;
  medium: number;
  high: number;
}

interface StaffData {
  _id: string;
  name: string;
  email: string;
  onlineStatus: boolean;
  checkouts: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    pendingPriorityCounts: PendingPriorityCounts;
  };
}

const CheckSummaryPage = () => {
  const [pendingChecks, setPendingChecks] = useState<CheckData[]>([]);
  const [processingChecks, setProcessingChecks] = useState<CheckData[]>([]);
  const [completedChecks, setCompletedChecks] = useState<CheckData[]>([]);
  const [summary, setSummary] = useState<CheckStatistics | null>(null);
  const [staffList, setStaffList] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit] = useState<number>(10); // Number of records per page

  const fetchChecksAndStaff = async (page: number) => {
    try {
      const [
        pendingResponse,
        processingResponse,
        completedResponse,
        summaryResponse,
        staffResponse
      ] = await Promise.all([
        axios.get(`${serverURL}/admin/pending-checks`, {
          params: { page, limit },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${serverURL}/admin/processing-checks`, {
          params: { page, limit },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${serverURL}/admin/completed-checks`, {
          params: { page, limit },
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${serverURL}/admin/checks-summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${serverURL}/admin/staff-each-detail`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ]);

      setPendingChecks(pendingResponse.data.data);
      setProcessingChecks(processingResponse.data.data);
      setCompletedChecks(completedResponse.data.data);
      setSummary(summaryResponse.data.data);
      setStaffList(staffResponse.data.data);
      setTotalPages(pendingResponse.data.totalPages); // Assuming all list types have the same total pages
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data.");
      setError("Failed to load data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecksAndStaff(currentPage);
    const intervalId = setInterval(() => fetchChecksAndStaff(currentPage), 5000);
    return () => clearInterval(intervalId);
  }, [currentPage]);

  const calculateHoursLeft = (deliveryTime: string | null): number => {
    if (!deliveryTime) return 0;
    const deliveryDate = new Date(deliveryTime);
    const currentTime = Date.now();
    const difference = deliveryDate.getTime() - currentTime;
    return Math.max(0, Math.floor(difference / (1000 * 60 * 60)));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-gray-500";
      default:
        return "text-white";
    }
  };

  const displayCheckList = (title: string, checks: CheckData[]) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
      <div className="bg-gray-800 shadow-lg rounded-lg p-6">
        <table className="min-w-full text-center text-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Check ID</th>
              <th className="px-4 py-2">User Email</th>
              <th className="px-4 py-2">Checked By</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Delivery Time</th>
              <th className="px-4 py-2">Hours Left</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((check) => {
              const hoursLeft = calculateHoursLeft(check.deliveryTime);
              return (
                <tr key={check._id}>
                  <td className="border px-4 py-2">{check._id}</td>
                  <td className="border px-4 py-2">{check.userId.email}</td>
                  <td className="border px-4 py-2">
                    {check.checkedBy ? check.checkedBy.name : "Unassigned"}
                  </td>
                  <td className={`border px-4 py-2 ${getPriorityColor(check.priority)}`}>
                    {check.priority}
                  </td>
                  <td className="border px-4 py-2">
                    {check.deliveryTime ? new Date(check.deliveryTime).toLocaleString() : "N/A"}
                  </td>
                  <td className="border px-4 py-2">{hoursLeft} hours left</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const displayStaffDetails = () => (
    <div className="mb-8">
      <h2 className="text-3xl font-semibold mb-4 text-center">Staff Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staffList.map((staff) => (
          <div key={staff._id} className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">{staff.name}</h2>
            <p className="mb-4">{staff.email}</p>
            <p
              className={`mb-4 font-bold ${
                staff.onlineStatus ? "text-green-500" : "text-red-500"
              }`}
            >
              {staff.onlineStatus ? "Online" : "Offline"}
            </p>
            <h3 className="text-lg font-semibold mb-2">Checkouts Summary</h3>
            <ul className="list-disc ml-5 mb-4">
              <li>Total: {staff.checkouts.total}</li>
              <li>Pending: {staff.checkouts.pending}</li>
              <li>Processing: {staff.checkouts.processing}</li>
              <li>Completed: {staff.checkouts.completed}</li>
              <li>Failed: {staff.checkouts.failed}</li>
            </ul>
            <h3 className="text-lg font-semibold mb-2">Pending Priorities</h3>
            <ul className="list-disc ml-5">
              <li>Low: {staff.checkouts.pendingPriorityCounts.low}</li>
              <li>Medium: {staff.checkouts.pendingPriorityCounts.medium}</li>
              <li>High: {staff.checkouts.pendingPriorityCounts.high}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const renderPagination = () => (
    <div className="text-center mb-8">
      <button
        className="px-3 py-1 bg-gray-700 text-white rounded-md mx-1"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="mx-2 text-white">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="px-3 py-1 bg-gray-700 text-white rounded-md mx-1"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center">{error}</p>;

  return (
    <div className="container mx-auto px-8 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-white">Check Summary</h1>
      </header>

      {summary && (
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-4 text-center text-white">
            Checks Summary
          </h2>
          <div className="bg-gray-800 shadow-lg rounded-lg p-6 grid grid-cols-2 gap-4 text-center text-lg">
            <p className="p-2 bg-green-600 rounded-lg shadow">{`Pending: ${summary.pending}`}</p>
            <p className="p-2 bg-blue-600 rounded-lg shadow">{`Processing: ${summary.processing}`}</p>
            <p className="p-2 bg-gray-600 rounded-lg shadow">{`Completed: ${summary.completed}`}</p>
            <p className="p-2 bg-red-600 rounded-lg shadow">{`Failed: ${summary.failed}`}</p>
          </div>
        </div>
      )}

      {displayStaffDetails()}
      {displayCheckList("Pending Checks", pendingChecks)}
      {renderPagination()}
      {displayCheckList("Processing Checks", processingChecks)}
      {renderPagination()}
      {displayCheckList("Completed Checks", completedChecks)}
      {renderPagination()}
    </div>
  );
};

export default CheckSummaryPage;