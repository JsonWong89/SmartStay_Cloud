import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";

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
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Fetch rooms
  const fetchRooms = async () => {
    if (!user?.hotelId) return;
    setLoading(true);

    try {
      const res = await axios.get<Room[]>(
        `https://localhost:7168/api/rooms/hotel/${user.hotelId}`
      );
      setRooms(res.data);
    } catch (err) {
      console.log("ERROR:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [user?.hotelId]);

  // Add room
  const handleAddRoom = async () => {
    const roomNumber = (document.getElementById("add-room-number") as HTMLInputElement).value;
    const roomType = (document.getElementById("add-room-type") as HTMLInputElement).value;
    const price = Number((document.getElementById("add-room-price") as HTMLInputElement).value);
    const status = (document.getElementById("add-room-status") as HTMLSelectElement).value;

    const newRoom = {
      HotelID: user?.hotelId,
      RoomNumber: roomNumber,
      RoomType: roomType,
      PricePerNight: price,
      Status: status,
      Description: "",
      ImageURL: ""
    };

    await axios.post("https://localhost:7168/api/rooms", newRoom);

    setShowAdd(false);
    fetchRooms();
  };

  // Update room
  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;

    const roomNumber = (document.getElementById("edit-room-number") as HTMLInputElement).value;
    const roomType = (document.getElementById("edit-room-type") as HTMLInputElement).value;
    const rawPrice = (document.getElementById("edit-room-price") as HTMLInputElement).value;
    const price = parseFloat(rawPrice);
    const status = (document.getElementById("edit-room-status") as HTMLSelectElement).value;
    const description = (document.getElementById("edit-room-description") as HTMLTextAreaElement).value;
    const imageURL = (document.getElementById("edit-room-imageurl") as HTMLInputElement).value;

    const updated = {
      RoomID: selectedRoom.roomID,
      HotelID: selectedRoom.hotelID,
      RoomNumber: roomNumber || selectedRoom.roomNumber,
      RoomType: roomType || selectedRoom.roomType,
      PricePerNight: !isNaN(price) ? price : selectedRoom.pricePerNight,
      Status: status || selectedRoom.status,
      Description: description || selectedRoom.description,
      ImageURL: imageURL || selectedRoom.imageUrl,
    };

    console.log("FINAL UPDATE PAYLOAD:", updated);

    await axios.put(
      `https://localhost:7168/api/rooms/${selectedRoom.roomID}`,
      updated
    );

    setShowEdit(false);
    setSelectedRoom(null);
    fetchRooms();
  };


  // Delete
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm("Delete this room?")) return;
    await axios.delete(`https://localhost:7168/api/rooms/${id}`);
    fetchRooms();
  };

  return (
    <div>

      <h2>Manage Rooms</h2>

      <button onClick={() => setShowAdd(true)}>Add Room</button>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>No</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.roomID}>
                <td>{r.roomNumber}</td>
                <td>{r.roomType}</td>
                <td>RM {r.pricePerNight}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedRoom(r);
                      setShowEdit(true);
                    }}
                  >
                    Edit
                  </button>

                  <button onClick={() => handleDeleteRoom(r.roomID)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ADD ROOM MODAL */}
      {showAdd && (
        <div style={{ background: "#eee", padding: "10px", marginTop: "20px" }}>
          <h3>Add Room</h3>

          <input id="add-room-number" placeholder="Number" /><br />
          <input id="add-room-type" placeholder="Type" /><br />
          <input id="add-room-price" type="number" placeholder="Price" /><br />

          <select id="add-room-status">
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select><br /><br />

          <button onClick={handleAddRoom}>Save</button>
          <button onClick={() => setShowAdd(false)}>Cancel</button>
        </div>
      )}

      {/* EDIT ROOM MODAL */}
      {showEdit && selectedRoom && (
        <div style={{ background: "#eee", padding: "10px", marginTop: "20px" }}>
          <h3>Edit Room</h3>

          <input
            id="edit-room-number"
            defaultValue={selectedRoom.roomNumber}
          /><br />

          <input
            id="edit-room-type"
            defaultValue={selectedRoom.roomType}
          /><br />

          <input
            id="edit-room-price"
            type="number"
            defaultValue={selectedRoom.pricePerNight}
          /><br />

          <select id="edit-room-status" defaultValue={selectedRoom.status}>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>



          <br />
          <textarea
            id="edit-room-description"
            defaultValue={selectedRoom.description}
            placeholder="Description"
          />
          <br />

          <input
            id="edit-room-imageurl"
            defaultValue={selectedRoom.imageUrl}   // <--- FIXED
            placeholder="Image URL"
          />
          <br /><br />



          <button onClick={handleUpdateRoom}>Update</button>
          <button onClick={() => setShowEdit(false)}>Cancel</button>
        </div>
      )}

    </div>
  );
}
