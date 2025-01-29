// frontend/src/pages/SellPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { startSell } from "../api/transactions"; // Ensure this function is correctly implemented to handle authenticated requests
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { getActiveToken } from "../api/tokens";

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
  List,
  ListItem,
  ListItemText,
  Chip,
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";

import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com"; // Replace with your backend URL

function SellPage() {
  const [interval, setIntervalVal] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();
  const { user, token } = useAuth(); // Access user and token from AuthContext
  const [activeToken, setActiveToken] = useState(null);

  useEffect(() => {
    let socket;

    if (user) {
      // Initialize Socket.IO client
      socket = io(SOCKET_SERVER_URL, {
        auth: {
          token: token, // If your backend requires authentication
        },
      });

      // Join the room with chatId
      socket.emit("join", user.chatId);

      // Listen for transaction updates
      socket.on("transactionUpdate", (data) => {
        setTransactions((prev) => [...prev, data]);
      });

      // Listen for sell process completion
      socket.on("sellProcessCompleted", (data) => {
        setResult(
          `Sell process completed.\nSuccess: ${data.successCount}, Fail: ${data.failCount}`
        );
        setIsLoading(false);
      });

      // Handle connection errors
      socket.on("connect_error", (err) => {
        console.error("Connection Error:", err.message);
      });
    }

    // Cleanup on component unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input Validation
    if (!interval.trim()) {
      setResult("Please enter the timer interval.");
      return;
    }

    const timerIntervalNumber = parseInt(interval, 10);
    if (isNaN(timerIntervalNumber) || timerIntervalNumber < 0) {
      setResult(
        "Please enter a valid non-negative number for the timer interval."
      );
      return;
    }

    try {
      const fetchedToken = await getActiveToken(user.chatId);
      setActiveToken(fetchedToken);

      if (!fetchedToken) {
        setResult("No active token selected.");
        return;
      }

      setIsLoading(true);
      setResult("Executing sell process...");
      setTransactions([]); // Reset previous transactions

      // Initiate the sell process using authenticated user data
      await startSell(user.chatId, timerIntervalNumber, token);

      // No need to set result here; it will be updated via WebSocket
    } catch (err) {
      console.error("Error starting sell", err);
      // Display specific error message if available
      if (err.response && err.response.data && err.response.data.error) {
        setResult(`Error: ${err.response.data.error}`);
      } else {
        setResult("Error starting sell.");
      }
      setIsLoading(false);
    }
  };

  // If user is not logged in, prompt them to log in
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
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <SellIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5">
            Start Sell Process
          </Typography>
        </Box>

        {result && (
          <Alert
            severity={
              result.startsWith("Sell process completed") ? "success" : "info"
            }
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {result}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            required
            fullWidth
            id="interval"
            label="Timer Interval (ms) between sells"
            name="interval"
            type="number"
            inputProps={{ step: "1", min: "0" }}
            margin="normal"
            value={interval}
            onChange={(e) => setIntervalVal(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
            startIcon={isLoading && <CircularProgress size={20} />}>
            {isLoading ? "Executing..." : "Start Sell"}
          </Button>
        </Box>

        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
          disabled={isLoading}>
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
                        ? `✅ Success: Sold ${tx.amount} tokens. Tx Hash: ${tx.txHash}`
                        : tx.status === "failed"
                        ? `❌ Failed to sell tokens.`
                        : tx.status === "no_token"
                        ? `⚠️ No tokens to sell.`
                        : `❗ Error: ${tx.error}`
                    }
                  />
                  {tx.status === "success" && (
                    <Chip label="Success" color="success" />
                  )}
                  {tx.status === "failed" && (
                    <Chip label="Failed" color="error" />
                  )}
                  {tx.status === "no_token" && (
                    <Chip label="No Tokens" color="warning" />
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
