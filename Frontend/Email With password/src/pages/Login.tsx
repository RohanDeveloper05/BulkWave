import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import logo from "../assets/logo01-nobg.png";
import "../styles/Login.css";

const DEMO_EMAIL = "demo@bulkwave.com";
const DEMO_PASSWORD = "BulkWave123";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      form.email === DEMO_EMAIL &&
      form.password === DEMO_PASSWORD
    ) {
      alert("Login Successful!");

      localStorage.setItem("isLoggedIn", "true");

      window.location.href = "/dashboard";
    } else {
      alert("Invalid demo email or password.");
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${8 + Math.random() * 20}px`,
              height: `${8 + Math.random() * 20}px`,
              animationDuration: `${10 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="login-glow" />

      <div className="login-card glass-card">
        <div className="login-content">

          {/* LEFT SIDE */}
          <div className="login-left">

            <div className="login-logo">
              <img src={logo} alt="Bulk Wave" />
            </div>

            <span className="login-badge">
              Welcome Back 👋
            </span>

            <h1>
              Sign in to <span>Bulk Wave</span>
            </h1>

            <p className="login-subtitle">
              This is a demo website. Use the credentials below to access the dashboard.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="input-group">
                <label>Email Address</label>

                <div className="input-wrapper">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    placeholder={DEMO_EMAIL}
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="input-group">
                <label>Password</label>

                <div className="input-wrapper">
                  <Lock size={18} />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={DEMO_PASSWORD}
                    value={form.password}
                    onChange={handleChange}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="login-options">
                <label className="remember">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                  />

                  <span>Remember me</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="login-btn"
              >
                Sign In
                <ArrowRight size={18} />
              </button>

            </form>

          </div>

          {/* RIGHT SIDE */}
          <div className="demo-credentials">

            <div className="demo-header">

              <div className="demo-icon">
                🚀
              </div>

              <div>
                <h3>Demo Account</h3>

                <p>
                  Use the credentials below to explore the Bulk Wave dashboard.
                </p>
              </div>

            </div>

            <div className="demo-item">
              <span className="demo-label">
                Email
              </span>

              <code>{DEMO_EMAIL}</code>
            </div>

            <div className="demo-item">
              <span className="demo-label">
                Password
              </span>

              <code>{DEMO_PASSWORD}</code>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}