import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuthStore } from "../../store";
import "../../styles/profile.css";


interface ManagerProfileResponse {
    userId: string;
    fullName: string;
    email: string | null;
    gender: string | null;
    password: string | null;
    role: string;
    hotelId: number;
    hotelName: string;
}

export default function ManagerProfile() {
    const user = useAuthStore((s) => s.user);
    const setUser = useAuthStore((s) => s.setUser);

    const [form, setForm] = useState({
        userId: "",
        fullName: "",
        email: "",
        gender: "",
        role: "",
        hotelId: "",
        hotelName: "",
        password: "",        // New password only
        oldPassword: "",     // Display only
    });

    const [showPass, setShowPass] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!user?.id) return;
        loadProfile();
    }, [user?.id]);

    async function loadProfile() {
        const res = await axios.get<ManagerProfileResponse>(
            `https://localhost:7168/api/users/${user?.id}`
        );

        setForm({
            userId: res.data.userId ?? "",
            fullName: res.data.fullName ?? "",
            email: res.data.email ?? "",
            gender: res.data.gender ?? "",
            role: res.data.role ?? "",
            hotelId: res.data.hotelId?.toString() ?? "",
            hotelName: res.data.hotelName ?? "",
            oldPassword: res.data.password ?? "",
            password: "",
        });
    }

    function handleChange(e: any) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function saveChanges() {
        if (!form.userId) return;

        try {
            const payload = {
                email: form.email,
                fullName: form.fullName,
                gender: form.gender,
                role: "Manager",
                hotelID: Number(form.hotelId),
                password: changingPassword && form.password.trim() !== ""
                    ? form.password
                    : "",   // <-- required, cannot be undefined
            };


            // 🔵 UPDATE BACKEND
            await axios.put(
                `https://localhost:7168/api/users/${form.userId}`,
                payload
            );

            // Update global user store so sidebar also updates
            setUser({
                ...user!,
                fullName: form.fullName,
                email: form.email,
                gender: form.gender,   // 🔥 UPDATE GENDER
            });


            alert("Profile updated successfully!");

            if (changingPassword) {
                setChangingPassword(false);
                setForm({ ...form, password: "" });
            }

            await loadProfile();
        } catch (err: any) {
            console.error("MANAGER UPDATE ERROR:", err.response?.data || err);
            alert("Failed to update manager.");
        }
    }



    return (
        <div className="profile-container fade-in">
            <h2 className="profile-title">👤 Manager Profile</h2>

            {message && <p className="success-msg">{message}</p>}

            {/* READ-ONLY FIELDS --------------------------*/}
            <div className="profile-grid">
                <div className="profile-item">
                    <label>User ID</label>
                    <input value={form.userId} disabled />
                </div>

                <div className="profile-item">
                    <label>Role</label>
                    <input value={form.role} disabled />
                </div>

                <div className="profile-item col-span-2">
                    <label>Hotel</label>
                    <input
                        value={
                            form.hotelName
                                ? form.hotelName
                                : "Please contact admin to assign a hotel for you."
                        }
                        disabled
                    />


                </div>
            </div>

            {/* EDITABLE FIELDS ----------------------------*/}
            <div className="profile-grid">
                <div className="profile-item">
                    <label>Full Name</label>
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                    />
                </div>

                <div className="profile-item">
                    <label>Email</label>
                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="profile-item">
                    <label>Gender</label>
                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                    >
                        <option value="">Choose gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                {/* PASSWORD SECTION -----------------------*/}
                <div className="profile-item">
                    <label>Password</label>

                    {!changingPassword ? (
                        // Normal display (masked)
                        <div className="password-box">
                            <input
                                type="password"
                                value={form.oldPassword || ""}
                                disabled
                            />

                            <button
                                className="change-pass-btn"
                                onClick={() => setChangingPassword(true)}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        // Editing password (show old + new)
                        <div className="password-box" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                            {/* 🔥 OLD PASSWORD — masked but still visible */}
                            <input
                                type="password"
                                value={form.oldPassword || ""}
                                disabled
                            />

                            {/* 🔥 NEW PASSWORD FIELD */}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter new password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                <button
                                    type="button"
                                    className="pass-toggle"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    {showPass ? <FiEyeOff /> : <FiEye />}
                                </button>

                                <button
                                    className="change-pass-btn cancel"
                                    onClick={() => {
                                        setChangingPassword(false);
                                        setForm({ ...form, password: "" });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>


            </div>

            <button className="save-btn" onClick={saveChanges}>
                Save Changes
            </button>
        </div>

    );
}
