import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// ✅ Import your pages
import RegisterPage from "./pages/Admin/Register_page"; // Adjust path if needed
import LoginPage from "./pages/LoginPage";
// You can later add:
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";

// ✅ App component
const App: React.FC = () => {
  return (
    <Routes>
      {/* Default route -> Login */}
      <Route path="/" element={<LoginPage />} />
      {/* Explicit login route for direct links */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin/Manager Registration */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Login Page (optional, will use later) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
