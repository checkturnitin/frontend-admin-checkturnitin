"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { serverURL } from "@/utils/utils";
import { FiCreditCard, FiPlus, FiSearch, FiRefreshCw, FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type GiftCard = {
  _id: string;
  code: string;
  amount: number;
  batch: number;
  batchNote?: string;
  isRedeemed: boolean;
  status: "active" | "inactive";
  expiresAt: string;
  createdAt: string;
  redeemedBy?: {
    name: string;
    email: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
};

type Batch = {
  batch: number;
  note?: string;
  total: number;
  redeemed: number;
  amount: number;
  created: string;
  expiresAt: string;
};

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState({
    cards: true,
    batches: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive" | "redeemed">("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateData, setGenerateData] = useState({
    amount: 10,
    count: 5,
    validityMonths: 12,
    batchNote: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasMore: false
  });

  const fetchGiftCards = async () => {
    try {
      setLoading(prev => ({ ...prev, cards: true }));
      const { data } = await axios.get(`${serverURL}/admin/giftcards`, {
        params: { 
          search: searchTerm, 
          status: filter === "all" ? undefined : filter,
          isRedeemed: filter === "redeemed" ? true : undefined,
          page: pagination.page,
          limit: pagination.limit
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGiftCards(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages,
        hasMore: data.pagination.hasMore
      }));
    } catch (error) {
      toast.error("Failed to load gift cards");
    } finally {
      setLoading(prev => ({ ...prev, cards: false }));
    }
  };

  const fetchBatches = async () => {
    try {
      setLoading(prev => ({ ...prev, batches: true }));
      const { data } = await axios.get(`${serverURL}/admin/giftcards/batches`, {
        params: {
          page: 1,
          limit: 3
        },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBatches(data.data);
    } catch (error) {
      toast.error("Failed to load batches");
    } finally {
      setLoading(prev => ({ ...prev, batches: false }));
    }
  };

  const generateGiftCards = async () => {
    try {
      if (generateData.count > 500) {
        toast.error("Cannot generate more than 500 cards at once");
        return;
      }

      await axios.post(`${serverURL}/admin/giftcards/generate`, generateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Gift cards generated successfully");
      setGenerateOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to generate gift cards");
    }
  };

  const updateStatus = async (id: string, status: "active" | "inactive") => {
    try {
      await axios.patch(`${serverURL}/admin/giftcards/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Status updated successfully");
      fetchGiftCards();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const updateBatchStatus = async (batch: number, status: "active" | "inactive") => {
    try {
      await axios.patch(`${serverURL}/admin/giftcards/batch/${batch}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success(`Batch ${batch} status updated`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update batch status");
    }
  };

  const exportBatch = async (batch: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await axios.get(
        `${serverURL}/admin/giftcards/batch/${batch}/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch_${batch}_giftcards.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Batch ${batch} exported successfully`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export batch");
    }
  };

  const fetchData = () => {
    fetchGiftCards();
    fetchBatches();
  };

  useEffect(() => {
    fetchData();
  }, [searchTerm, filter, pagination.page]);

  return (
    <div className="w-full min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <FiCreditCard className="mr-2" /> Gift Cards Management
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-white border-gray-600" 
              onClick={fetchData}
              disabled={loading.cards || loading.batches}
            >
              <FiRefreshCw className={`mr-2 ${loading.cards || loading.batches ? "animate-spin" : ""}`} /> 
              Refresh
            </Button>
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FiPlus className="mr-2" /> Generate Cards
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Generate New Gift Cards</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount ($)
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      className="col-span-3 bg-gray-700 border-gray-600"
                      value={generateData.amount}
                      onChange={(e) => setGenerateData({
                        ...generateData, 
                        amount: Math.max(1, Number(e.target.value))
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="count" className="text-right">
                      Card Count
                    </Label>
                    <Input
                      id="count"
                      type="number"
                      min="1"
                      max="500"
                      className="col-span-3 bg-gray-700 border-gray-600"
                      value={generateData.count}
                      onChange={(e) => setGenerateData({
                        ...generateData, 
                        count: Math.min(500, Math.max(1, Number(e.target.value)))
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="validity" className="text-right">
                      Validity (months)
                    </Label>
                    <Input
                      id="validity"
                      type="number"
                      min="1"
                      className="col-span-3 bg-gray-700 border-gray-600"
                      value={generateData.validityMonths}
                      onChange={(e) => setGenerateData({
                        ...generateData, 
                        validityMonths: Math.max(1, Number(e.target.value))
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="note" className="text-right">
                      Batch Note
                    </Label>
                    <Input
                      id="note"
                      className="col-span-3 bg-gray-700 border-gray-600"
                      value={generateData.batchNote}
                      onChange={(e) => setGenerateData({
                        ...generateData, 
                        batchNote: e.target.value
                      })}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setGenerateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={generateGiftCards}
                    disabled={generateData.count < 1 || generateData.amount < 1}
                  >
                    Generate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="bg-gray-800 border border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search by code or batch note..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => {
                    setFilter("all");
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="text-white"
                >
                  All
                </Button>
                <Button
                  variant={filter === "active" ? "default" : "outline"}
                  onClick={() => {
                    setFilter("active");
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="text-white"
                >
                  Active
                </Button>
                <Button
                  variant={filter === "inactive" ? "default" : "outline"}
                  onClick={() => {
                    setFilter("inactive");
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="text-white"
                >
                  Inactive
                </Button>
                <Button
                  variant={filter === "redeemed" ? "default" : "outline"}
                  onClick={() => {
                    setFilter("redeemed");
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="text-white"
                >
                  Redeemed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gift Cards Table */}
        <Card className="bg-gray-800 border border-gray-700 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Gift Cards</CardTitle>
              <div className="text-sm text-gray-400">
                Showing {giftCards.length} of {pagination.total} cards
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading.cards ? (
              <div className="space-y-4">
                {Array(5).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-16 bg-gray-700 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-gray-400">Code</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Batch</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400">Expires</TableHead>
                      <TableHead className="text-gray-400">Created By</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {giftCards.length > 0 ? (
                      giftCards.map((card) => (
                        <TableRow key={card._id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell className="font-mono text-white">
                            {card.code}
                          </TableCell>
                          <TableCell className="text-white">
                            ${card.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-white">
                            {card.batch}
                            {card.batchNote && (
                              <span className="text-gray-400 text-xs block">{card.batchNote}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                card.isRedeemed
                                  ? "destructive"
                                  : card.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {card.isRedeemed ? "Redeemed" : card.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {format(new Date(card.expiresAt), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-white">
                            {card.createdBy?.name || "System"}
                          </TableCell>
                          <TableCell>
                            {!card.isRedeemed && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-white border-gray-600"
                                onClick={() => updateStatus(
                                  card._id, 
                                  card.status === "active" ? "inactive" : "active"
                                )}
                              >
                                {card.status === "active" ? "Deactivate" : "Activate"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="text-center text-gray-400 py-8">
                          No gift cards found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {pagination.pages > 1 && (
                  <div className="flex justify-between items-center p-4 border-t border-gray-700">
                    <Button
                      variant="outline"
                      className="text-white border-gray-600"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="text-gray-400">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      className="text-white border-gray-600"
                      disabled={!pagination.hasMore}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Management */}
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.batches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(3).fill(null).map((_, i) => (
                  <Skeleton key={i} className="h-40 bg-gray-700 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {batches.map((batch) => (
                  <Card key={batch.batch} className="bg-gray-700 border-gray-600">
                    <CardHeader>
                      <CardTitle className="text-white">Batch {batch.batch}</CardTitle>
                      {batch.note && (
                        <p className="text-gray-400 text-sm">{batch.note}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-white space-y-2">
                        <p>Total Cards: {batch.total}</p>
                        <p>Redeemed: {batch.redeemed} ({Math.round((batch.redeemed / batch.total) * 100)}%)</p>
                        <p>Total Value Credits: {batch.amount.toFixed(2)}</p>
                        <p>Created: {format(new Date(batch.created), "MMM dd, yyyy")}</p>
                        <p>Expires: {format(new Date(batch.expiresAt), "MMM dd, yyyy")}</p>
                      </div>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-gray-600"
                          onClick={() => updateBatchStatus(batch.batch, "active")}
                        >
                          Activate All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-gray-600"
                          onClick={() => updateBatchStatus(batch.batch, "inactive")}
                        >
                          Deactivate All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-white border-gray-600 flex items-center gap-1"
                          onClick={() => exportBatch(batch.batch)}
                        >
                          <FiDownload size={14} /> Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}