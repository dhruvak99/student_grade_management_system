import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const token = res.data.access_token;

      const me = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setError(""); // clear error on success
      login(token, me.data.role);
      navigate(me.data.role === "faculty" ? "/faculty" : "/student");
    } catch {
      setUsername("");
      setPassword("");
      setError("Invalid username or password");

      setShake(false);
      requestAnimationFrame(() => {
        setShake(true);
      });
    }
  };

  // ⬇️⬇️⬇️ RETURN MUST BE INSIDE THE FUNCTION ⬇️⬇️⬇️
  return (
    <div className="login-page">
      <div className={`login-card ${shake ? "shake" : ""}`}>
        <h1 className="app-title">Student Grade Management System</h1>
        <p className="app-subtitle">Secure Academic Portal</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit">Login</button>

          {error && <p className="login-error">{error}</p>}
        </form>
      </div>
    </div>
  );
}