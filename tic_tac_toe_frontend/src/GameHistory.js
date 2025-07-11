import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";

/**
 * GameHistory
 * Displays a list of the authenticated user's completed games.
 * Fetches /history/ endpoint with JWT. Most recent first.
 * Updates when `refreshTrigger` changes.
 *
 * Props:
 *   - refreshTrigger: any value that changes after a game to refetch history
 */
function outcomeText(outcome) {
  switch (outcome) {
    case "win": return "🏆 Win";
    case "loss": return "❌ Loss";
    case "draw": return "🤝 Draw";
    default: return outcome;
  }
}

function shortDate(dtstr) {
  if (!dtstr) return "-";
  const date = new Date(dtstr);
  return date.toLocaleString([], {dateStyle: "short", timeStyle: "short"});
}

function BoardMini({ board }) {
  // Render a 3x3 mini board
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 11px)",
      gap: 2,
      margin: "4px 0",
    }}>
      {board && board.flat().map((cell, idx) =>
        <div key={idx}
          style={{
            width: 10, height: 10, fontSize: "10px",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid #eee", color: cell === "X" ? "#1976D2" : cell === "O" ? "#FFB300" : "#8a8a8a",
            background: "#fafafa", borderRadius: 2
          }}
        >
          {cell === "X" ? "✖" : cell === "O" ? "○" : ""}
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
export default function GameHistory({ refreshTrigger }) {
  const { isAuthenticated, token } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // Fetch game history, with JWT
  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setLoading(true);
    setErr(null);
    try {
      const resp = await fetch("http://localhost:3001/history/", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setGames(Array.isArray(data.games) ? data.games : []);
      } else {
        setErr("Failed to fetch game history.");
      }
    } catch (e) {
      setErr("Network error");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  if (!isAuthenticated) return null;

  return (
    <aside style={{
      width: 260, minHeight: 370, margin: "0 0 0 15px",
      padding: "16px 10px 12px 14px", background: "var(--bg-primary)",
      border: "1.2px solid var(--border-color)", borderRadius: 11,
      boxShadow: "0 2px 13px rgba(80,100,140,0.07)"
    }}>
      <h2 style={{fontSize:"1.08em", margin:0, fontWeight:700, color:"var(--text-secondary)"}}>Your Game History</h2>
      {loading && <div style={{margin:"10px 0", color:"#999"}}>Loading...</div>}
      {err && <div style={{color:"#cf302e", margin:"10px 0"}}>{err}</div>}
      {(!loading && games.length === 0) && <div style={{margin:"16px 0", color:"#767676"}}>
        No games played yet.
      </div>}
      {games.length > 0 && (
        <ul style={{listStyle:"none", padding:0, margin:0}}>
          {games.map((g, idx) => (
            <li key={g.timestamp+idx}
                style={{
                  borderBottom:"1px solid #ececec",
                  padding:"7px 2px 7px 0",
                  display:"flex", gap:10, alignItems:"center"
                }}>
              <div>
                <BoardMini board={g.board} />
              </div>
              <div style={{flex:'1 1 auto'}}>
                <div style={{fontWeight:600, fontSize:"0.99em"}}>{outcomeText(g.outcome)}</div>
                <div style={{fontSize:"0.90em", color:"#888"}}>
                  vs <b>{g.opponent || "CPU"}</b>
                </div>
                <div style={{fontSize:"0.87em", color:"#aaa"}}>
                  {shortDate(g.timestamp)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
