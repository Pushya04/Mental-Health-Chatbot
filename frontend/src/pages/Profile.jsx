import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function Profile() {
  const stored = localStorage.getItem('user');
  const userData = stored ? JSON.parse(stored) : {};
  const [name, setName] = useState(userData.name || "");
  const [email, setEmail] = useState(userData.email || "");
  const [newName, setNewName] = useState(name);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(userData.name || "");
    setEmail(userData.email || "");
    setNewName(userData.name || "");
  }, [userData.name, userData.email]);

  const token = userData.token;

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    if (!newName || newName === name) return;
    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5001/user/update-username",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName(res.data.name);
      setNewName(res.data.name);
      localStorage.setItem('user', JSON.stringify({ ...userData, name: res.data.name }));
      toast.success("Username updated!");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to update username.");
      }
    }
    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setLoading(true);
    try {
      await axios.put(
        "http://localhost:5001/user/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to change password.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", background: "#232733", borderRadius: 12, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.12)", padding: 32 }}>
      <h2 style={{ color: "#fff", textAlign: "center", marginBottom: 24 }}>Profile</h2>
      <form onSubmit={handleUsernameChange} style={{ marginBottom: 32 }}>
        <label style={{ color: "#aaa", fontWeight: 600 }}>Email</label>
        <input type="text" value={email} disabled style={{ width: "100%", marginBottom: 18, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#1a2233", color: "#aaa" }} />
        <label style={{ color: "#aaa", fontWeight: 600 }}>Username</label>
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#1a2233", color: "#fff" }} />
        <button type="submit" disabled={loading || newName === name} style={{ width: "100%", background: "#0084ff", color: "#fff", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, fontSize: 16, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>Update Username</button>
      </form>
      <form onSubmit={handlePasswordChange}>
        <label style={{ color: "#aaa", fontWeight: 600 }}>Old Password</label>
        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#1a2233", color: "#fff" }} />
        <label style={{ color: "#aaa", fontWeight: 600 }}>New Password</label>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", marginBottom: 12, padding: 10, borderRadius: 6, border: "1px solid #444", background: "#1a2233", color: "#fff" }} />
        <button type="submit" disabled={loading || !oldPassword || !newPassword} style={{ width: "100%", background: "#22d3ee", color: "#232733", border: "none", borderRadius: 6, padding: 12, fontWeight: 600, fontSize: 16, marginTop: 8, cursor: loading ? 'not-allowed' : 'pointer' }}>Change Password</button>
      </form>
    </div>
  );
}
