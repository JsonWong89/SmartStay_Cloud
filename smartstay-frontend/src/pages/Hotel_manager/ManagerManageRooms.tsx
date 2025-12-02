import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import "./ManagerDashboard.css";

interface Room {
  roomID: number;
  hotelID: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  status: string;
  description: string;
  imageUrl: string;
}

export default function ManagerManageRooms() {
  const user = useAuthStore((s) => s.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [search, setSearch] = useState("");
  const [priceSort, setPriceSort] = useState(""); // low-high, high-low

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [newRoom, setNewRoom] = useState({
    number: "",
    type: "Deluxe",
    price: "",
    status: "Available",
    description: "",
    image: null as File | null,
  });

  const fetchRooms = async () => {
    if (!user?.hotelId) return;

    setLoading(true);
    try {
      const res = await axios.get<Room[]>(
        `https://localhost:7168/api/rooms/hotel/${user.hotelId}`
      );
      setRooms(res.data);
      setFilteredRooms(res.data);
    } catch (err) {
      console.log("ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [user?.hotelId]);

  // ─────────────────────────────
  // 🔍 Search + Filter
  // ─────────────────────────────
  useEffect(() => {
    let data = [...rooms];

    // Search across all fields
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.roomNumber.toLowerCase().includes(s) ||
          r.roomType.toLowerCase().includes(s) ||
          r.status.toLowerCase().includes(s) ||
          String(r.pricePerNight).includes(s)
      );
    }

    // Filter Price
    if (priceSort === "low-high") data.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (priceSort === "high-low") data.sort((a, b) => b.pricePerNight - a.pricePerNight);

    setFilteredRooms(data);
  }, [rooms, search, priceSort]);

  // ─────────────────────────────
  // 📊 KPI Stats
  // ─────────────────────────────
  const totalAvailable = rooms.filter((x) => x.status === "Available").length;
  const totalOccupied = rooms.filter((x) => x.status === "Occupied").length;
  const totalMaintenance = rooms.filter((x) => x.status === "Maintenance").length;

  const roomTypeCounts = rooms.reduce((acc: any, r) => {
    acc[r.roomType] = (acc[r.roomType] || 0) + 1;
    return acc;
  }, {});

  // ─────────────────────────────
  // ➕ Add Room
  // ─────────────────────────────
  async function handleAddRoom() {
    const fd = new FormData();
    fd.append("HotelID", String(user?.hotelId));
    fd.append("RoomNumber", newRoom.number);
    fd.append("RoomType", newRoom.type);
    fd.append("PricePerNight", newRoom.price);
    fd.append("Status", newRoom.status);
    fd.append("Description", newRoom.description);
    if (newRoom.image) fd.append("imageFile", newRoom.image);

    try {
      await axios.post("https://localhost:7168/api/rooms", fd);
      setShowAdd(false);
      fetchRooms();
    } catch (err) {
      console.log(err);
      alert("Failed to add room.");
    }
  }

  // ─────────────────────────────
  // ✏ Edit Room
  // ─────────────────────────────
  async function handleUpdateRoom() {
    if (!selectedRoom) return;

    const updated = {
      RoomID: selectedRoom.roomID,
      HotelID: selectedRoom.hotelID,
      RoomNumber: selectedRoom.roomNumber,
      RoomType: selectedRoom.roomType,
      PricePerNight: selectedRoom.pricePerNight,
      Status: selectedRoom.status,
      Description: selectedRoom.description,
      ImageURL: selectedRoom.imageUrl,
    };

    await axios.put(
      `https://localhost:7168/api/rooms/${selectedRoom.roomID}`,
      updated
    );

    setShowEdit(false);
    setSelectedRoom(null);
    fetchRooms();
  }

  // ─────────────────────────────
  // 🗑 Delete Room
  // ─────────────────────────────
  async function handleDeleteRoom(id: number) {
    if (!window.confirm("Delete this room?")) return;

    await axios.delete(`https://localhost:7168/api/rooms/${id}`);
    fetchRooms();
  }

  return (
    <div className="rooms-container">
      <h2 className="page-title">🏨 Manage Rooms</h2>

      {/* TOP KPI CARDS */}
      <div className="kpi-row">
        <div className="kpi-card available">
          <h4>Available Rooms</h4>
          <p>{totalAvailable}</p>
        </div>

        <div className="kpi-card occupied">
          <h4>Occupied Rooms</h4>
          <p>{totalOccupied}</p>
        </div>

        <div className="kpi-card maintenance">
          <h4>Maintenance</h4>
          <p>{totalMaintenance}</p>
        </div>

        <div className="kpi-card">
          <h4>Room Types</h4>
          <p>{Object.keys(roomTypeCounts).length} types</p>
        </div>
      </div>

      {/* SEARCH + FILTER + ADD */}
      <div className="top-controls">
        <input
          className="search-bar"
          placeholder="Search room number, type, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="filter-select" onChange={(e) => setPriceSort(e.target.value)}>
          <option value="">Sort by Price</option>
          <option value="low-high">Low → High</option>
          <option value="high-low">High → Low</option>
        </select>

        <button className="btn-add" onClick={() => setShowAdd(true)}>
          ➕ Add Room
        </button>
      </div>

      {/* ROOM TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="rooms-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>No</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ width: "150px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRooms.map((r) => (
              <tr key={r.roomID}>
                <td>
                  <img
                    src={r.imageUrl || "/no-image.png"}
                    alt="room"
                    style={{ width: 80, height: 60, objectFit: "cover", borderRadius: 6 }}
                    onError={(e) => (e.currentTarget.src = "/no-image.png")}
                  />
                </td>
                <td>{r.roomNumber}</td>
                <td>{r.roomType}</td>
                <td>RM {r.pricePerNight}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setSelectedRoom(r);
                      setShowEdit(true);
                    }}
                  >
                    Edit
                  </button>

                  <button className="btn-delete" onClick={() => handleDeleteRoom(r.roomID)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New Room</h3>

            <input
              placeholder="Room Number"
              value={newRoom.number}
              onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
            />

            <select
              value={newRoom.type}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
            >
              <option>Deluxe</option>
              <option>Suite</option>
              <option>Standard</option>
              <option>Family</option>
            </select>

            <input
              type="number"
              placeholder="Price"
              value={newRoom.price}
              onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
            />

            <select
              value={newRoom.status}
              onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
            >
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>

            <textarea
              placeholder="Description"
              value={newRoom.description}
              onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            />

            <input type="file" onChange={(e) => setNewRoom({ ...newRoom, image: e.target.files![0] })} />

            <div className="modal-actions">
              <button className="btn-add" onClick={handleAddRoom}>Add</button>
              <button className="btn-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit Room</h3>

            <input
              value={selectedRoom.roomNumber}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, roomNumber: e.target.value })}
            />

            <input
              value={selectedRoom.roomType}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, roomType: e.target.value })}
            />

            <input
              type="number"
              value={selectedRoom.pricePerNight}
              onChange={(e) =>
                setSelectedRoom({ ...selectedRoom, pricePerNight: Number(e.target.value) })
              }
            />

            <select
              value={selectedRoom.status}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, status: e.target.value })}
            >
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>

            <textarea
              value={selectedRoom.description}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, description: e.target.value })}
            />

            <input
              value={selectedRoom.imageUrl}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, imageUrl: e.target.value })}
            />

            <div className="modal-actions">
              <button className="btn-edit" onClick={handleUpdateRoom}>Save</button>
              <button className="btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
