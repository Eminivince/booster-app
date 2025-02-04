// frontend/src/pages/DistributePage.js

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { distributeAMB } from "../api/transactions";
import { useAuth } from "../context/AuthContext"; // Import AuthContext

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
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "https://bknd-node-deploy-d242c366d3a5.herokuapp.com";

function DistributePage() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const navigate = useNavigate();
  const { user, token } = useAuth(); // Get the logged-in user and token from context

  useEffect(() => {
    let socket;

    // Function to initialize Socket.IO and setup event listeners
    const initializeSocket = () => {
      if (user) {
        // Initialize Socket.IO client
        socket = io(SOCKET_SERVER_URL, {
          auth: {
            token: token, // If your backend requires authentication
          },
        });

        // Handle connection errors
        socket.on("connect_error", (err) => {
          console.error("Socket connection error:", err.message);
        });

        socket.on("connect", () => {
          console.log("Socket connected.");});

        // Join the room with chatId
        socket.emit("join", user.chatId);

        // Listen for distribute transaction updates
        socket.on("distributeTransactionUpdate", (data) => {
          console.log("Transaction update:", data);
          setTransactions((prev) => [...prev, data]);
        });

        // Listen for distribute process completion
        socket.on("distributeProcessCompleted", (data) => {
          setResult(
            `Distribution process completed.\nSuccess: ${data.successCount}, Fail: ${data.failCount}`
          );
          setIsLoading(false);
        });
      }
    };

    initializeSocket();

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, token]);

  // Handle amount change
  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setResult("Please log in to distribute AMB.");
      return;
    }

    if (!amount.trim()) {
      setResult("Please enter a valid amount.");
      return;
    }

    setIsLoading(true);
    setResult("");
    setTransactions([]); // Reset previous transactions

    try {
      // Initiate the distribute process
      console.log("Distributing AMB...");
      await distributeAMB(user.chatId, amount.trim(), token);
      // No need to set result here; it will be updated via Socket.IO events
    } catch (err) {
      console.error("Error distributing AMB:", err);

      if (
        err.code != "ERR_NETWORK" ||
        err.message != "Network Error" ||
        err.name != "AxiosError"
      ) {
        setResult(
          err.response?.data?.error ||
            "An error occurred while distributing AMB."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in, prompt them to log in
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Distribute AMB
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please log in to distribute AMB.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            startIcon={<MonetizationOnIcon />}>
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
          <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography component="h1" variant="h5">
            Distribute AMB
          </Typography>
        </Box>

        {result && (
          <Alert
            severity={
              result.startsWith("Distribution process completed")
                ? "success"
                : "error"
            }
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {result}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            required
            fullWidth
            id="amount"
            label="Amount (AMB per wallet)"
            name="amount"
            type="number"
            inputProps={{ step: "0.0001", min: "0" }}
            margin="normal"
            value={amount}
            onChange={handleAmountChange}
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
            {isLoading ? "Distributing..." : "Distribute"}
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
                        ? `✅ Success: Distributed AMB. Tx Hash: ${tx.txHash}`
                        : tx.status === "failed"
                        ? `❌ Failed to distribute AMB.`
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
                  {/* Add more chips if needed for other statuses */}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default DistributePage;
