import React, { useState, useEffect } from "react";
import {
  Users, Search, Download,
  Mail, Phone, Calendar, Building2, Briefcase, User,
  VenusAndMars
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { staffAPI } from "../../services/api";
import { useAuthStore } from "../../store";

interface Staff {
  staffId: number;
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
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const user = useAuthStore((state) => state.user);
  const hotelId = user?.hotelId;

  // Load staff from current hotel only
  useEffect(() => {
    if (!hotelId) return;

    const loadStaff = async () => {
      try {
        setLoading(true);
        const res = await staffAPI.getAllStaff(hotelId);
        if (res.success) {
          setStaffList(res.data);
        }
      } catch (err) {
        alert("Failed to load staff list");
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [hotelId]);

  const filteredStaff = staffList.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: staffList.length,
    managers: staffList.filter(s => s.position.toLowerCase().includes("manager")).length,
    reception: staffList.filter(s => s.position.toLowerCase().includes("reception")).length,
    housekeeping: staffList.filter(s => s.position.toLowerCase().includes("housekeeping")).length,
  };

  const exportToCSV = () => {
    const headers = ["Name", "Position", "Email", "Phone", "Hire Date"];
    const rows = filteredStaff.map(s => [
      s.fullName,
      s.position,
      s.email,
      s.contactNumber,
      new Date(s.hireDate).toLocaleDateString('en-MY')
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `our_team_${new Date().toISOString().split("T")[0]}.csv`;
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
        <main className="p-6">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 shadow-sm">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Staff List</h1>
                  <p className="text-sm text-gray-500">
                    All staff members at {staffList[0]?.hotelName || "your hotel"}
                  </p>
                </div>
              </div>

              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <Download size={18} />
                Export List
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Staff" value={stats.total} icon={<Users className="h-5 w-5 text-teal-600" />} color="teal" />
              <StatCard title="Managers" value={stats.managers} icon={<Briefcase className="h-5 w-5 text-purple-600" />} color="purple" />
              <StatCard title="Reception" value={stats.reception} icon={<Phone className="h-5 w-5 text-blue-600" />} color="blue" />
              <StatCard title="Housekeeping" value={stats.housekeeping} icon={<Building2 className="h-5 w-5 text-amber-600" />} color="amber" />
            </div>

            {/* Search */}
            <div className="relative max-w-lg">
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

          {/* Staff Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            {loading ? (
              <div className="p-12 text-center text-gray-500 py-16">Loading team members...</div>
            ) : filteredStaff.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No staff found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gender</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((staff) => (
                      <tr key={staff.staffId} className="border-b border-gray-300 hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{staff.fullName}</p>
                              <p className="text-xs text-gray-500">ID: S{staff.staffId.toString().padStart(3, "0")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            <Briefcase size={12} className="mr-1" />
                            {staff.position}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            <VenusAndMars size={12} className="mr-1" />
                            {staff.gender}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5 text-gray-900">
                              <Mail size={14} className="text-gray-400" />
                              {staff.email}
                            </p>
                            <p className="flex items-center gap-1.5 text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              {staff.contactNumber}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
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

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}