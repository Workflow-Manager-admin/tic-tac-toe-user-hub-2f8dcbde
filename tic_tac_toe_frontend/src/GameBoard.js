import React, { useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * GameBoard - handles game state, UI, and backend interactions.
 * Features:
 * - Show 3x3 tic-tac-toe grid, current turn, outcome, move history.
 * - Authenticated API calls for: start game, make move, reset game.
 * - Minimal, modern UI integrated with parent theme.
 */

// Backend API root (from AuthContext for consistency)
const BACKEND_API = "http://localhost:3001";

// Utility: pretty symbol or blank
function symbol(xo) {
  if (xo === "X") return "✖";
  if (xo === "O") return "○";
  return "";
}

// Board: 3x3 grid buttons with click handling
function Board({ board, onCellClick, disabled }) {
  return (
    <div className="ttt-board" style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 64px)",
      gridGap: "7px",
      margin: "20px auto 12px auto",
      width: "max-content",
      background: "var(--bg-secondary)",
      borderRadius: "12px",
      padding: "14px 12px"
    }}>
      {board.map((row, i) => 
        row.map((cell, j) => (
          <button
            key={i + "-" + j}
            className="ttt-cell"
            style={{
              width: "60px",
              height: "60px",
              fontSize: "2.1em",
              fontWeight: 700,
              color: cell === "X" ? "#1976D2" : cell === "O" ? "#FFB300" : "var(--text-primary)",
              background: "var(--bg-primary)",
              border: "2px solid var(--border-color)",
              borderRadius: "12px",
              cursor: !cell && !disabled ? "pointer" : "not-allowed",
              boxShadow: disabled ? "none" : "0 1px 8px rgba(140,140,140,0.09)"
            }}
            disabled={!!cell || disabled}
            aria-label={`Cell ${i + 1},${j + 1} (${cell || "empty"})`}
            onClick={() => { if (!disabled) onCellClick(i, j); }}
          >{symbol(cell)}</button>
        ))
      )}
    </div>
  );
}


// PUBLIC_INTERFACE
export default function GameBoard() {
  // Auth - get JWT for API, username for display
  const { isAuthenticated, user, token } = useAuth();

  // Game state
  const [game, setGame] = useState(null);  // null | {board, player_x, player_o, next_turn, winner, finished}
  const [error, setError] = useState(null);
  const [moveLoading, setMoveLoading] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Helper for auth header
  function authHeaders() {
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };
  }

  // API: Start new game (vs CPU)
  const startGame = async () => {
    setError(null);
    setStartLoading(true);
    try {
      const resp = await fetch(`${BACKEND_API}/game/start`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          opponent_username: null // placeholder, vs CPU
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setGame(data);
      } else {
        const err = await resp.json();
        setError(err.detail || "Could not start game");
      }
    } catch (e) {
      setError("Network error while starting game");
    } finally {
      setStartLoading(false);
    }
  };

  // API: Make move
  const makeMove = async (row, col) => {
    if (game?.finished || moveLoading) return;
    setMoveLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_API}/game/move`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ row, col })
      });
      if (resp.ok) {
        const data = await resp.json();
        setGame(data);
      } else {
        const err = await resp.json();
        setError(err.detail || "Invalid move");
      }
    } catch (e) {
      setError("Network or server error making move");
    } finally {
      setMoveLoading(false);
    }
  };

  // API: Reset game
  const resetGame = async () => {
    setResetLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_API}/game/reset`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (resp.ok) {
        const data = await resp.json();
        setGame(data);
      } else {
        const err = await resp.json();
        setError(err.detail || "Could not reset game");
      }
    } catch (e) {
      setError("Network error while resetting game");
    } finally {
      setResetLoading(false);
    }
  };

  // Winner/turn message
  function gameStatus() {
    if (!game) {
      return <span>Start a new game to play!</span>;
    }
    if (game.finished) {
      if (game.winner) {
        return <span>
          <strong>{game.winner === user ? "You win! 🎉" : game.winner === "draw" ? "Draw!" :
            (game.winner === game.player_x ? (game.player_x === user ? "You win! 🎉" : "You lose.") : (game.player_o === user ? "You win! 🎉" : "You lose."))}
          </strong>
        </span>;
      }
      return <span><strong>Draw!</strong></span>;
    }
    return <span>
        Turn: <strong style={{color: game.next_turn === "X" ? "#1976D2" : "#FFB300"}}>
          {game.next_turn === "X" ? "X" : "O"}
        </strong>{" "}
        (<small>
           {game.next_turn === "X"
              ? (user === game.player_x ? "Your turn" : "CPU")
              : (user === game.player_o ? "Your turn" : "CPU")}
         </small>
        )
      </span>;
  }

  // Initial board render (empty grid)
  function emptyBoard() {
    return Array(3).fill(0).map(() => Array(3).fill(""));
  }

  // Actions: show/hide
  const showStart = !game;
  const showReset = !!game;
  const canMove = !!game && !game.finished && user === (game.next_turn === "X" ? game.player_x : game.player_o);

  // UI
  return (
    <section style={{
      margin: "0 auto",
      maxWidth: 420,
      padding: "24px 0 32px 0",
      background: "var(--bg-secondary)",
      borderRadius: "12px",
      boxShadow: "0 6px 25px rgba(30,40,90,0.10)",
      minHeight: 425
    }}>
      <h2 style={{fontWeight: 700, margin: "15px 4px 5px 4px", letterSpacing: "0.4px"}}>
        Game Board
      </h2>
      <div style={{
        color: "var(--text-secondary)",
        minHeight: 30,
        marginBottom: "10px",
        marginTop: "-5px",
        fontSize: "1.08em"
      }}>
        {gameStatus()}
      </div>
      {error && <div style={{
        background: "#ffe4e2",
        color: "#cf302e",
        borderRadius: "6px",
        padding: "7px 12px",
        margin: "8px 0 10px 0"
      }}>{error}</div>}
      <Board
        board={game ? game.board : emptyBoard()}
        onCellClick={makeMove}
        disabled={!canMove || moveLoading}
      />
      <div style={{margin: "14px 0"}}>
        {showStart && isAuthenticated &&
          <button className="btn btn-large"
            style={{fontWeight:700, padding: "10px 30px", fontSize:"1.17em"}}
            onClick={startGame}
            disabled={startLoading}
          >{startLoading ? "Starting..." : "Start Game"}</button>}
        {showReset && isAuthenticated &&
          <button className="btn"
            style={{marginLeft: 14, padding: "8px 22px", fontWeight:600, fontSize:"1em"}}
            onClick={resetGame}
            disabled={resetLoading}
          >{resetLoading ? "Resetting..." : "Reset Game"}</button>}
      </div>
      {!isAuthenticated &&
        <div style={{
          color: "#b02020",
          background: "#fff5e6",
          padding: "11px",
          borderRadius: "6px",
          margin: "13px 8px"
        }}>
          Please login to play!
        </div>
      }
      {/* Game players info */}
      {game && <div style={{marginTop: 15, color:"#777", fontSize:"0.98em"}}>
        <span><b>X: </b>{game.player_x} &nbsp;&nbsp;<b>O: </b>{game.player_o}</span>
      </div>}
    </section>
  );
}
