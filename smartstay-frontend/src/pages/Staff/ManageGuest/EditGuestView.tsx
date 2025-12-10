import React, { useState } from "react";
import { Save, ArrowLeft, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, IdCard } from "lucide-react";
import { Guest } from "./types";

interface Props {
  guest: Guest;
  onSave: (updatedGuest: Partial<Guest>) => void;
  onBack: () => void;
  saving?: boolean;
  success?: boolean;
}

export default function EditGuestView({ guest, onSave, onBack, saving, success }: Props) {
  const [formData, setFormData] = useState({
    fullName: guest.fullName || "",
    icNumber: guest.icNumber || "",
    email: guest.email || "",
    phoneNumber: guest.phoneNumber || "",
    address: guest.address || "",
    gender: guest.gender || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate initials (e.g. "Ali Abu" → "AA")
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    const first = words[0]?.[0]?.toUpperCase() || "";
    const last = words.length > 1 ? words[words.length - 1][0]?.toUpperCase() : "";
    return first + last || "G";
  };

  const initials = getInitials(formData.fullName || "Guest");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    if (!formData.icNumber) {
      newErrors.icNumber = "IC Number is required";
    } else if (!/^\d{12}$/.test(formData.icNumber)) {
      newErrors.icNumber = "IC Number must be exactly 12 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{8,15}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formattedValue = name === "icNumber" ? value.replace(/\D/g, "").slice(0, 12) : value;

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSave(formData);
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Back Button - Same as GuestDetailsView */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
      >
        <ArrowLeft size={20} />
        Back to Guest Details
      </button>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>Guest updated successfully! Returning to details...</span>
        </div>
      )}

      {/* Header - EXACT same as GuestDetailsView */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <div className="text-2xl font-bold">{initials}</div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{formData.fullName || "Edit Guest"}</h1>
              </div>
              <p className="text-purple-100">Guest ID: {guest.guestId}</p>
              <p className="text-purple-100 text-sm mt-1">
                Account created: {new Date(guest.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form - Same spacing & style */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-300 p-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Personal Information
          </h2>
          <p className="text-sm text-gray-600 mt-2">Update guest details below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              required
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* IC Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IC Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="icNumber"
                value={formData.icNumber}
                onChange={handleChange}
                maxLength={12}
                className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
                  errors.icNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="123456789012"
                required
              />
            </div>
            {errors.icNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.icNumber}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="guest@example.com"
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full pl-11 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="+60123456789"
                required
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.phoneNumber}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address (Optional)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons - Same as other pages */}
        <div className="flex justify-end gap-4 mt-10 pt-8 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-8 py-3.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-base"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-medium transition flex items-center gap-3 shadow-lg text-base"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}