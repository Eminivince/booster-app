// frontend/src/api/walletGroups.js
import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5080/api";
const API_BASE = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com/api";

export async function getWalletGroups(chatId) {
  const res = await axios.get(`${API_BASE}/wallet-groups?chatId=${chatId}`);
  return res.data;
}

export async function getActiveWalletGroup(chatId) {
  const res = await axios.get(
    `${API_BASE}/wallet-groups/active?chatId=${chatId}`
  );
  console.log(res.data);
  return res.data;
}

export async function createWalletGroup(chatId, groupName) {
  const res = await axios.post(`${API_BASE}/create-wallet-group`, {
    chatId,
    groupName,
  });
  return res.data;
}

export async function activateWalletGroup(chatId, groupId) {
  const res = await axios.post(`${API_BASE}/activate-wallet-group`, {
    chatId,
    groupId,
  });
  return res.data;
}

// 1) View the active wallet group (no groupId)
export async function viewWalletGroup(chatId) {
  const res = await axios.get(`${API_BASE}/view-wallet-group?chatId=${chatId}`);
  return res.data; // the active group's details (or error/null)
}

// 2) View a specific wallet group by ID
export async function viewWalletGroupById(chatId, groupId) {
  // we assume an endpoint like GET /api/view-wallet-group/:groupId?chatId=...
  const res = await axios.get(
    `${API_BASE}/view-wallet-group/${groupId}?chatId=${chatId}`
  );
  return res.data; // the requested group's details
}
