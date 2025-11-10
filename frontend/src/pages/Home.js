import React from "react";

export default function Home() {
  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(120deg, #0ea5e9 0%, #22d3ee 100%)' }}>
      <div className="card" style={{ padding: 40, borderRadius: 18, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)', background: 'rgba(30,34,44,0.98)', maxWidth: 480, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="https://img.icons8.com/fluency/96/robot-2.png" alt="AI Chatbot" style={{ width: 72, marginBottom: 12 }} />
          <h1 style={{ margin: 0, color: '#22d3ee', fontWeight: 800, fontSize: 32, letterSpacing: 1 }}>EmpaTalk</h1>
          <div style={{ color: '#fff', fontSize: 18, marginTop: 8, marginBottom: 18, fontWeight: 500 }}>
            Your Private AI Mental Health Chatbot
          </div>
          <div style={{ color: '#97a3b6', fontSize: 15, marginBottom: 24 }}>
            EmpaTalk is a safe, confidential, and always-available AI assistant designed to support your mental well-being. Start a conversation and let your thoughts flow.
          </div>
          <a href="/newchatpage" style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #0ea5e9 0%, #22d3ee 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            padding: '12px 32px',
            borderRadius: 8,
            textDecoration: 'none',
            boxShadow: '0 2px 8px 0 rgba(0,132,255,0.10)',
            transition: 'background 0.2s',
          }}>Start Chatting</a>
        </div>
      </div>
    </div>
  );
}
