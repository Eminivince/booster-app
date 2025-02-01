// frontend/src/pages/SellPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { startSell } from "../api/transactions"; // Make sure this function accepts sellDetails and timeRange
import { useAuth } from "../context/AuthContext";
import { getActiveWalletGroup } from "../api/walletGroups"; // Using wallet groups for sell amounts

// Import MUI Components
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";

import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com";

function SellPage() {
  const [walletGroup, setWalletGroup] = useState(null);
  const [sellAmounts, setSellAmounts] = useState({});
  const [timeRange, setTimeRange] = useState({
    minDelayMinutes: 2,
    maxDelayMinutes: 30,
  }); // in minutes
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();
  const { user, token } = useAuth();

  useEffect(() => {
    let socket;

    const initialize = async () => {
      if (!user) return;

      try {
        // Initialize Socket.IO client with authentication
        socket = io(SOCKET_SERVER_URL, {
          auth: { token },
        });

        // Listen for connection errors
        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
        });

        // Join the room with the user's chatId
        socket.emit("join", user.chatId);

        // Listen for sell transaction updates
        socket.on("sellTransactionUpdate", (data) => {
          setTransactions((prev) => [...prev, data]);
        });

        // Listen for sell process completion
        socket.on("sellProcessCompleted", (data) => {
          setResult(
            `Sell process completed.\nSuccess: ${data.successCount}, Fail: ${data.failCount}`
          );
          setIsLoading(false);
        });

        // Fetch the active wallet group to list wallets for sell inputs
        await fetchWalletGroup();
      } catch (err) {
        console.error("Initialization error:", err);
        setResult("Initialization error occurred.");
      }
    };

    initialize();

    // Cleanup on component unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, token]);

  // Fetch the active wallet group
  const fetchWalletGroup = async () => {
    if (!user?.chatId) return;
    try {
      const group = await getActiveWalletGroup(user.chatId);
      setWalletGroup(group);

      // Initialize sellAmounts with empty strings for each wallet
      const initialAmounts = {};
      group.wallets.forEach((wallet) => {
        initialAmounts[wallet.address] = "";
      });
      setSellAmounts(initialAmounts);
    } catch (err) {
      console.error("Error fetching wallet group:", err);
      setResult("Error fetching wallet group.");
    }
  };

  // Handle sell amount change for a specific wallet
  const handleAmountChange = (address, value) => {
    setSellAmounts((prev) => ({
      ...prev,
      [address]: value,
    }));
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    const { name, value } = e.target;
    setTimeRange((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletGroup) {
      setResult("No active wallet group found.");
      return;
    }

    // Validate sell amounts: each must be a positive number
    const amounts = Object.values(sellAmounts);
    if (amounts.some((amt) => !amt.trim() || isNaN(amt) || Number(amt) <= 0)) {
      setResult("Please enter valid sell amounts for all wallets.");
      return;
    }

    // Validate time range
    const { minDelayMinutes, maxDelayMinutes } = timeRange;
    if (
      isNaN(minDelayMinutes) ||
      isNaN(maxDelayMinutes) ||
      minDelayMinutes <= 0 ||
      maxDelayMinutes <= 0 ||
      minDelayMinutes > maxDelayMinutes
    ) {
      setResult("Please enter a valid time range (min ≤ max, both > 0).");
      return;
    }

    setIsLoading(true);
    setResult("");
    setTransactions([]); // Reset previous transactions

    try {
      // Prepare payload: an array of { walletAddress, amount }
      const sellDetails = walletGroup.wallets.map((wallet) => ({
        walletAddress: wallet.address,
        amount: sellAmounts[wallet.address],
      }));

      // Initiate the sell process using authenticated user data.
      // The startSell API should be updated on the backend to process sellDetails and a timeRange.
      await startSell(
        user.chatId,
        sellDetails,
        {
          minDelayMinutes,
          maxDelayMinutes,
        },
        token
      );

      // No need to set result here; updates will arrive via Socket.IO
    } catch (err) {
      console.error("Error starting sell:", err);
      setResult(
        err.response?.data?.error ||
          "An error occurred while starting the sell process."
      );
      setIsLoading(false);
    }
  };

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Sell Tokens
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please log in to execute sell operations.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            startIcon={<SellIcon />}>
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Start Sell Process
        </Typography>

        {result && (
          <Alert
            severity={
              result.startsWith("Sell process completed") ? "success" : "info"
            }
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {result}
          </Alert>
        )}

        {walletGroup ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" gutterBottom>
              Sell Amounts per Wallet:
            </Typography>
            <Grid container spacing={2}>
              {walletGroup.wallets.map((wallet) => (
                <Grid item xs={12} sm={6} key={wallet.address}>
                  <TextField
                    label={wallet.address}
                    type="number"
                    inputProps={{ step: "0.0001", min: "0" }}
                    value={sellAmounts[wallet.address]}
                    onChange={(e) =>
                      handleAmountChange(wallet.address, e.target.value)
                    }
                    required
                    fullWidth
                    disabled={isLoading}
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Transaction Time Range (between sells):
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min (minutes)"
                  name="minDelayMinutes"
                  type="number"
                  inputProps={{ min: "1" }}
                  value={timeRange.minDelayMinutes}
                  onChange={handleTimeRangeChange}
                  required
                  fullWidth
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max (minutes)"
                  name="maxDelayMinutes"
                  type="number"
                  inputProps={{ min: "1" }}
                  value={timeRange.maxDelayMinutes}
                  onChange={handleTimeRangeChange}
                  required
                  fullWidth
                  disabled={isLoading}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading && <CircularProgress size={20} />}>
                {isLoading ? "Starting Sell Process..." : "Start Sell"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="200px">
            <CircularProgress />
          </Box>
        )}

        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate("/")}
          sx={{ mt: 4 }}>
          Back to Home
        </Button>

        {transactions.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Transaction Updates
            </Typography>
            <List>
              {transactions.map((tx, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`Wallet: ${tx.wallet}`}
                    secondary={
                      tx.status === "success"
                        ? `✅ Success: Sold tokens. Tx Hash: ${tx.txHash}`
                        : tx.status === "failed"
                        ? `❌ Failed to sell tokens.`
                        : tx.status === "error"
                        ? `❗ Error: ${tx.error}`
                        : `⚠️ ${tx.status.replace("_", " ").toUpperCase()}`
                    }
                  />
                  {tx.status === "success" && (
                    <Chip label="Success" color="success" />
                  )}
                  {tx.status === "failed" && (
                    <Chip label="Failed" color="error" />
                  )}
                  {tx.status === "error" && (
                    <Chip label="Error" color="error" />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default SellPage;
