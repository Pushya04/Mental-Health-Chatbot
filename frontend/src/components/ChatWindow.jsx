
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import { toast } from "react-toastify";


function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi, I am EmpaTalk." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState(null);
  const [chatId, setChatId] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  // On unmount, reset chatId and messages so new session starts next time
  useEffect(() => {
    return () => {
      setChatId(null);
      setMessages([{ role: "assistant", content: "Hi, I am EmpaTalk." }]);
    };
  }, []);

  async function onSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const stored = localStorage.getItem('user');
      const token = stored ? JSON.parse(stored).token : null;
      if (!token) throw new Error('Not authenticated');

      let newChatId = chatId;
      if (!chatId) {
        // First message: create new chat session
        const res = await axios.post('http://localhost:5001/chat/new', {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        newChatId = res.data._id;
        setChatId(newChatId);
      }

      // Send message to backend and get response
      const res2 = await axios.post(`http://localhost:5001/chat/${newChatId}`, { question: text }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Get the latest reply only
      const chatArr = Array.isArray(res2.data?.chat) ? res2.data.chat : [];
      const lastTurn = chatArr.length > 0 ? chatArr[chatArr.length - 1] : null;
      if (lastTurn && lastTurn.answer) {
        setMessages((m) => [...m, { role: 'assistant', content: lastTurn.answer }]);
      }
      setModel(res2.data?.model || null);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry—I'm having trouble reaching the model service." }
      ]);
      console.error("ChatWindow error:", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card chat-shell" style={{ width: '100%', maxWidth: 480, minHeight: 520, boxShadow: '0 4px 32px 0 rgba(0,0,0,0.10)', borderRadius: 18, background: 'rgba(30, 34, 44, 0.98)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", justifyContent: "center", alignItems: "center", background: 'rgba(30,34,44,0.96)', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1, color: '#fff' }}>EmpaTalk</div>
        </div>

        {/* Messages */}
        <div className="chat-messages" ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 16px', background: 'rgba(30,34,44,0.92)' }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 14
              }}
            >
              <div
                className={m.role === 'user' ? 'msg-user' : 'msg-bot'}
                style={{
                  maxWidth: '80%',
                  padding: '12px 18px',
                  borderRadius: 16,
                  background: m.role === 'user' ? 'rgba(0, 132, 255, 0.18)' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 16,
                  boxShadow: m.role === 'user' ? '0 2px 8px 0 rgba(0,132,255,0.08)' : '0 2px 8px 0 rgba(0,0,0,0.08)',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 16,
                  borderBottomLeftRadius: m.role === 'user' ? 16 : 4,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line',
                  transition: 'background 0.2s',
                }}
              >
                {m.role === 'assistant' && (/\*\*/.test(m.content) || /^\d+\.\s*\*\*/m.test(m.content))
                  ? (
                    <div>
                      {m.content.split(/\r?\n/).map((line, idx) => {
                        // Numbered point with ** e.g. 1. **Point**
                        const numberedMatch = line.trim().match(/^(\d+)\.\s*\*\*(.+?)\*\*$/);
                        if (numberedMatch) {
                          return (
                            <div key={idx} style={{
                              background: 'rgba(0,132,255,0.13)',
                              color: '#fff',
                              borderRadius: 8,
                              padding: '6px 12px',
                              margin: '6px 0',
                              fontWeight: 600,
                              fontSize: 15,
                              display: 'flex',
                              alignItems: 'center',
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                background: '#0084ff',
                                borderRadius: '50%',
                                marginRight: 10,
                              }}></span>
                              <span style={{ marginRight: 8, color: '#7ec3ff', fontWeight: 700 }}>{numberedMatch[1]}.</span>
                              {numberedMatch[2].trim()}
                            </div>
                          );
                        }
                        // Bullet point with **
                        if (line.trim().startsWith('**')) {
                          const clean = line.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                          return (
                            <div key={idx} style={{
                              background: 'rgba(0,132,255,0.13)',
                              color: '#fff',
                              borderRadius: 8,
                              padding: '6px 12px',
                              margin: '6px 0',
                              fontWeight: 600,
                              fontSize: 15,
                              display: 'flex',
                              alignItems: 'center',
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                background: '#0084ff',
                                borderRadius: '50%',
                                marginRight: 10,
                              }}></span>
                              {clean}
                            </div>
                          );
                        }
                        return <div key={idx} style={{ margin: '2px 0' }}>{line}</div>;
                      })}
                    </div>
                  )
                  : m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 14 }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 18px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: 16,
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 16,
                wordBreak: 'break-word',
                whiteSpace: 'pre-line',
              }}>
                …thinking
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form className="chat-input" onSubmit={onSend} style={{ display: 'flex', alignItems: 'center', padding: 16, borderTop: '1px solid rgba(255,255,255,.06)', background: 'rgba(30,34,44,0.98)', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
          <input
            className="input"
            placeholder="Type a message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, fontSize: 16, padding: '12px 14px', borderRadius: 12, border: 'none', outline: 'none', background: '#232733', color: '#fff', marginRight: 12 }}
          />
          <button className="btn" type="submit" disabled={busy || !input.trim()} style={{ background: '#0084ff', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontWeight: 600, fontSize: 16, cursor: busy || !input.trim() ? 'not-allowed' : 'pointer', opacity: busy || !input.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center' }}>
            <FiSend style={{ verticalAlign: '-2px', marginRight: 6 }} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWindow;
