import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import GameBoard from "./GameBoard";

// Inner app body with auth-aware nav and modal controls
function MainApp() {
  const [theme, setTheme] = useState('light');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const auth = useAuth();

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const openLogin = () => { auth.setError(null); setShowLogin(true); setShowRegister(false);}
  const openRegister = () => { auth.setError(null); setShowLogin(false); setShowRegister(true);}
  const closeModals = () => { setShowLogin(false); setShowRegister(false); auth.setError(null); };

  const logoutHandler = () => {
    auth.logout();
    closeModals();
  };

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Tic Tac Toe</h1>
        <div className="auth-nav">
          {auth.isAuthenticated ? (
            <>
              <span className="auth-user">Signed in as <strong>{auth.user}</strong></span>
              <button className="btn" onClick={logoutHandler}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={openLogin}>Login</button>
              <button className="btn" style={{marginLeft:8}} onClick={openRegister}>Register</button>
            </>
          )}
        </div>
        <LoginModal
          open={showLogin}
          onClose={closeModals}
          switchToRegister={openRegister}
        />
        <RegisterModal
          open={showRegister}
          onClose={closeModals}
          switchToLogin={openLogin}
        />
        {/* Add Game Board */}
        <div style={{margin: "20px 0 14px 0", width: "100%", display: "flex", flexDirection: "column", alignItems: "center"}}>
          {auth.isAuthenticated && <GameBoard />}
          {!auth.isAuthenticated && (
            <div style={{marginTop: 22, fontSize:"1.12em", color:"#b02020"}}>
              Please login or register to play.
            </div>
          )}
        </div>
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Wrap the app with AuthProvider to provide authentication state/context
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
