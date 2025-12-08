import React, { useState, useEffect } from "react";
import { User, Mail, Building, Calendar, Shield, Key, LogOut } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { useAuthStore } from "../../store";
import { useNavigate } from "react-router-dom";
import { usersAPI } from "../../services/api";

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  hotelId: number | null;
  hotel: { hotelId: number; hotelName: string; address: string; city: string } | null;
  createdAt: string;
}

export default function StaffProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId) return;
      try {
        const res = await usersAPI.getCurrentUser(user.userId);
        if (res.success) setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.userId]);

  const handleLogout = () => {

    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar activePage="My Profile" setActivePage={() => {}} setSidebarCollapsed={setSidebarCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"} p-6`}>
          <div className="flex items-center justify-center h-screen">
            <p className="text-gray-600 text-lg">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar activePage="My Profile" setActivePage={() => {}} setSidebarCollapsed={setSidebarCollapsed} />

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"} p-6`}>
        {/* Header */}
        <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 shadow-sm">
              <User className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">View your account details and manage password</p>
            </div>
          </div>
        </header>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {getInitials(profile.fullName)}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-xl text-indigo-600 font-medium mt-1">{profile.role}</p>
              <div className="flex flex-wrap items-center gap-4 mt-4 justify-center sm:justify-start">
                <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Staff Account
                </span>
                <span className="text-sm text-gray-500">
                  Member since {new Date(profile.createdAt).toLocaleDateString("en-MY", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <User className="h-6 w-6 text-indigo-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">{profile.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-lg font-medium text-gray-900 mt-1 flex items-center gap-2">
                    <Mail size={18} className="text-gray-400" />
                    {profile.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff ID</p>
                  <p className="text-lg font-mono font-bold text-indigo-600 mt-1">{profile.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Role</p>
                  <p className="text-lg font-bold text-indigo-600 mt-1">{profile.role}</p>
                </div>
              </div>
            </div>

            {/* Workplace */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Building className="h-6 w-6 text-indigo-600" />
                Workplace
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Assigned Hotel</p>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {profile.hotel?.hotelName || "System Administrator (No hotel assigned)"}
                  </p>
                  {profile.hotel && (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.hotel.address}, {profile.hotel.city}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/staff/profile/password")}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-medium transition"
                >
                  <Key size={20} />
                  Change Password
                </button>

                <hr className="border-gray-200" />


                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
              <p className="text-sm opacity-80">Need help?</p>
              <p className="text-lg font-medium mt-2">Contact Admin Support</p>
              <p className="text-sm opacity-70 mt-1">admin@smartstay.com</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}