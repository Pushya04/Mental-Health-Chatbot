import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function formatDate(dateStr) {
    if (!dateStr) return "Unknown date";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getSummary(chatArr) {
    if (!Array.isArray(chatArr) || chatArr.length === 0) return "(No messages)";
    // Find first user message
    const firstUser = chatArr.find(m => m.role === 'user' || m.question !== '__system__');
    if (firstUser && (firstUser.question || firstUser.content)) {
        return (firstUser.question || firstUser.content).slice(0, 60) + (firstUser.question && firstUser.question.length > 60 ? '…' : '');
    }
    return "(No summary)";
}

function ChatHistory() {
    const [list, setList] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    useEffect(() => {
        retrieveList();
    }, []);

    function retrieveList() {
        const stored = localStorage.getItem('user');
        const token = stored ? JSON.parse(stored).token : null;
        if (!token) {
            console.warn('No auth token found — user may not be logged in');
            return;
        }

        axios.get("http://localhost:5001/chat", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
                setList(res.data);
            }).catch((err) => {
                console.log(err);
            });
    }

    function handleDelete(id) {
        setDeleteId(id);
        setShowConfirm(true);
    }

    function confirmDelete() {
        setShowConfirm(false);
        if (!deleteId) return;
        const stored = localStorage.getItem('user');
        const token = stored ? JSON.parse(stored).token : null;
        axios.delete(`http://localhost:5001/chat/${deleteId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(() => {
                toast.success('Chat deleted successfully.');
                retrieveList(); // Always reload from backend after delete
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    toast.error('Chat not found or already deleted.');
                } else {
                    toast.error('Failed to delete chat.');
                }
                retrieveList(); // Also reload in case of error to sync UI
            });
        setDeleteId(null);
    }

    function cancelDelete() {
        setShowConfirm(false);
        setDeleteId(null);
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <div style={{ width: 220, background: '#232733', color: '#fff', padding: '32px 0', minHeight: '100vh', boxShadow: '2px 0 8px 0 rgba(0,0,0,0.08)' }}>
                <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 32 }}>EmpaTalk</div>
                <div style={{ padding: '0 16px' }}>
                    <a href="/" style={{ color: '#fff', textDecoration: 'none', display: 'block', margin: '18px 0' }}>Home</a>
                    <a href="/newchatpage" style={{ color: '#fff', textDecoration: 'none', display: 'block', margin: '18px 0' }}>New Chat</a>
                    <a href="/chathistory" style={{ color: '#fff', textDecoration: 'none', display: 'block', margin: '18px 0', fontWeight: 600 }}>Chat History</a>
                    <a href="/logout" style={{ color: '#fff', textDecoration: 'none', display: 'block', margin: '18px 0' }}>Logout</a>
                </div>
            </div>
            {/* Main content */}
            <div style={{ flex: 1, background: 'rgba(30,34,44,0.98)', padding: '32px 0' }}>
                <div style={{ maxWidth: 600, margin: '0 auto' }}>
                    <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: 32 }}>Chat History</h1>
                    {list.length === 0 && <div style={{ color: '#aaa', textAlign: 'center' }}>(No chats found)</div>}
                    {list.map((item) => (
                        <ChatTile key={item._id} date={item.date} id={item._id} chat={item.chat} onDelete={handleDelete} />
                    ))}
                </div>
                {showConfirm && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div style={{ background: '#232733', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)', minWidth: 320, textAlign: 'center' }}>
                            <div style={{ color: '#fff', fontSize: 18, marginBottom: 18 }}>Are you sure you want to delete this chat?</div>
                            <button onClick={confirmDelete} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontWeight: 600, marginRight: 16, cursor: 'pointer' }}>Delete</button>
                            <button onClick={cancelDelete} style={{ background: '#232733', color: '#fff', border: '1px solid #aaa', borderRadius: 6, padding: '10px 22px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ChatTile(props) {
    return (
        <div style={{ background: '#232733', borderRadius: 12, marginBottom: 18, padding: '18px 22px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)', position: 'relative' }}>
            <div style={{ color: '#7ec3ff', fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{formatDate(props.date)}</div>
            <button onClick={() => props.onDelete(props.id)} style={{ position: 'absolute', top: 16, right: 16, background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
            <div>
                {Array.isArray(props.chat) && props.chat.length > 0 ? (
                    props.chat.map((msg, idx) => (
                        <div key={idx} style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: msg.question === '__system__' || msg.answer ? 'flex-start' : 'flex-end' }}>
                            {msg.question && msg.question !== '__system__' && (
                                <div style={{ color: '#fff', background: '#1a2233', borderRadius: 6, padding: '7px 12px', marginBottom: 2, alignSelf: 'flex-end', maxWidth: 400 }}>
                                    <b style={{ color: '#7ec3ff' }}>User:</b> {msg.question}
                                </div>
                            )}
                            {msg.answer && (
                                <div style={{ color: '#fff', background: '#0084ff', borderRadius: 6, padding: '7px 12px', alignSelf: 'flex-start', maxWidth: 400 }}>
                                    <b style={{ color: '#fff' }}>Chatbot:</b> {msg.answer}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ color: '#aaa' }}>(No messages)</div>
                )}
            </div>
        </div>
    );
}

export default ChatHistory;