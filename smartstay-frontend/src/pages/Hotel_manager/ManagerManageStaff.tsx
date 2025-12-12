import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { API_BASE_URL } from "../../config/api";
import "../../styles/staff.css";

interface StaffApi {
  staffID: number;
  hotelID: number;
  fullName: string;
  position: string;
  gender: string;
  contactNumber: string;
  email: string;
  hiredate: string;
}

interface ReceptionistApi {
  userID: string;
  hotelID: number;
  fullName: string;
  position: string;
  gender: string;
  contactNumber: string | null;
  email: string;
  createddate: string;
  passwordHash?: string; // returned after update
}

type PersonSource = "Staff" | "Receptionist";

interface StaffRow {
  id: string;
  source: PersonSource;
  hotelID: number;
  fullName: string;
  position: string;
  gender: string;
  contactNumber: string;
  email: string;
  createdDate: string;
  passwordHash?: string; // for receptionist edit
}

interface NewPersonState {
  source: PersonSource;
  fullName: string;
  position: string;
  gender: string;
  email: string;
  contactNumber: string;
}

interface ReceptionistResponse {
  userID: string;
  email: string;
  fullName: string;
  gender: string;
  hotelID: number;
  role: string;
  passwordHash: string;
  createdAt: string;
}


export default function ManagerManageStaff() {
  const user = useAuthStore((s) => s.user);

  const [rows, setRows] = useState<StaffRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | PersonSource>("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");


  const [selectedPerson, setSelectedPerson] = useState<StaffRow | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [newPerson, setNewPerson] = useState<NewPersonState>({
    source: "Staff",
    fullName: "",
    position: "",
    gender: "",
    email: "",
    contactNumber: "",
  });

  // Fetch staff + receptionists
  const fetchStaff = async () => {
    if (!user?.hotelId) return;
    setLoading(true);

    try {
      const [staffRes, usersRes] = await Promise.all([
        axios.get<{ success: boolean; data: StaffApi[] }>(`${API_BASE_URL}/api/Staff`),

        axios.get<any[]>(
          `${API_BASE_URL}/api/Users`
        ),
      ]);

      console.log("Staff API response:", staffRes.data);
      console.log("Staff response type:", typeof staffRes.data, Array.isArray(staffRes.data));

      // Handle if response is wrapped or direct array
      const staffArray: StaffApi[] = staffRes.data?.data ?? [];

      // Filter staff by hotelId
      const hotelStaff = staffArray.filter((s: any) => s.hotelId === user.hotelId);

      // Filter receptionists from Users by role and hotelId
      const receptionists = usersRes.data.filter((u: any) =>
        (u.role || u.Role) === 'Receptionist' &&
        (u.hotelID || u.HotelID) === user.hotelId
      );

      const staffRows: StaffRow[] = hotelStaff.map((s: any) => ({
        id: String(s.staffId),
        source: "Staff",
        hotelID: s.hotelId,
        fullName: s.fullName,
        position: s.position,
        gender: s.gender,
        contactNumber: s.contactNumber,
        email: s.email,
        createdDate: s.hireDate,
      }));

      const recRows: StaffRow[] = receptionists.map((r: any) => ({
        id: String(r.userID || r.UserID),
        source: "Receptionist",
        hotelID: r.hotelID || r.HotelID,
        fullName: r.fullName || r.FullName,
        position: "Receptionist",
        gender: r.gender || r.Gender,
        contactNumber: r.contactNumber || r.ContactNumber || "",
        email: r.email || r.Email,
        createdDate: r.createdAt || r.CreatedAt,
        passwordHash: r.passwordHash ?? ""
      }));

      const merged = [...staffRows, ...recRows];
      setRows(merged);
      setFilteredRows(merged);
    } catch (err) {
      console.error("STAFF FETCH ERROR:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, [user?.hotelId]);

  // Filtering
  useEffect(() => {
    let data = [...rows];
    const s = search.toLowerCase();

    if (s.trim()) {
      data = data.filter((p) => {
        const fields = [
          p.fullName,
          p.position,
          p.email,
          p.gender,     // 🔥 allow searching Male/Female
          p.source,
        ];

        return fields.some((v) =>
          String(v ?? "").toLowerCase().includes(s)
        );
      });
    }

    // Role filter (Staff / Receptionist)
    if (roleFilter) {
      data = data.filter((p) => p.source === roleFilter);
    }

    // DATE FILTER (created / hiredate)
    if (filterYear || filterMonth) {
      data = data.filter((p) => {
        const [year, month] = p.createdDate.split("T")[0].split("-");

        if (filterYear && year !== filterYear) return false;
        if (filterMonth && month !== filterMonth) return false;

        return true;
      });
    }

    setFilteredRows(data);
  }, [rows, search, roleFilter, filterYear, filterMonth]);

  // Add person
  async function handleAddPerson() {
    if (!user?.hotelId) {
      alert("Error: No hotel ID found. Please log out and log in again.");
      console.error("User object:", user);
      return;
    }

    try {
      if (newPerson.source === "Staff") {
        console.log("Adding staff with payload:", {
          HotelID: user.hotelId,
          FullName: newPerson.fullName,
          Gender: newPerson.gender,
          Email: newPerson.email,
          Position: newPerson.position,
          ContactNumber: newPerson.contactNumber,
          HireDate: new Date().toISOString(),
        });

        await axios.post(`${API_BASE_URL}/api/Staff`, {
          HotelID: user.hotelId,
          FullName: newPerson.fullName,
          Gender: newPerson.gender,
          Email: newPerson.email,
          Position: newPerson.position,
          ContactNumber: newPerson.contactNumber,
          HireDate: new Date().toISOString(),
        });

        alert("Staff added successfully!");
      } else {
        const payload = {
          UserID: "", // Empty string for auto-generation
          FullName: newPerson.fullName,
          Gender: newPerson.gender,
          Email: newPerson.email,
          HotelID: user.hotelId,
          PasswordHash: "Staff@123",
          Role: "Receptionist"
        };

        console.log("Adding receptionist with payload:", payload);

        const res: any = await axios.post(
          `${API_BASE_URL}/api/Users`,
          payload
        );

        alert(
          `Receptionist registered!\n\nUserID: ${res.data.userID}\nPassword: Staff@123`
        );
      }

      setShowAdd(false);
      fetchStaff();
    } catch (err: any) {
      console.error("ADD ERROR:", err.response?.data);
      console.error("ADD ERROR DETAILS:", JSON.stringify(err.response?.data, null, 2));
      alert("Failed to add person. Check console for details.");
    }
  }

  // Update person
  async function handleUpdatePerson() {
    if (!selectedPerson) return;

    try {
      if (selectedPerson.source === "Staff") {
        // STAFF UPDATE PAYLOAD (match Staff model exactly)
        const payload = {
          fullName: selectedPerson.fullName,
          position: selectedPerson.position,
          gender: selectedPerson.gender,
          email: selectedPerson.email,
          contactNumber: selectedPerson.contactNumber,
        };

        await axios.put(
          `${API_BASE_URL}/api/Staff/${selectedPerson.id}`,
          payload
        );
      }
      else {
        // RECEPTIONIST UPDATE PAYLOAD (match CreateUserRequest)
        const payload = {
          email: selectedPerson.email,
          password: selectedPerson.passwordHash || "Staff@123",
          fullName: selectedPerson.fullName,
          role: "Receptionist",
          hotelID: selectedPerson.hotelID,
        };

        await axios.put(
          `${API_BASE_URL}/api/Users/${selectedPerson.id}`,
          payload
        );
      }

      alert("Updated successfully!");
      setShowEdit(false);
      fetchStaff();

    } catch (err: any) {
      console.error("UPDATE ERROR:", err.response?.data || err);
      alert("Failed to update person.");
    }
  }


  // Delete person
  async function handleDeletePerson(row: StaffRow) {
    if (!window.confirm(`Delete ${row.fullName}?`)) return;

    try {
      if (row.source === "Staff") {
        await axios.delete(
          `${API_BASE_URL}/api/Staff/${row.id}`
        );
      } else {
        await axios.delete(
          `${API_BASE_URL}/api/Users/${row.id}`
        );
      }

      fetchStaff();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete person.");
    }
  }

  const formatDate = (raw: string) =>
    raw.includes("T") ? raw.slice(0, 10) : raw;

  return (
    <div className="rooms-container">
      <h2 className="page-title">👥 Staff Management</h2>

      {/* KPI Cards */}
      <div className="kpi-row">
        <div className="kpi-card available">
          <h4>Total People</h4>
          <p>{rows.length}</p>
        </div>

        <div className="kpi-card">
          <h4>Staff</h4>
          <p>{rows.filter((x) => x.source === "Staff").length}</p>
        </div>

        <div className="kpi-card">
          <h4>Receptionists</h4>
          <p>{rows.filter((x) => x.source === "Receptionist").length}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="top-controls">
        {/* Search Bar */}
        <input
          className="search-bar"
          placeholder="Search name, position, email, gender..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Role Filter */}
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
        >
          <option value="">All Roles</option>
          <option value="Staff">Staff</option>
          <option value="Receptionist">Receptionist</option>
        </select>

        {/* Year Filter */}
        <select
          className="filter-select"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Year</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        {/* Month Filter */}
        <select
          className="filter-select"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
        >
          <option value="">Month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <button className="btn-add" onClick={() => setShowAdd(true)}>
          ➕ Add Person
        </button>
      </div>


      {/* TABLE */}
      {!loading && (
        <table className="rooms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Role</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.fullName}</td>
                <td>{p.position}</td>
                <td>{p.source}</td>
                <td>{p.gender}</td>
                <td>{p.email}</td>
                <td>{formatDate(p.createdDate)}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setSelectedPerson(p);
                      setShowEdit(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeletePerson(p)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add Person</h3>

            <select
              value={newPerson.source}
              onChange={(e) =>
                setNewPerson({
                  ...newPerson,
                  source: e.target.value as PersonSource,
                })
              }
            >
              <option value="Staff">Staff</option>
              <option value="Receptionist">Receptionist</option>
            </select>

            <input
              placeholder="Full Name"
              value={newPerson.fullName}
              onChange={(e) =>
                setNewPerson({ ...newPerson, fullName: e.target.value })
              }
            />

            {/* Only staff sees Position */}
            {newPerson.source === "Staff" && (
              <input
                placeholder="Position"
                value={newPerson.position}
                onChange={(e) =>
                  setNewPerson({ ...newPerson, position: e.target.value })
                }
              />
            )}

            <select
              value={newPerson.gender}
              onChange={(e) =>
                setNewPerson({ ...newPerson, gender: e.target.value })
              }
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <input
              placeholder="Email"
              value={newPerson.email}
              onChange={(e) =>
                setNewPerson({ ...newPerson, email: e.target.value })
              }
            />

            <input
              placeholder="Contact Number"
              value={newPerson.contactNumber}
              onChange={(e) =>
                setNewPerson({
                  ...newPerson,
                  contactNumber: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button className="btn-add" onClick={handleAddPerson}>
                Add
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && selectedPerson && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Edit Person</h3>

            <p>ID: {selectedPerson.id}</p>

            <input
              value={selectedPerson.fullName}
              onChange={(e) =>
                setSelectedPerson({
                  ...selectedPerson,
                  fullName: e.target.value,
                })
              }
            />

            {/* No position change for receptionist */}
            {selectedPerson.source === "Staff" && (
              <input
                value={selectedPerson.position}
                onChange={(e) =>
                  setSelectedPerson({
                    ...selectedPerson,
                    position: e.target.value,
                  })
                }
              />
            )}

            <select
              value={selectedPerson.gender}
              onChange={(e) =>
                setSelectedPerson({
                  ...selectedPerson,
                  gender: e.target.value,
                })
              }
            >
              <option>Male</option>
              <option>Female</option>
            </select>

            <input
              value={selectedPerson.email}
              onChange={(e) =>
                setSelectedPerson({
                  ...selectedPerson,
                  email: e.target.value,
                })
              }
            />

            {selectedPerson.source === "Staff" && (
              <input
                placeholder="Contact Number"
                value={selectedPerson.contactNumber}
                onChange={(e) =>
                  setSelectedPerson({
                    ...selectedPerson,
                    contactNumber: e.target.value,
                  } as StaffRow)
                }
              />
            )}


            {/* Receptionist only → password field */}
            {selectedPerson.source === "Receptionist" && (
              <div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={selectedPerson.passwordHash}
                  onChange={(e) =>
                    setSelectedPerson({
                      ...selectedPerson,
                      passwordHash: e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{ marginTop: 4 }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            )}


            <div className="modal-actions">
              <button className="btn-edit" onClick={handleUpdatePerson}>
                Save
              </button>
              <button
                className="btn-cancel"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
