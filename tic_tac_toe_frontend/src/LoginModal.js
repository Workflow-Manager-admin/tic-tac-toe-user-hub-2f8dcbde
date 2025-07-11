import React, { useState } from "react";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export default function LoginModal({ open, onClose, onRegistered, switchToRegister }) {
  const { login, loading, error, setError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const out = await login(username, password);
    if (out.success) {
      onClose();
    }
    // error handled via context
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input autoFocus required type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </label>
          {error && <div className="auth-error">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        </form>
        <div className="auth-switch">
          New user?{" "}
          <button type="button" className="link-btn" onClick={switchToRegister}>
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
