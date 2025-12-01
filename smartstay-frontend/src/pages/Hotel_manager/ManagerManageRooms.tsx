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

  // Image preview for ADD
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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
    const number = (document.getElementById("add-room-number") as HTMLInputElement).value;
    const type = (document.getElementById("add-room-type") as HTMLSelectElement).value;
    const price = (document.getElementById("add-room-price") as HTMLInputElement).value;
    const status = (document.getElementById("add-room-status") as HTMLSelectElement).value;
    const description = (document.getElementById("add-room-description") as HTMLTextAreaElement).value;
    const imageFileInput = document.getElementById("add-room-image") as HTMLInputElement;
    const imageFile = imageFileInput.files?.[0];

    const formData = new FormData();
    formData.append("HotelID", String(user?.hotelId));
    formData.append("RoomNumber", number);
    formData.append("RoomType", type);
    formData.append("PricePerNight", String(Number(price)));
    formData.append("Status", status);
    formData.append("Description", description);

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    try {
      await axios.post("https://localhost:7168/api/rooms", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Room added successfully!");
      setShowAdd(false);
      setSelectedImage(null);
      fetchRooms();
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err.response?.data);
      alert(JSON.stringify(err.response?.data, null, 2));
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;

    const roomNumber = (document.getElementById("edit-room-number") as HTMLInputElement).value;
    const roomType = (document.getElementById("edit-room-type") as HTMLInputElement).value;

    const rawPrice = (document.getElementById("edit-room-price") as HTMLInputElement).value;
    const price = parseFloat(rawPrice);

    const finalPrice = !isNaN(price) && price > 0 ? price : selectedRoom.pricePerNight;

    const status = (document.getElementById("edit-room-status") as HTMLSelectElement).value;
    const description = (document.getElementById("edit-room-description") as HTMLTextAreaElement).value;
    const imageURL = (document.getElementById("edit-room-imageurl") as HTMLInputElement).value;

    const updated = {
      RoomID: selectedRoom.roomID,
      HotelID: selectedRoom.hotelID,
      RoomNumber: roomNumber || selectedRoom.roomNumber,
      RoomType: roomType || selectedRoom.roomType,
      PricePerNight: finalPrice,
      Status: status || selectedRoom.status,
      Description: description || selectedRoom.description,
      ImageURL: imageURL || selectedRoom.imageUrl,
    };

    console.log("FINAL UPDATE PAYLOAD:", updated);

    await axios.put(
      `https://localhost:7168/api/rooms/${selectedRoom.roomID}`,
      updated
    ).catch(err => {
      console.error("BACKEND ERROR DATA:", err.response?.data);
      console.error("BACKEND ERROR STATUS:", err.response?.status);
    });

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
  <div className="manager-rooms">

    <h2>Manage Rooms</h2>

    <button className="btn btn-add" onClick={() => setShowAdd(true)}>
      Add Room
    </button>

    {/* TABLE */}
    {loading ? (
      <p>Loading...</p>
    ) : rooms.length === 0 ? (
      <p>No rooms found.</p>
    ) : (
      <table className="rooms-table">
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
                  className="btn btn-edit"
                  onClick={() => {
                    setSelectedRoom(r);
                    setShowEdit(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="btn btn-delete"
                  onClick={() => handleDeleteRoom(r.roomID)}
                >
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
      <div className="modal-box">
        <h3>Add Room</h3>

        <input id="add-room-number" placeholder="Number" />
        <select id="add-room-type">
          <option value="Deluxe">Deluxe</option>
          <option value="Suite">Suite</option>
          <option value="Standard">Standard</option>
          <option value="Family">Family</option>
        </select>

        <input id="add-room-price" type="number" placeholder="Price" />

        <select id="add-room-status">
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <textarea id="add-room-description" placeholder="Description" />

        <input id="add-room-image" type="file" accept="image/*" />

        <div className="modal-actions">
          <button className="btn btn-add" onClick={handleAddRoom}>Save</button>
          <button className="btn btn-cancel" onClick={() => setShowAdd(false)}>
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* EDIT MODAL */}
    {showEdit && selectedRoom && (
      <div className="modal-box">
        <h3>Edit Room</h3>

        <input id="edit-room-number" defaultValue={selectedRoom.roomNumber} />
        <input id="edit-room-type" defaultValue={selectedRoom.roomType} />

        <input
          id="edit-room-price"
          type="number"
          defaultValue={selectedRoom.pricePerNight}
        />

        <select id="edit-room-status" defaultValue={selectedRoom.status}>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Maintenance">Maintenance</option>
        </select>

        <textarea
          id="edit-room-description"
          defaultValue={selectedRoom.description}
          placeholder="Description"
        />

        <input
          id="edit-room-imageurl"
          defaultValue={selectedRoom.imageUrl}
          placeholder="Image URL"
        />

        <div className="modal-actions">
          <button className="btn btn-edit" onClick={handleUpdateRoom}>
            Update
          </button>
          <button className="btn btn-cancel" onClick={() => setShowEdit(false)}>
            Cancel
          </button>
        </div>
      </div>
    )}

  </div>
);
}
