import React, { useState } from "react";
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuthStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../services/api";

const PasswordInputField = ({
  label,
  value,
  onChange,
  placeholder,
  show,
  setShow,
  hasIcon = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  hasIcon?: boolean;
}) => (
  <div className="mb-6"> 
    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
      {hasIcon && <Key className="h-5 w-5 text-indigo-600" />}
      {label}
    </label>

    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="no-edge-eye w-full px-5 py-4 pr-14 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
      >
        {show ? <EyeOff size={22} /> : <Eye size={22} />}
      </button>
    </div>
  </div>
);


export default function ProfilePasswordPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!form.currentPassword.trim()) {
      setError("Current password is required");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (!user?.userId) return;

    setSaving(true);
    try {
      await usersAPI.changePassword(user.userId, {
        CurrentPassword: form.currentPassword,
        NewPassword: form.newPassword,
      });

      setSuccess(true);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/staff/profile"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar
        activePage="My Profile"
        setActivePage={() => {}}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-[230px]"
        } p-6`}
      >
        {/* Header */}
        <header className="mb-8">
          <button
            onClick={() => navigate("/staff/profile")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            <ArrowLeft size={20} />
            Back to Profile
          </button>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
            <p className="text-sm text-gray-500 mt-1">
              Keep your account secure with a strong password
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Password changed successfully!</p>
                <p className="text-sm text-green-700">Redirecting...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="max-w-2xl space-y-8">
              {/* Current Password */}
              <PasswordInputField
                label="Current Password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                show={showCurrent}
                setShow={setShowCurrent}
                hasIcon={true}
              />

              {/* New Password */}
              <PasswordInputField
                label="New Password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="At least 8 characters"
                show={showNew}
                setShow={setShowNew}
                hasIcon={true}
              />

              {/* Confirm Password */}
              <PasswordInputField
                label="Confirm New Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter your new password"
                show={showConfirm}
                setShow={setShowConfirm}
                hasIcon={true}
              />

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => navigate("/staff/profile")}
                  className="px-8 py-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition flex items-center justify-center gap-3 min-w-40"
                >
                  {saving ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key size={20} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}