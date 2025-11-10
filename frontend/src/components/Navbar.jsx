import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const active = (p) => (pathname === p ? { color: "#22d3ee" } : {});
  const user = localStorage.getItem('user');

  return (
    <header className="container" style={{ paddingTop: 20 }}>
      <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 800, letterSpacing: .2, fontSize: 18 }}>
          EmpaTalk<span style={{ color: "#22d3ee" }}>.</span>
        </div>
        <nav style={{ display: "flex", gap: 18 }}>
          <Link to="/" style={active("/")}>Home</Link>
          <Link to="/newchatpage" style={active("/newchatpage")}>Chat</Link>
          <Link to="/chathistory" style={active("/chathistory")}>History</Link>
          {user && <Link to="/profile" style={active("/profile")}>Profile</Link>}
          <Link to="/login" style={active("/login")}>Login</Link>
        </nav>
      </div>
    </header>
  );
}
