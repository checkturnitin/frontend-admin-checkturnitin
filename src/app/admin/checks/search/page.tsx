"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { serverURL } from "@/utils/utils";

interface CheckDetails {
  checkId: string;
  status: string;
  priority: string;
  deliveryTime: string;
  checkedBy: string;
  userId: string;
  inputFile: {
    originalFileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
  };
  reports?: {
    ai?: {
      reportUrl: string;
      score: string;
    };
    plagiarism?: {
      reportUrl: string;
      score: string;
    };
  };
}

const CheckDetailsPage = () => {
  const [checkId, setCheckId] = useState<string>("");
  const [checkDetails, setCheckDetails] = useState<CheckDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckDetails = async () => {
    if (!checkId) {
      toast.error("Please enter a valid Check ID.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${serverURL}/admin/check/${checkId}/details`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        setCheckDetails(response.data.data);
      } else {
        setCheckDetails(null);
        setError("No check details found.");
      }
    } catch (error) {
      console.error("Error fetching check details:", error);
      toast.error("Failed to fetch check details.");
      setError("Failed to fetch check details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (endpoint: string, fileName: string) => {
    try {
      const response = await axios.get(`${serverURL}/admin/download/${endpoint}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.pdf`); // Append .pdf to the filename
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file.");
    }
  };

  return (
    <div className="container mx-auto px-8 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-white">Check Details</h1>
      </header>

      <div className="mb-8 text-center">
        <input
          type="text"
          placeholder="Enter Check ID"
          className="px-4 py-2 rounded-lg border border-gray-400 mr-2 text-black"
          value={checkId}
          onChange={(e) => setCheckId(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={fetchCheckDetails}
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Details"}
        </button>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {checkDetails && (
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Details for Check ID: {checkDetails.checkId}</h2>
          <p><strong>Status:</strong> {checkDetails.status}</p>
          <p><strong>Priority:</strong> {checkDetails.priority}</p>
          <p><strong>Delivery Time:</strong> {new Date(checkDetails.deliveryTime).toLocaleString()}</p>
          <p><strong>Checked By:</strong> {checkDetails.checkedBy}</p>
          <p><strong>User Email:</strong> {checkDetails.userId}</p>

          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Input File</h3>
            <p><strong>File Name:</strong> {checkDetails.inputFile.originalFileName}</p>
            <p><strong>File Size:</strong> {(checkDetails.inputFile.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
            <p><strong>File Type:</strong> {checkDetails.inputFile.fileType}</p>
            <p><strong>Uploaded At:</strong> {new Date(checkDetails.inputFile.uploadedAt).toLocaleString()}</p>
            <button
              className="px-2 py-1 bg-green-600 text-white rounded mt-2"
              onClick={() => handleDownload(`check/${checkId}/input`, checkDetails.inputFile.originalFileName)}
            >
              Download Input File
            </button>
          </div>

          {checkDetails.reports && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Reports</h3>
              {checkDetails.reports.ai && (
                <div>
                  <p><strong>AI Report Score:</strong> {checkDetails.reports.ai.score}</p>
                  <button
                    className="px-2 py-1 bg-blue-600 text-white rounded mt-2"
                    onClick={() => handleDownload(`check/${checkId}/report/ai`, "AI_Report")}
                  >
                    Download AI Report
                  </button>
                </div>
              )}
              {checkDetails.reports.plagiarism && (
                <div className="mt-2">
                  <p><strong>Plagiarism Report Score:</strong> {checkDetails.reports.plagiarism.score}</p>
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded mt-2"
                    onClick={() => handleDownload(`check/${checkId}/report/plagiarism`, "Plagiarism_Report")}
                  >
                    Download Plagiarism Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckDetailsPage;