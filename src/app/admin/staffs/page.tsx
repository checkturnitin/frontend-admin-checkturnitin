"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { serverURL } from "@/utils/utils";
import { FiEdit, FiTrash, FiKey } from "react-icons/fi";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming it is a UI component with correct functionality

interface Staff {
  _id: string;
  email: string;
  type: string;
  status: "active" | "inactive";
  name: string;
  telegramId: string;
  isOnline: boolean;
  numberOfChecksPriority: "low" | "medium" | "high";
  checkTypeAllowed: "low" | "medium" | "high";
}

interface EditModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; telegramId: string }) => Promise<void>;
}

interface PasswordModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (password: string) => Promise<void>;
}

const EditModal: React.FC<EditModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setTelegramId(staff.telegramId);
    }
  }, [staff]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ name, telegramId });
      onClose();
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#1e1e1e] text-white"
          />
          <Input
            placeholder="Telegram ID"
            value={telegramId}
            onChange={(e) => setTelegramId(e.target.value)}
            className="bg-[#1e1e1e] text-white"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#2a2a2a] text-white hover:bg-[#333]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PasswordModal: React.FC<PasswordModalProps> = ({
  staff,
  isOpen,
  onClose,
  onSave,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await onSave(password);
      onClose();
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Failed to change password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] text-white">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#1e1e1e] text-white"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-[#1e1e1e] text-white"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#2a2a2a] text-white hover:bg-[#333]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Change Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StaffsPage = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${serverURL}/admin/staffs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setStaffs(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch staffs.");
    }
  };

  const handleChangeUserType = async () => {
    if (!email || !name) {
      toast.error("Please provide email and name.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${serverURL}/admin/change-user-type`,
        { email, type: "staff", name, telegramId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("User promoted to staff.");
      fetchStaffs();
      setEmail("");
      setName("");
      setTelegramId("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user type.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (
    staffId: string,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const staff = staffs.find((s) => s._id === staffId);
      await axios.post(
        `${serverURL}/admin/edit-staff`,
        {
          email: staff?.email,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setStaffs((prev) =>
        prev.map((s) => (s._id === staffId ? { ...s, status: newStatus } : s))
      );
      toast.success(
        `Staff ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (error) {
      toast.error("Failed to update staff status.");
    }
  };

  const handleToggleOnlineStatus = async (staffId: string, isOnline: boolean) => {
    try {
      await axios.post(
        `${serverURL}/admin/update-staff-online-status`,
        { staffId, isOnline: !isOnline },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setStaffs((prev) =>
        prev.map((staff) =>
          staff._id === staffId ? { ...staff, isOnline: !isOnline } : staff
        )
      );
      toast.success("Online status updated successfully.");
    } catch (error) {
      toast.error("Failed to update online status.");
    }
  };

  const handleEditStaff = async (data: { name: string; telegramId: string }) => {
    if (!selectedStaff) return;
    try {
      await axios.post(
        `${serverURL}/admin/edit-staff`,
        {
          email: selectedStaff.email,
          status: selectedStaff.status,
          name: data.name,
          telegramId: data.telegramId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Staff details updated successfully.");
      fetchStaffs();
    } catch (error) {
      toast.error("Failed to update staff details.");
    }
  };

  const handleChangePassword = async (password: string) => {
    if (!selectedStaff) return;
    try {
      await axios.post(
        `${serverURL}/admin/change-staff-password`,
        {
          email: selectedStaff.email,
          password,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error("Failed to change password.");
    }
  };

  const handleUpdateCheckSettings = async (
    staffId: string,
    numberOfChecksPriority: string,
    checkTypeAllowed: string
  ) => {
    try {
      await axios.post(
        `${serverURL}/admin/update-staff-check-settings`,
        { staffId, numberOfChecksPriority, checkTypeAllowed },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      toast.success("Check settings updated successfully.");
      fetchStaffs();
    } catch (error) {
      toast.error("Failed to update check settings.");
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff?")) return;
    try {
      await axios.delete(`${serverURL}/admin/delete-staff/${staffId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Staff removed successfully.");
      setStaffs((prev) => prev.filter((staff) => staff._id !== staffId));
    } catch (error) {
      toast.error("Failed to remove staff.");
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-6">
      <Toaster position="bottom-right" theme="dark" richColors />

      <Card className="shadow-lg p-6 bg-[#121212] mb-6 rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Manage Staff</CardTitle>
          <CardDescription className="text-gray-400">
            Promote users to staff and assign Telegram ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1e1e1e] text-white"
            />
            <Input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1e1e1e] text-white"
            />
            <Input
              type="text"
              placeholder="Enter Telegram ID (optional)"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              className="bg-[#1e1e1e] text-white"
            />
            <Button
              onClick={handleChangeUserType}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Promote to Staff"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg p-6 bg-[#1a1a1a] flex-grow rounded-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Staff List</CardTitle>
          <CardDescription className="text-gray-400">
            All staff members are listed below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="bg-[#1a1a1a] text-white">
            <TableHeader>
              <TableRow className="bg-[#222]">
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Online</TableHead>
                <TableHead>Telegram ID</TableHead>
                <TableHead>Checks Priority</TableHead>
                <TableHead>Allowed Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffs.map((staff) => (
                <TableRow key={staff._id} className="hover:bg-[#292929]">
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={staff.status === "active"}
                      onCheckedChange={() =>
                        handleToggleStatus(staff._id, staff.status)
                      }
                      className="bg-gray-600 data-[state=checked]:bg-green-600"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={staff.isOnline}
                      onCheckedChange={() => handleToggleOnlineStatus(staff._id, staff.isOnline)}
                      className="bg-gray-600 data-[state=checked]:bg-green-600"
                    />
                  </TableCell>
                  <TableCell>{staff.telegramId}</TableCell>
                  <TableCell>
                    <select
                      value={staff.numberOfChecksPriority}
                      onChange={(e) =>
                        handleUpdateCheckSettings(
                          staff._id,
                          e.target.value,
                          staff.checkTypeAllowed
                        )
                      }
                      className="bg-[#1e1e1e] text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <select
                      value={staff.checkTypeAllowed}
                      onChange={(e) =>
                        handleUpdateCheckSettings(
                          staff._id,
                          staff.numberOfChecksPriority,
                          e.target.value
                        )
                      }
                      className="bg-[#1e1e1e] text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="ghost"
                      className="px-2 text-white hover:bg-[#333]"
                      onClick={() => {
                        setSelectedStaff(staff);
                        setEditModalOpen(true);
                      }}
                    >
                      <FiEdit className="text-blue-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2 text-white hover:bg-[#333]"
                      onClick={() => {
                        setSelectedStaff(staff);
                        setPasswordModalOpen(true);
                      }}
                    >
                      <FiKey className="text-yellow-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-2 text-white hover:bg-[#333]"
                      onClick={() => handleDeleteStaff(staff._id)}
                    >
                      <FiTrash className="text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditModal
        staff={selectedStaff}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleEditStaff}
      />

      <PasswordModal
        staff={selectedStaff}
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleChangePassword}
      />
    </div>
  );
};

export default StaffsPage;