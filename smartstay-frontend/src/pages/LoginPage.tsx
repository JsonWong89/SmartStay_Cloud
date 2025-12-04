import React, { useState, ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store";
import { API_ENDPOINTS, apiPost } from "../config/api";

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
        return;
      }
      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        setMessageType("error");
        return;
      }

      // Call proper login endpoint with credentials
      let user: any = null;
      try {
        const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password,
        });
        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json') ? await response.json() : await response.text();

        if (!response.ok) {
          const serverMsg = typeof payload === 'string' ? payload.slice(0, 180) : (payload?.message || '');
          if (response.status === 401) {
            setMessage('Invalid email or password.');
          } else {
            setMessage(`Server responded ${response.status}. ${serverMsg ? 'Details: ' + serverMsg : 'No details.'}`);
          }
          setMessageType('error');
          return;
        }
        user = payload;
      } catch (fetchErr: any) {
        console.error('Network/Fetch error:', fetchErr);
        setMessage(`Network error reaching API. ${fetchErr?.message || ''}`);
        setMessageType('error');
        return;
      }
      
      console.log("Login response:", user); // Debug log
      
      // Backend returns { message: "...", user: {...} }
      const userData = user.user || user;
      
      if (!userData) {
        setMessage("Invalid email or password.");
        setMessageType("error");
        return;
      }

      // Login successful
      const role = (userData.role || userData.Role || '').toLowerCase();
      setUser({ 
        id: userData.id || userData.Id,
        fullName: userData.fullName || userData.FullName, 
        email: userData.email || userData.Email, 
        role: userData.role || userData.Role 
      });
      setMessage("Login successful!");
      setMessageType("success");

      // Redirect based on role
      setTimeout(() => {
        if (role === 'admin') {
          navigate("/admin/dashboard");
        } else if (role === 'hotel manager') {
          navigate("/hotel-manager");
        } else if (role === 'guest') {
          navigate("/guest/dashboard");
        } else if (role === 'staff') {
          navigate("/staff");
        } else {
          navigate("/"); // fallback
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

  return (
    <div style={styles.container}>
      {/* Decorative background accents */}
      <div style={styles.bgAccentTop} />
      <div style={styles.bgAccentBottom} />

      <div style={styles.formBox}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>S</div>
          <div>
            <h2 style={{ margin: 0 }}>Welcome back</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>Sign in to your SmartStay account</p>
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
          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            aria-label="Email address"
            autoComplete="email"
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
              aria-label="Password"
              autoComplete="current-password"
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

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={styles.helperRow}>
          <span>Don't have an account?</span>{" "}
          <Link to="/register" style={styles.link}>Register</Link>
        </div>
      </div>
    </div>
  );
};

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
    width: "400px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    position: 'relative',
    zIndex: 1,
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
    marginTop: '10px',
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
    marginTop: '12px',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
  },
  helperRow: {
    marginTop: "14px",
    textAlign: "center",
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 600,
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
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

export default LoginPage;
