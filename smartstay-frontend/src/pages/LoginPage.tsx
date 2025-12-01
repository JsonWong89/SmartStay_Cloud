import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
// import API_CONFIG from '../config';
import { useAuthStore } from "../store"; 

interface FormData {
  email: string;
  password: string;
}

interface Styles {
  [key: string]: React.CSSProperties;
}

const LoginPage: React.FC = () => {
  const { setUser } = useAuthStore(); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      // Basic client-side validation
      const emailRegex = /\S+@\S+\.[A-Za-z]{2,}/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Please enter a valid email address.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setMessageType("error");
        setLoading(false);
        return;
      }

      // Call your Staff/User Login API
      const response = await fetch("https://localhost:7161/api/Auth/login/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Extract user data from API response
        const userId = result.data.userId;
        const fullName = result.data.fullName;
        const email = result.data.email;
        const role = result.data.role; // "Admin", "Manager", or "Receptionist"
        const hotelId = result.data.hotelId;
        const hotelName = result.data.hotelName;

        // Store user data in localStorage (temporary solution until you implement auth store)
        // localStorage.setItem('user', JSON.stringify({
        //   userId,
        //   fullName,
        //   email,
        //   role,
        //   hotelId,
        //   hotelName
        // }));

        // Uncomment when auth store is ready:
        setUser({ userId, fullName, email, role, hotelId, hotelName });

        setMessage("Login successful! Redirecting...");
        setMessageType("success");

        // Redirect based on role
        setTimeout(() => {
          if (role === "Admin") {
            navigate("/dashboard"); // Admin can see all hotels
          } else if (role === "Manager") {
            navigate("/dashboard"); // Manager sees their hotel
          } else if (role === "Receptionist") {
            navigate("staff/dashboard"); // Receptionist goes to Front Desk
          } else {
            navigate("/dashboard"); // Default fallback
          }
        }, 1000);

      } else {
        setMessage(result.message || "Invalid email or password.");
        setMessageType("error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Error connecting to server. Please ensure the backend is running on port 5062.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative background accents */}
      <div style={styles.bgAccentTop} />
      <div style={styles.bgAccentBottom} />

      <div style={styles.formBox}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>🏨</div>
          <div>
            <h2 style={{ margin: 0, color: '#1f2937' }}>SmartStay Staff Login</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Sign in to access your dashboard
            </p>
          </div>
        </div>

        {message && (
          <div
            role="alert"
            style={{
              ...styles.alert,
              ...(messageType === 'success' ? styles.alertSuccess : styles.alertError),
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={styles.label}>
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="staff@smartstay.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Email address"
            autoComplete="email"
          />

          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <div style={styles.passwordWrapper}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ ...styles.input, margin: 0 }}
              aria-label="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={styles.eyeButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }} 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Test Credentials Info (Remove in production) */}
        <div style={styles.testCredsBox}>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: 600 }}>
            Test Credentials:
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#9ca3af' }}>
            Admin: sarah.admin@smartstay.com<br/>
            Manager: david.manager@smartstay.com<br/>
            Receptionist: nurul.front@smartstay.com<br/>
            Password: <strong>password123</strong>
          </p>
        </div>

        <div style={styles.footer}>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            Staff Portal • SmartStay Hotel Management System
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  formBox: {
    background: "#fff",
    padding: "40px 35px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "440px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  logoCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '24px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    margin: "8px 0 16px 0",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    outline: 'none',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: '8px',
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '8px',
    fontSize: '18px',
    lineHeight: 1,
  },
  button: {
    width: "100%",
    padding: "14px",
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: '8px',
    fontSize: '15px',
    fontWeight: 600,
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.35)',
    transition: 'all 0.2s',
  },
  alert: {
    padding: '12px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: 500,
  },
  alertSuccess: {
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #6ee7b7',
  },
  alertError: {
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  testCredsBox: {
    marginTop: '20px',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  bgAccentTop: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    filter: 'blur(80px)',
    top: '-100px',
    left: '-100px',
  },
  bgAccentBottom: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    filter: 'blur(90px)',
    bottom: '-150px',
    right: '-150px',
  },
};

export default LoginPage;