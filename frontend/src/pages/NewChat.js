import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function NewChat() {
  const request = useLocation();
  const [id, setId] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch chat on load
  useEffect(() => {
    const key = request.state?.key;
    if (key) {
      setId(key);
      retrieveList(key);
    }
  // (removed unused eslint-disable-next-line)
  }, [request.state?.key]);

  async function retrieveList(key) {
    const stored = localStorage.getItem("user");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) {
      console.warn("No auth token found — user may not be logged in");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5001/chat/${key}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(Array.isArray(res.data?.chat) ? res.data.chat : []);
    } catch (err) {
      console.error("Fetch chat failed:", err);
      alert("Unable to fetch chat: " + (err.response?.data?.message || err.message));
    }
  }

  async function handleQuestion() {
    if (!id) return;
    const stored = localStorage.getItem("user");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) {
      alert("You must be logged in to ask a question");
      return;
    }
    const q = (question || "").trim();
    if (!q) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `http://localhost:5001/chat/${id}`,
        { question: q },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // server returns the whole chat document; use its chat array
      setMessages(Array.isArray(data?.chat) ? data.chat : []);
      setQuestion("");
    } catch (err) {
      console.error("Ask question error", err);
      alert("Unable to get response: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="newchat">
      <div>
        <b>
          <h1 align="center" className="newchat-h1">
            New Chat
          </h1>
        </b>
        <br />
      </div>

      {/* Render messages. Special-case the system welcome message */}
      {messages?.map((res, idx) => {
        const isSystem = res?.question === "__system__" && res?.meta?.system;
        const suggestion = res?.meta?.suggestion;
        const quote = res?.meta?.quote;

        if (isSystem) {
          return (
            <div key={res._id || `sys-${idx}`} className="answer">
              <h4>{res.answer}</h4>
            </div>
          );
        }

        // Show model for assistant answers only
        return (
          <div key={res._id || idx}>
            {res.meta && res.meta.model && (
              <div style={{ color: '#7ec3ff', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Model: {res.meta.model}</div>
            )}
            <Answer chat={res.question} meta={res.meta} />
            <Question chat={res.answer} />

            {/* Mindfulness suggestion (e.g., 2-minute focus music) */}
            {suggestion && suggestion.url && suggestion.label && (
              <div className="suggestion" style={{ margin: "8px 0" }}>
                <a href={suggestion.url} target="_blank" rel="noreferrer">
                  🎧 {suggestion.label}
                </a>
              </div>
            )}

            {/* Motivational quote */}
            {quote && quote.text && (
              <div className="quote" style={{ margin: "6px 0", fontStyle: "italic" }}>
                “{quote.text}” {quote.author ? `— ${quote.author}` : ""}
              </div>
            )}
          </div>
        );
      })}

      {/* Input area */}
      <div className="Input" style={{ marginTop: 16 }}>
        <textarea
          placeholder="Ask."
          rows={"3"}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <br />
        <br />
        <input
          type="button"
          value={loading ? "Sending..." : "Submit"}
          onClick={handleQuestion}
          className="btn btn-primary"
          disabled={loading}
        />
      </div>

      {/* Feedback on the latest turn */}
      {messages?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Feedback chatId={id} turnIndex={messages.length - 1} />
        </div>
      )}
    </div>
  );
}

function Answer(props) {
  return (
    <div className="answer">
      <h4>{props.chat}</h4>
    </div>
  );
}

function Question(props) {
  return (
    <div className="question">
      <h4>{props.chat}</h4>
    </div>
  );
}

/**
 * Simple feedback widget: star rating + optional comment
 * POSTs to /feedback (protected)
 */
function Feedback({ chatId, turnIndex }) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const stored = localStorage.getItem("user");
    const token = stored ? JSON.parse(stored).token : null;
    if (!token) {
      alert("You must be logged in to submit feedback");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        "http://localhost:5001/feedback",
        { chat: chatId, turnIndex, stars, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Thanks for the feedback!");
      setComment("");
    } catch (err) {
      console.error("Feedback submit failed", err);
      alert("Unable to submit feedback: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback" style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <label style={{ marginBottom: 0 }}>Rate EmpaTalk:</label>
      <select value={stars} onChange={(e) => setStars(Number(e.target.value))}>
        {[5, 4, 3, 2, 1].map((s) => (
          <option key={s} value={s}>
            {s} ⭐
          </option>
        ))}
      </select>
      <input
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ flex: 1, minWidth: 180 }}
      />
      <button onClick={submit} className="btn btn-secondary" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}

export default NewChat;
