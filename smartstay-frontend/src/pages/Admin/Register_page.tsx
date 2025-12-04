import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store";
import { API_ENDPOINTS, apiPost } from "../../config/api";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  hotelId: string;
}

interface Styles {
  [key: string]: React.CSSProperties;
}

const RegisterPage: React.FC = () => {
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    role: "",
    hotelId: "",
  });

  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      // Basic validation
      if (!formData.fullName.trim()) {
        setMessage("Full name is required.");
        setMessageType("error");
        return;
      }
      const emailRegex = /\S+@\S+\.[A-Za-z]{2,}/;
      if (!emailRegex.test(formData.email)) {
        setMessage("Please enter a valid email address.");
        setMessageType("error");
        return;
      }
      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setMessageType("error");
        return;
      }
      if ((formData.role === "Manager") && !formData.hotelId) {
        setMessage("Hotel ID is required for Manager.");
        setMessageType("error");
        return;
      }

      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        passwordHash: formData.password,
        role: formData.role || "Manager",
      };
      if (formData.role === "Manager" && formData.hotelId) {
        payload.hotelId = Number(formData.hotelId);
      }

      const response = await apiPost(API_ENDPOINTS.USERS.BASE, payload);
      const contentType = response.headers.get('content-type') || '';
      const result = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() };

      if (response.ok) {
        setUser({
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        });

        setMessage(result.message || "Registration successful!");
        setMessageType("success");
        setTimeout(() => navigate("/login"), 1200);
      } else {
        setMessage(result.message || `Registration failed (HTTP ${response.status}).`);
        setMessageType("error");
      }
    } catch (error: any) {
      console.error("Register network error:", error);
      const details = error?.message ? ` Details: ${error.message}` : "";
      setMessage(
        `Error registering user. This usually means the API isn't reachable or CORS blocked the request.${details}`
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.bgAccentTop} />
      <div style={styles.bgAccentBottom} />

      <div style={styles.formBox}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>S</div>
          <div>
            <h2 style={{ margin: 0 }}>Create your account</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Join SmartStay to manage hotels with ease</p>
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
          <label htmlFor="fullName" style={styles.label}>Full name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            placeholder="Jane Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label htmlFor="password" style={styles.label}>Password</label>
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
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={styles.eyeButton}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <label htmlFor="role" style={styles.label}>Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Select Role --</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Hotel Manager</option>
          </select>

          {(formData.role === "Manager") && (
            <>
              <label htmlFor="hotelId" style={styles.label}>Hotel ID</label>
              <input
                id="hotelId"
                type="number"
                name="hotelId"
                placeholder="Enter your hotel ID"
                value={formData.hotelId}
                onChange={handleChange}
                style={styles.input}
              />
            </>
          )}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div style={styles.helperRow}>
          <span>Already have an account?</span>{" "}
          <Link to="/login" style={styles.loginLink}>
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

// ✅ Updated styling
const styles: Styles = {
  container: {
    background: "linear-gradient(to right, #4facfe, #00f2fe)",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
    overflow: 'hidden',
  },
  formBox: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    width: "420px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    position: 'relative',
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: 'none',
    transition: 'box-shadow 0.15s, border-color 0.15s',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#374151',
    marginTop: '4px',
    marginBottom: '6px',
  },
  passwordWrapper: {
    position: 'relative',
    marginBottom: '8px',
  },
  eyeButton: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    padding: '4px 6px',
  },
  button: {
    width: "100%",
    padding: "10px",
    background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    marginBottom: "20px", // 🆕 Adds space between button and login text
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
  },
  helperRow: {
    textAlign: "center", // 🆕 Centers the “Login” text
    fontSize: "14px",
    color: "#333",
  },
  loginLink: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: 600,
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  logoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '9999px',
    background: '#e6f0ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '18px',
  },
  alert: {
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '10px',
    fontSize: '14px',
  },
  alertSuccess: {
    background: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #34d399',
  },
  alertError: {
    background: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
  },
  bgAccentTop: {
    position: 'absolute',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    filter: 'blur(60px)',
    top: '-40px',
    left: '-40px',
  },
  bgAccentBottom: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    filter: 'blur(70px)',
    bottom: '-60px',
    right: '-60px',
  },
};

export default RegisterPage;
