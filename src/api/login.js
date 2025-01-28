// frontend/src/api/login.js
import axios from "axios";

const API_BASE = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com/api";
// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5080/api";
/**
 * POST /api/login
 */
export async function loginUser(chatId) {
  console.log("login in....");
  const res = await axios.post(`${API_BASE}/login`, { chatId });
  console.log(res.data);
  return res.data; // { message, user: { _id, chatId, activeWalletGroupId, activeTokenId } }
}
