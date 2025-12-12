import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { API_BASE_URL } from "../../config/api";
import "../../styles/rooms.css";

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
  const [newPreview, setNewPreview] = useState<string | null>(null);

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
    image: "",
  });

  const fetchRooms = async () => {
    if (!user?.hotelId) {
      console.log("No hotelId for fetching rooms");
      return;
    }

    setLoading(true);
    try {
      // Fetch all rooms and filter by hotelId on frontend
      const res = await axios.get<any[]>(
        `${API_BASE_URL}/api/rooms?hotelId=${user.hotelId}`
      );

      console.log("All rooms response:", res.data);

      // Log all hotelIDs to see what hotels have rooms
      const hotelIDs = res.data.map((room: any) => room.hotelID || room.HotelID);
      console.log("All hotel IDs in rooms:", hotelIDs);
      console.log("User hotelId to match:", user.hotelId, typeof user.hotelId);

      // Filter rooms by current hotelAvailable
      const hotelRooms = res.data.filter((room: any) =>
        (room.hotelID || room.HotelID) === user.hotelId
      );

      console.log(`Filtered ${hotelRooms.length} rooms for hotel ${user.hotelId}`);

      // Map to match Room interface
      const mappedRooms = hotelRooms.map((room: any) => ({
        roomID: room.roomID || room.id,
        hotelID: room.hotelID || room.hotelId || room.HotelID,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight || room.price,
        status: room.status,
        description: room.description || "",
        imageUrl: room.imageUrl || room.imageURL || "",
      }));

      setRooms(mappedRooms);
      setFilteredRooms(mappedRooms);
    } catch (err) {
      console.log("ERROR fetching rooms:", err);
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
    let payload: any = {};
    try {
      if (!user?.hotelId) {
        alert("You are not assigned to a hotel yet.");
        return;
      }
      if (!newRoom.image) {
        alert("Please select an image");
        return;
      }
      // Backend expects Room object, not FormData
      const payload = {
        hotelID: user?.hotelId,
        roomNumber: newRoom.number,
        roomType: newRoom.type,
        pricePerNight: parseFloat(newRoom.price),
        status: newRoom.status,
        description: newRoom.description,
        imageURL: newRoom.image,
      };
      console.log("Sending payload:", payload);


      await axios.post(`${API_BASE_URL}/api/rooms`, payload);

      alert("Room added successfully!");

      setShowAdd(false);
      setNewRoom({
        number: "",
        type: "Deluxe",
        price: "",
        status: "Available",
        description: "",
        image: "",
      });
      fetchRooms();
    }
    catch (err: any) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND RESPONSE:", err.response?.data);
      console.log("Payload sent:", payload);
      console.log("User from store:", user);


      alert("Failed to add room: " + (err.response?.data?.message || err.message));
    }

  }

  // ─────────────────────────────
  // Edit Room
  // ─────────────────────────────
  async function handleUpdateRoom() {
    if (!selectedRoom) return;

    try {
      const payload = {
        hotelID: selectedRoom.hotelID,
        roomNumber: selectedRoom.roomNumber,
        roomType: selectedRoom.roomType,
        pricePerNight: selectedRoom.pricePerNight,
        status: selectedRoom.status,
        description: selectedRoom.description,
        ImageURL: selectedRoom.imageUrl,
      };

      await axios.put(
        `${API_BASE_URL}/api/rooms/${selectedRoom.roomID}`,
        payload
      );

      alert("Room updated successfully!");
      setShowEdit(false);
      fetchRooms();
    } catch (err: any) {
      alert("Failed to update room: " + (err.response?.data?.message || err.message));
    }
  }

  // ─────────────────────────────
  // Delete Room
  // ─────────────────────────────
  async function handleDeleteRoom(id: number) {
    if (!window.confirm("Delete this room?")) return;

    await axios.delete(`${API_BASE_URL}/api/rooms/${id}`);
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

        <button
          className="btn-add"
          disabled={!user?.hotelId}
          onClick={() => {
            if (!user?.hotelId) {
              alert("Your account is not assigned to a hotel yet. Please wait for admin approval.");
              return;
            }
            setShowAdd(true);
          }}
        >
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
              <th>Room No.</th>
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
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setSelectedRoom(r);
                        setShowEdit(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteRoom(r.roomID)}
                    >
                      Delete
                    </button>
                  </div>
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

            {/* Room Image Upload */}
            <label style={{ fontWeight: 600 }}>Room Image</label>

            {/* Custom Upload Button */}
            <label
              className="btn-edit"
              style={{
                display: "inline-block",
                marginBottom: "10px",
                cursor: "pointer",
                padding: "10px 16px",
                borderRadius: "8px",
                background: "#0ea5e9",
                color: "white",
                textAlign: "center"
              }}
              onClick={() => document.getElementById("addImageInput")?.click()}
            >
              📁 Choose Image
            </label>

            {/* Hidden File Input */}
            <input
              type="file"
              id="addImageInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onloadend = () => {
                  setNewRoom({ ...newRoom, image: reader.result as string });
                };
                reader.readAsDataURL(file);
              }}
            />

            {/* Preview */}
            {newRoom.image && (
              <img
                src={newRoom.image}
                alt="Preview"
                style={{
                  width: "100%",
                  height: 180,
                  objectFit: "cover",
                  borderRadius: 8,
                  margin: "10px 0",
                  border: "1px solid #ddd",
                }}
              />
            )}

            {/* Error message */}
            {!newRoom.image && (
              <p style={{ color: "red", fontSize: "14px", marginTop: "4px" }}>
                Please select room image
              </p>
            )}


            {/* Room Number */}
            <label style={{ fontWeight: 600 }}>Room Number</label>
            <input
              placeholder="Room Number"
              value={newRoom.number}
              onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
            />

            {/* Room Type */}
            <label style={{ fontWeight: 600 }}>Room Type</label>
            <select
              value={newRoom.type}
              onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
            >
              <option>Deluxe</option>
              <option>Suite</option>
              <option>Standard</option>
              <option>Family</option>
            </select>

            {/* Price */}
            <label style={{ fontWeight: 600 }}>Price Per Night (RM)</label>
            <input
              type="number"
              placeholder="Price"
              value={newRoom.price}
              onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
            />

            {/* Status */}
            <label style={{ fontWeight: 600 }}>Status</label>
            <select
              value={newRoom.status}
              onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
            >
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>

            {/* Description */}
            <label style={{ fontWeight: 600 }}>Description</label>
            <textarea
              placeholder="Description"
              value={newRoom.description}
              onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            />

            {/* Buttons */}
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

            {/* Show current image */}
            <label style={{ fontWeight: 600 }}>Current Image</label>
            <img
              src={newPreview || selectedRoom.imageUrl}
              alt="Room Preview"
              style={{
                width: "100%",
                height: 180,
                objectFit: "cover",
                borderRadius: 8,
                marginBottom: 12,
                border: "1px solid #ddd",
              }}
            />
            {/* Change image button */}
            <button
              className="btn-edit"
              style={{ marginBottom: 10 }}
              onClick={() => document.getElementById("editImageInput")?.click()}
            >
              Change Image
            </button>

            {/* Hidden file input */}
            <input
              type="file"
              id="editImageInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();

                  reader.onloadend = () => {
                    const base64 = reader.result as string;

                    // Update selectedRoom with new Base64 image
                    setSelectedRoom((prev) =>
                      prev ? { ...prev, imageUrl: base64 } : prev
                    );

                    // Update preview
                    setNewPreview(base64);
                  };

                  reader.readAsDataURL(file);
                }
              }}
            />

            {/* Room Number */}
            <label>Room Number</label>
            <input
              value={selectedRoom.roomNumber}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, roomNumber: e.target.value })}
            />

            {/* Room Type */}
            <label>Room Type</label>
            <input
              value={selectedRoom.roomType}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, roomType: e.target.value })}
            />

            {/* Price */}
            <label>Price Per Night</label>
            <input
              type="number"
              value={selectedRoom.pricePerNight}
              onChange={(e) =>
                setSelectedRoom({ ...selectedRoom, pricePerNight: Number(e.target.value) })
              }
            />

            {/* Status */}
            <label>Status</label>
            <select
              value={selectedRoom.status}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, status: e.target.value })}
            >
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>

            {/* Description */}
            <label>Description</label>
            <textarea
              value={selectedRoom.description}
              onChange={(e) => setSelectedRoom({ ...selectedRoom, description: e.target.value })}
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
