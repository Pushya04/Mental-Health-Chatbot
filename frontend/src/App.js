import React, { useReducer } from "react";
import { UserContext } from "./UserContext";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import NewChatPage from "./pages/NewChatPage";
import NewChat from "./pages/NewChat";
import Login from "./pages/Login";
import Register from "./pages/register";
import ChatHistory from "./pages/ChatHistory";
import Logout from "./pages/Logout";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = { user: !!localStorage.getItem("user") };
function reducer(state, action) {
  switch (action.type) {
    case "USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      <Navbar />
      <Routes>
        <Route index element={<Home />} />
        <Route path="/newchatpage" element={<NewChatPage />} />
        <Route path="/newchat" element={<NewChat />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chathistory" element={<ChatHistory />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
    </UserContext.Provider>
  );
}
