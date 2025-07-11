import React, { useState } from "react";
import { useAuth } from "./AuthContext";

// PUBLIC_INTERFACE
export default function RegisterModal({ open, onClose, onRegistered, switchToLogin }) {
  const { register, loading, error, setError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    const out = await register(username, password);
    if (out.success) {
      if (onRegistered) onRegistered();
      onClose();
    }
    // error handled via context
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <h2>Register</h2>
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
          <button className="btn" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
        </form>
        <div className="auth-switch">
          Already have an account?{" "}
          <button type="button" className="link-btn" onClick={switchToLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
