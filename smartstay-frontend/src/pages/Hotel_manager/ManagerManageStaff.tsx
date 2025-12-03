import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import "./ManagerDashboard.css";

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
      const [staffRes, recRes] = await Promise.all([
        axios.get<StaffApi[]>(
          `https://localhost:7168/api/users/staff/hotel/${user.hotelId}`
        ),
        axios.get<ReceptionistApi[]>(
          `https://localhost:7168/api/users/receptionists/hotel/${user.hotelId}`
        ),
      ]);


      const staffRows: StaffRow[] = staffRes.data.map((s) => ({
        id: String(s.staffID),
        source: "Staff",
        hotelID: s.hotelID,
        fullName: s.fullName,
        position: s.position,
        gender: s.gender,
        contactNumber: s.contactNumber,
        email: s.email,
        createdDate: s.hiredate,
      }));

      const receptionistRows: StaffRow[] = recRes.data.map((r) => ({
        id: r.userID,
        source: "Receptionist",
        hotelID: r.hotelID,
        fullName: r.fullName,
        position: "Receptionist",
        gender: r.gender,
        contactNumber: r.contactNumber ?? "",
        email: r.email,
        createdDate: r.createddate,
        passwordHash: r.passwordHash ?? ""
      }));

      const merged = [...staffRows, ...receptionistRows];
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

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.fullName.toLowerCase().includes(s) ||
          p.position.toLowerCase().includes(s) ||
          p.email.toLowerCase().includes(s)
      );
    }

    if (roleFilter) {
      data = data.filter((p) => p.source === roleFilter);
    }

    setFilteredRows(data);
  }, [rows, search, roleFilter]);

  // Add person
  async function handleAddPerson() {
    if (!user?.hotelId) return;

    try {
      if (newPerson.source === "Staff") {
        await axios.post("https://localhost:7168/api/users/staff", {
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
        const res: any = await axios.post(
          "https://localhost:7168/api/users/receptionists",
          {
            FullName: newPerson.fullName,
            Gender: newPerson.gender,
            Email: newPerson.email,
            HotelID: user.hotelId,
            PasswordHash: "Staff@123",
            Role: "Receptionist"
          }
        );

        alert(
          `Receptionist registered!\n\nUserID: ${res.data.userID}\nPassword: Staff@123`
        );
      }

      setShowAdd(false);
      fetchStaff();
    } catch (err: any) {
      console.error("ADD ERROR:", err.response?.data);
      alert("Failed to add person.");
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
        `https://localhost:7168/api/users/staff/${selectedPerson.id}`,
        payload
      );
    } 
    else {
      // RECEPTIONIST UPDATE PAYLOAD (match User model exactly)
      const payload = {
        fullName: selectedPerson.fullName,
        gender: selectedPerson.gender,
        email: selectedPerson.email,
        role: "Receptionist",                // REQUIRED
        hotelID: selectedPerson.hotelID,     // REQUIRED
        passwordHash: selectedPerson.passwordHash || "Staff@123"
      };

      await axios.put(
        `https://localhost:7168/api/users/receptionists/${selectedPerson.id}`,
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
          `https://localhost:7168/api/users/staff/${row.id}`
        );
      } else {
        await axios.delete(
          `https://localhost:7168/api/users/receptionists/${row.id}`
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
        <input
          className="search-bar"
          placeholder="Search staff or receptionist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value as "" | PersonSource)
          }
        >
          <option value="">All</option>
          <option value="Staff">Staff</option>
          <option value="Receptionist">Receptionist</option>
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
