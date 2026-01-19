import React, { useState, useEffect } from "react";
import {
  Users, Search, Download,
  Mail, Phone, Calendar, Building2, Briefcase, User,
  VenusAndMars
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { staffAPI, usersAPI } from "../../services/api";
import { useAuthStore } from "../../store";

// Unified interface for displaying staff/users together
interface UnifiedStaff {
  id: string; // Can be staffId or userId
  type: 'staff' | 'user'; // To distinguish the source
  hotelId: number;
  hotelName: string;
  fullName: string;
  position: string;
  contactNumber: string;
  email: string;
  gender: string;
  hireDate: string;
}

export default function StaffListPage() {
  const [activePage, setActivePage] = useState("View Staff");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState<UnifiedStaff[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const hotelId = user?.hotelId;

  useEffect(() => {
    if (!hotelId) return;

    const loadAllStaff = async () => {
      try {
        setLoading(true);
        
        // Fetch both Staff and Users in parallel
        const [staffRes, usersRes] = await Promise.all([
          staffAPI.getAllStaff(hotelId),
          usersAPI.getAllUsers() // No filter - returns all users
        ]);

        console.log('🔍 Staff Response:', staffRes);
        console.log('🔍 Users Response:', usersRes);
        console.log('🔍 Is usersRes an array?', Array.isArray(usersRes));

        const combinedList: UnifiedStaff[] = [];

        // Transform Staff data
        if (staffRes.success && staffRes.data) {
          const transformedStaff = staffRes.data.map(s => ({
            id: `S${s.staffId}`,
            type: 'staff' as const,
            hotelId: s.hotelId,
            hotelName: s.hotelName,
            fullName: s.fullName,
            position: s.position,
            contactNumber: s.contactNumber,
            email: s.email,
            gender: s.gender,
            hireDate: s.hireDate
          }));
          combinedList.push(...transformedStaff);
        }

        // Transform Users data - FILTER BY HOTELID ON FRONTEND
        // Backend returns plain array (not wrapped in { success, data })
        if (Array.isArray(usersRes)) {
          const transformedUsers = usersRes
            .filter(u => u.hotelID === hotelId) // ✅ Filter by hotelID (camelCase!)
            .map(u => ({
              id: u.userID,
              type: 'user' as const,
              hotelId: u.hotelID || hotelId,
              hotelName: '', // Backend doesn't return hotelName in GetAll
              fullName: u.fullName,
              position: u.role, // Role becomes position
              contactNumber: '', // Users table doesn't have phone
              email: u.email,
              gender: u.gender,
              hireDate: u.createdAt // Use createdAt as hireDate
            }));
          combinedList.push(...transformedUsers);
        }

        console.log('✅ Combined List:', combinedList);
        console.log('✅ Total items:', combinedList.length);
        setStaffList(combinedList);
      } catch (err: any) {
        console.error("❌ Failed to load staff/users:", err);
        console.error("❌ Error details:", err.message, err.stack);
        alert(`Failed to load team members: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAllStaff();
  }, [hotelId]);

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: staffList.length,
    managers: staffList.filter(s => 
      s.position.toLowerCase().includes("manager")
    ).length,
    reception: staffList.filter(s => 
      s.position.toLowerCase().includes("reception")
    ).length,
    housekeeping: staffList.filter(s => s.type === 'staff').length, // All staff from Staff table
  };

  const exportToCSV = () => {
    const headers = ["Name", "Position", "Email", "Phone", "Hire Date", "Type"];
    const rows = filteredStaff.map(s => [
      s.fullName,
      s.position,
      s.email,
      s.contactNumber || 'N/A',
      new Date(s.hireDate).toLocaleDateString('en-MY'),
      s.type === 'staff' ? 'Staff' : 'System User'
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team_members_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!hotelId) {
    return (
      <div className="p-8 text-center text-red-600 text-lg">
        Access restricted — Hotel not assigned
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-[230px]"}`}>
        <main className="min-h-screen bg-gray-50 px-4 py-5 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-teal-100 shadow-sm flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Team Members
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    All staff and system users at {staffList[0]?.hotelName || "your hotel"}
                  </p>
                </div>
              </div>

              <button
                onClick={exportToCSV}
                className="px-4 py-2 sm:py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Download size={18} />
                Export List
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
              <StatCard title="Total Team" value={stats.total} icon={<Users className="h-5 w-5 text-teal-600" />} color="teal" />
              <StatCard title="Managers" value={stats.managers} icon={<Briefcase className="h-5 w-5 text-purple-600" />} color="purple" />
              <StatCard title="Reception" value={stats.reception} icon={<Phone className="h-5 w-5 text-blue-600" />} color="blue" />
              <StatCard title="Housekeeping" value={stats.housekeeping} icon={<Building2 className="h-5 w-5 text-amber-600" />} color="amber" />
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </header>

          {/* Staff Table / Cards */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loading ? (
              <div className="p-8 sm:p-12 text-center text-gray-500 py-16 sm:py-24">
                Loading team members...
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No team members found</p>
              </div>
            ) : (
              <>
                {/* Desktop/Tablet Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map((staff) => (
                        <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                staff.type === 'user' ? 'bg-purple-100' : 'bg-teal-100'
                              }`}>
                                <User className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${
                                  staff.type === 'user' ? 'text-purple-600' : 'text-teal-600'
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                  {staff.fullName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  ID: {staff.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              staff.type === 'user' 
                                ? staff.position.toLowerCase().includes('reception')
                                  ? 'bg-blue-100 text-blue-800'  // Blue for Receptionist
                                  : 'bg-purple-100 text-purple-800'  // Purple for Manager/Admin
                                : 'bg-teal-100 text-teal-800'  // Teal for Staff
                            }`}>
                              <Briefcase size={12} className="mr-1" />
                              {staff.position}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <VenusAndMars size={12} className="mr-1" />
                              {staff.gender}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm">
                            <div className="space-y-1">
                              <p className="flex items-center gap-1.5 text-gray-900">
                                <Mail size={14} className="text-gray-400" />
                                {staff.email}
                              </p>
                              {staff.contactNumber && (
                                <p className="flex items-center gap-1.5 text-gray-600">
                                  <Phone size={14} className="text-gray-400" />
                                  {staff.contactNumber}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-gray-400" />
                              {new Date(staff.hireDate).toLocaleDateString('en-MY', {
                                day: 'numeric',
                                month: 'short', year: 'numeric'
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-gray-200">
                  {filteredStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="p-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start gap-3 mb-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            staff.type === 'user' ? 'bg-purple-100' : 'bg-teal-100'
                          }`}>
                            <User className={`h-5 w-5 ${
                              staff.type === 'user' ? 'text-purple-600' : 'text-teal-600'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {staff.fullName}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              ID: {staff.id}
                            </p>
                          </div>
                        </div>

                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          staff.type === 'user' 
                            ? staff.position.toLowerCase().includes('reception')
                              ? 'bg-blue-100 text-blue-800'  // Blue for Receptionist
                              : 'bg-purple-100 text-purple-800'  // Purple for Manager/Admin
                            : 'bg-teal-100 text-teal-800'  // Teal for Staff
                        }`}>
                          {staff.position}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-500 text-xs">Gender</p>
                          <p className="mt-0.5">{staff.gender}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-xs">Joined</p>
                          <p className="mt-0.5">
                            {new Date(staff.hireDate).toLocaleDateString('en-MY', {
                              day: 'numeric',
                              month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-gray-500 text-xs">Contact</p>
                          <p className="mt-0.5">{staff.email}</p>
                          {staff.contactNumber && (
                            <p className="mt-1">{staff.contactNumber}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Reusable Stat Card
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const bgColor = {
    teal: "bg-teal-50 text-teal-600",
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  }[color];

  const borderColor = {
    teal: "border-l-teal-600",
    purple: "border-l-purple-600",
    blue: "border-l-blue-600",
    amber: "border-l-amber-600",
  }[color];

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200 border-l-8 ${borderColor}`}>
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className={`p-2.5 sm:p-3 rounded-lg ${bgColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
}