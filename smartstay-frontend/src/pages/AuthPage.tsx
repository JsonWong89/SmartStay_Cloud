import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store";
import { API_ENDPOINTS, apiPost } from "../config/api";

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  fullName: string;
  gender: string;
  icNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  address: string;
}

const AuthPage: React.FC = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Login state
  const [loginForm, setLoginForm] = useState<LoginFormData>({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register state
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    fullName: "",
    gender: "",
    icNumber: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);

  // Common state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState(false);

  // Hotel background images
  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  ];

  // Auto-rotate background images
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect route change
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location]);

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setMessage("");
    setMessageType("");
    setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
    // Update URL without page reload
    navigate(newMode ? "/login" : "/register", { replace: true });
  };

  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  const handleForgotPasswordRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const payload = { Email: forgotPasswordEmail };
      console.log('Forgot password request payload:', payload);

      const response = await fetch(`${API_ENDPOINTS.BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({ message: 'Request sent' }));
      console.log('Forgot password response:', response.status, data);

      if (response.ok) {
        setMessage('✨ Reset code sent! Check your email inbox.');
        setMessageType('success');
        setShowResetForm(true);
      } else {
        console.error('Forgot password error:', data);
        const errorMsg = data.message || data.title || data.error || 'Unable to send reset code. Please verify your email and try again.';
        setMessage(errorMsg);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Forgot password exception:', error);
      setMessage('⚠️ Connection error. Please check your network and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (newPassword !== confirmResetPassword) {
      setMessage('🔒 Passwords don\'t match. Please try again.');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('🔐 Password must be at least 8 characters long.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: forgotPasswordEmail,
        token: resetCode,
        newPassword: newPassword
      };
      console.log('Reset password payload:', payload);

      const response = await fetch(`${API_ENDPOINTS.BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({ message: 'Password reset' }));
      console.log('Reset password response:', response.status, data);

      if (response.ok) {
        setMessage('🎉 Password reset successful! You can now sign in with your new password.');
        setMessageType('success');
        setTimeout(() => {
          setShowForgotPassword(false);
          setShowResetForm(false);
          setForgotPasswordEmail('');
          setResetCode('');
          setNewPassword('');
          setConfirmResetPassword('');
          setMessage('');
          setMessageType('');
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to reset password. Please check your code.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const emailRegex = /\S+@\S+\.[A-Za-z]{2,}/;
      if (!emailRegex.test(loginForm.email)) {
        setMessage("Please enter a valid email address.");
        setMessageType("error");
        return;
      }
      if (loginForm.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setMessageType("error");
        return;
      }

      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
        email: loginForm.email,
        password: loginForm.password,
      });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();

      console.log("Full login response payload:", payload);

      if (!response.ok) {
        const serverMsg = typeof payload === "string" ? payload.slice(0, 180) : payload?.message || "";
        if (response.status === 401) {
          setMessage("Invalid email or password.");
        } else {
          setMessage(`Server responded ${response.status}. ${serverMsg ? "Details: " + serverMsg : "No details."}`);
        }
        setMessageType("error");
        return;
      }

      const userData = payload.user || payload;
      if (!userData) {
        setMessage("Invalid email or password.");
        setMessageType("error");
        return;
      }

      console.log("Login response userData:", userData); // Debug log
      console.log("userData keys:", Object.keys(userData));
      console.log("userData.hotelId:", userData.hotelId);
      console.log("userData.HotelId:", userData.HotelId);
      console.log("userData.hotelID:", userData.hotelID);
      console.log("userData.HotelID:", userData.HotelID);

      const role = (userData.role || userData.Role || "").toLowerCase();
      const userRole = userData.role || userData.Role; // Keep original case for store
      const hotelIdValue = userData.hotelId || userData.HotelId || userData.hotelID || userData.HotelID || undefined;

      console.log("Extracted hotelId:", hotelIdValue);

      setUser({
        userId: userData.id || userData.Id || userData.userId || userData.UserId || userData.userID || userData.UserID || "",
        id: userData.id || userData.Id || userData.userID || userData.UserID,
        fullName: userData.fullName || userData.FullName,
        email: userData.email || userData.Email,
        role: userRole, // Use original case
        hotelName:
          userData.hotelName ||
          userData.HotelName ||
          userData.hotel?.hotelName ||
          userData.Hotel?.HotelName ||
          "",
        hotelId: hotelIdValue,
      });

      console.log("User stored in state with hotelId:", hotelIdValue);
      console.log("Navigating user with role:", role);

      setMessage("Login successful!");
      setMessageType("success");

      setTimeout(() => {
        if (role === "admin") {
          console.log("Redirecting to /admin/dashboard");
          navigate("/admin/dashboard");
        } else if (role === "manager") {
          console.log("Redirecting to /manager");
          navigate("/manager");
        } else if (role === "guest") {
          navigate("/guest/dashboard");
        } else if (role === "receptionist") {
          navigate("/staff/dashboard");
        } else {
          console.warn("Unknown role:", role, "- redirecting to home");
          navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("Error logging in. Please ensure the backend is running.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      if (!registerForm.fullName.trim()) {
        setMessage("Full name is required.");
        setMessageType("error");
        return;
      }
      if (!registerForm.gender) {
        setMessage("Please select your gender.");
        setMessageType("error");
        return;
      }
      if (!registerForm.icNumber.trim()) {
        setMessage("IC Number / Passport is required.");
        setMessageType("error");
        return;
      }
      const emailRegex = /\S+@\S+\.[A-Za-z]{2,}/;
      if (!emailRegex.test(registerForm.email)) {
        setMessage("Please enter a valid email address.");
        setMessageType("error");
        return;
      }
      if (!registerForm.phoneNumber.trim()) {
        setMessage("Phone number is required.");
        setMessageType("error");
        return;
      }
      if (registerForm.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setMessageType("error");
        return;
      }
      if (registerForm.password !== registerForm.confirmPassword) {
        setMessage("Passwords do not match.");
        setMessageType("error");
        return;
      }

      const payload = {
        fullName: registerForm.fullName,
        gender: registerForm.gender,
        icNumber: registerForm.icNumber,
        email: registerForm.email,
        phoneNumber: registerForm.phoneNumber,
        password: registerForm.password,
        address: registerForm.address || null,
      };

      const response = await fetch(`${API_ENDPOINTS.BASE}/api/Auth/register-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json") ? await response.json() : { message: await response.text() };

      if (response.ok) {
        setMessage("Registration successful! Please login.");
        setMessageType("success");
        setTimeout(() => {
          setIsLogin(true);
          setMessage("");
        }, 1500);
      } else {
        setMessage(result.message || `Registration failed (HTTP ${response.status}).`);
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Register network error:", error);
      setMessage(`Network error: ${error.message || "Unable to connect to server."}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Form Panel - Slides left/right */}
        <div
          style={{
            ...styles.formPanel,
            ...(isLogin ? styles.formPanelLeft : styles.formPanelRight),
          }}
        >
          <div style={styles.formContent}>
            {showForgotPassword ? (
              // FORGOT PASSWORD FORM
              <>
                <div style={styles.formHeader}>
                  <h1 style={styles.formTitle}>{showResetForm ? 'Reset Password' : 'Forgot Password'}</h1>
                  <p style={styles.formSubtitle}>
                    {showResetForm ? 'Enter the code sent to your email' : 'Enter your email to receive a reset code'}
                  </p>
                </div>

                {message && (
                  <div
                    style={{
                      ...styles.alert,
                      ...(messageType === "error" ? styles.alertError : styles.alertSuccess),
                    }}
                  >
                    {message}
                  </div>
                )}

                {!showResetForm ? (
                  <form onSubmit={handleForgotPasswordRequest} style={styles.form}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email Address</label>
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        style={styles.input}
                        required
                      />
                    </div>

                    <button type="submit" disabled={loading} style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}>
                      {loading ? "Sending..." : "Send Reset Code"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} style={styles.form}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Reset Code</label>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        style={styles.input}
                        maxLength={6}
                        required
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>New Password</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          style={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={styles.eyeButton}
                        >
                          {showNewPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Minimum 8 characters</p>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Confirm Password</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showConfirmResetPassword ? "text" : "password"}
                          value={confirmResetPassword}
                          onChange={(e) => setConfirmResetPassword(e.target.value)}
                          placeholder="Confirm new password"
                          style={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                          style={styles.eyeButton}
                        >
                          {showConfirmResetPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loading} style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}

                <div style={styles.switchText}>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setShowResetForm(false);
                      setForgotPasswordEmail('');
                      setResetCode('');
                      setNewPassword('');
                      setConfirmResetPassword('');
                      setMessage('');
                      setMessageType('');
                    }}
                    style={styles.switchButton}
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </>
            ) : isLogin ? (
              // LOGIN FORM
              <>
                <div style={styles.formHeader}>
                  <h1 style={styles.formTitle}>Welcome Back</h1>
                  <p style={styles.formSubtitle}>Sign in to your SmartStay account</p>
                </div>

                {message && (
                  <div
                    style={{
                      ...styles.alert,
                      ...(messageType === "error" ? styles.alertError : styles.alertSuccess),
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={loginForm.email}
                      onChange={handleLoginChange}
                      placeholder="your.email@example.com"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.passwordWrapper}>
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        placeholder="Enter your password"
                        style={styles.input}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        style={styles.eyeButton}
                      >
                        {showLoginPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setMessage('');
                        setMessageType('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'underline'
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button type="submit" disabled={loading} style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}>
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div style={styles.switchText}>
                  Don't have an account?{" "}
                  <button onClick={toggleMode} style={styles.switchButton}>
                    Create Account
                  </button>
                </div>
              </>
            ) : (
              // REGISTER FORM
              <>
                <div style={styles.formHeader}>
                  <h1 style={styles.formTitle}>Create Account</h1>
                  <p style={styles.formSubtitle}>Join SmartStay and start booking</p>
                </div>

                {message && (
                  <div
                    style={{
                      ...styles.alert,
                      ...(messageType === "error" ? styles.alertError : styles.alertSuccess),
                    }}
                  >
                    {message}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={registerForm.fullName}
                      onChange={handleRegisterChange}
                      placeholder="Enter your full name"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Gender</label>
                      <select
                        name="gender"
                        value={registerForm.gender}
                        onChange={handleRegisterChange}
                        style={styles.input}
                        required
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>IC / Passport</label>
                      <input
                        type="text"
                        name="icNumber"
                        value={registerForm.icNumber}
                        onChange={handleRegisterChange}
                        placeholder="IC or Passport"
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      placeholder="your.email@example.com"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={registerForm.phoneNumber}
                      onChange={handleRegisterChange}
                      placeholder="+60 12-345-6789"
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Address (Optional)</label>
                    <input
                      type="text"
                      name="address"
                      value={registerForm.address}
                      onChange={handleRegisterChange}
                      placeholder="Your address"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Password</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showRegisterPassword ? "text" : "password"}
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          placeholder="Min. 6 chars"
                          style={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          style={styles.eyeButton}
                        >
                          {showRegisterPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Confirm Password</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterChange}
                          placeholder="Re-enter"
                          style={styles.input}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeButton}
                        >
                          {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{ ...styles.submitButton, ...(loading ? styles.submitButtonDisabled : {}) }}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div style={styles.switchText}>
                  Already have an account?{" "}
                  <button onClick={toggleMode} style={styles.switchButton}>
                    Sign In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Background Panel - Slides right/left */}
        <div
          style={{
            ...styles.backgroundPanel,
            ...(isLogin ? styles.backgroundPanelRight : styles.backgroundPanelLeft),
          }}
        >
          {hotelImages.map((img, index) => (
            <div
              key={index}
              style={{
                ...styles.backgroundImage,
                backgroundImage: `url(${img})`,
                opacity: currentImageIndex === index ? 1 : 0,
              }}
            />
          ))}
          <div style={styles.overlay}>
            <div style={styles.brandContent}>
              <h1 style={styles.brandTitle}>
                Smart<span style={{ color: "#60a5fa" }}>Stay</span>
              </h1>
              <p style={styles.brandSubtitle}>
                {isLogin
                  ? "Discover amazing hotels and experiences"
                  : "Your journey to perfect stays begins here"}
              </p>
              <div style={styles.features}>
                <div style={styles.featureBadge}>
                  <span>Premium Hotels</span>
                </div>
                <div style={styles.featureBadge}>
                  <span>Best Prices</span>
                </div>
                <div style={styles.featureBadge}>
                  <span>Secure Booking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "1200px",
    height: "700px",
    display: "flex",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  formPanel: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    transition: "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    zIndex: 2,
  },
  formPanelLeft: {
    left: 0,
    borderRadius: "24px 0 0 24px",
  },
  formPanelRight: {
    left: "50%",
    borderRadius: "0 24px 24px 0",
  },
  backgroundPanel: {
    position: "absolute",
    width: "50%",
    height: "100%",
    transition: "all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    zIndex: 1,
  },
  backgroundPanelRight: {
    left: "50%",
    borderRadius: "0 24px 24px 0",
  },
  backgroundPanelLeft: {
    left: 0,
    borderRadius: "24px 0 0 24px",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "opacity 1.5s ease-in-out",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
  },
  brandContent: {
    color: "white",
    textAlign: "center",
  },
  brandTitle: {
    fontSize: "48px",
    fontWeight: "bold",
    marginBottom: "16px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
  },
  brandSubtitle: {
    fontSize: "20px",
    marginBottom: "40px",
    opacity: 0.95,
  },
  features: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "16px",
    fontWeight: "500",
  },
  featureBadge: {
    padding: "10px 20px",
    borderRadius: "50px",
    border: "2px solid rgba(96, 165, 250, 0.5)",
    fontSize: "15px",
    fontWeight: "500",
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    color: "#fff",
    transition: "all 0.3s ease",
  },
  formContent: {
    width: "100%",
    maxWidth: "400px",
    maxHeight: "100%",
    overflowY: "auto",
  },
  formHeader: {
    textAlign: "center",
    marginBottom: "24px",
  },
  formTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  alert: {
    padding: "10px 14px",
    borderRadius: "8px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  alertError: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  },
  alertSuccess: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    border: "1px solid #6ee7b7",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  submitButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "8px",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
    cursor: "not-allowed",
  },
  switchText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "16px",
  },
  switchButton: {
    background: "none",
    border: "none",
    color: "#3b82f6",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "13px",
  },
};

export default AuthPage;
