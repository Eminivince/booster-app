// frontend/src/api/transactions.js
import axios from "axios";

// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5080/api";
const API_BASE = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com/api";

export async function distributeAMB(chatId, amount) {
  const res = await axios.post(`${API_BASE}/distribute`, {
    chatId,
    amount,
  });
  console.log(res.data);
  return res.data;
}

export async function collectFunds(chatId) {
  const res = await axios.post(`${API_BASE}/collect`, { chatId });
  console.log(res.data);
  return res.data;
}

export async function burnAMB(chatId, burnAmount) {
  const res = await axios.post(`${API_BASE}/burn`, {
    chatId,
    burnAmount,
  });
  return res.data;
}

/**
 * Start the buy process for multiple wallets with specified amounts and time range.
 * @param {string} chatId - The user's Chat ID.
 * @param {Array} buyDetails - Array of { walletAddress, amount } objects.
 * @param {Object} timeRange - { minDelayMinutes, maxDelayMinutes }
 * @returns {Promise<Object>} - The response containing successCount and failCount.
 */
// export async function startBuy(chatId, buyDetails, timeRange) {
//   const res = await axios.post(`${API_BASE}/buy`, {
//     chatId,
//     buyDetails, // Array of { walletAddress, amount }
//     timeRange, // { minDelayMinutes, maxDelayMinutes }
//   });
//   return res.data; // e.g., { message, successCount, failCount }
// }

export async function startBuy(chatId, buyDetails, timeRange, token) {
  const res = await axios.post(`${API_BASE}/buy`, {
    chatId,
    buyDetails,
    timeRange,
  });
  return res.data;
}

export async function startSell(chatId, sellDetails, timeRange, token) {
  const res = await axios.post(`${API_BASE}/sell`, {
    chatId,
    sellDetails,
    timeRange,
  });
  return res.data;
}
