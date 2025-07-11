import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { AuthProvider, useAuth } from "./AuthContext";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import GameBoard from "./GameBoard";
import GameHistory from "./GameHistory";

// PUBLIC_INTERFACE
// Inner app body with auth-aware nav, layout, and modals
function MainApp() {
  const [theme, setTheme] = useState('light');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [gameRefresh, setGameRefresh] = useState(0); // trigger history reload
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

  // When a game completes (win/loss/draw), trigger history reload
  const gameCompleteHandler = () => setGameRefresh(gr => gr + 1);

  return (
    <div className="App">
      {/* Navigation/Header Bar */}
      <nav className="header-bar">
        <div className="brand-group">
          <img src={logo} className="App-logo" alt="logo" />
          <span className="brand-title">Tic Tac Toe</span>
        </div>
        <div className="auth-nav">
          {auth.isAuthenticated ? (
            <>
              <span className="auth-user">Signed in as <strong>{auth.user}</strong></span>
              <button className="btn" onClick={logoutHandler}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={openLogin}>Login</button>
              <button className="btn" onClick={openRegister}>Register</button>
            </>
          )}
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </nav>
      {/* Modal structure for auth */}
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

      {/* Main area: GameBoard & History */}
      <main className="main-content">
        <div style={{flex: "2 2 0", display: "flex", flexDirection: "column", alignItems: "center"}}>
          {auth.isAuthenticated ? (
            <GameBoard onGameComplete={gameCompleteHandler} />
          ) : (
            <div style={{
              marginTop: "60px", marginBottom: "18px", fontSize:"1.19em",
              color:"#b02020", background:"#fff4f2", borderRadius:"7px", padding:"1.4em 18px", maxWidth: 390
            }}>
              Please login or register to play.
            </div>
          )}
          <div>
            <span style={{color: "var(--secondary)", fontSize:"0.98em", marginTop:13, display:"block"}}>
              Theme: <strong style={{color:"var(--primary)"}}>{theme}</strong>
            </span>
          </div>
        </div>
        {/* Game history sidebar (hidden if not authenticated) */}
        <div style={{flex: "1 1 0"}}>
          <GameHistory refreshTrigger={gameRefresh} />
        </div>
      </main>

      <footer style={{ marginTop: 18, padding: "10px 0", textAlign:"center", color: "var(--text-secondary)", fontSize:"0.97em"}}>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </footer>
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
