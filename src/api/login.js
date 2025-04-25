// frontend/src/api/login.js
import axios from "axios";

const API_BASE = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com/api";
// const API_BASE = "http://localhost:5080/api";
/**
 * POST /api/login
 */
export async function loginUser(username, password) {
  console.log("Logging in...", username);
  const res = await axios.post(`${API_BASE}/login`, { username, password });
  return res.data; // { message, user: { _id, username, activeWalletGroupId, activeTokenId } }
}
