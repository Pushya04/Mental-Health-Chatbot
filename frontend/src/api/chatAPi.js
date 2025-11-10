import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE || "";

const api = axios.create({
  baseURL,
  timeout: 120000 
});

export async function sendChatMessage(message, history = []) {
 
  const res = await api.post("/api/chat", { message, history });
  return { text: res.data.reply, model: res.data.model };
}

export default { sendChatMessage };
