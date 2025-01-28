// frontend/src/pages/SellPage.js
import React, { useState } from "react";
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
} from "@mui/material";
import SellIcon from "@mui/icons-material/Sell";

function SellPage() {
  const [interval, setIntervalVal] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, token } = useAuth(); // Access user and token from AuthContext
  const [activeToken, setActiveToken] = useState(null);

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

      // Initiate the sell process using authenticated user data
      const resp = await startSell(
        user.chatId,
        timerIntervalNumber,
        fetchedToken,
        token
      );
      setResult(
        `Sell process complete.\nSuccess: ${resp.successCount}, Fail: ${resp.failCount}`
      );
    } catch (err) {
      console.error("Error starting sell", err);
      // Display specific error message if available
      if (err.response && err.response.data && err.response.data.error) {
        setResult(`Error: ${err.response.data.error}`);
      } else {
        setResult("Error starting sell.");
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
              result.startsWith("Sell process complete") ? "success" : "error"
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
            {isLoading ? "Distributing..." : "Start Sell"}
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
      </Paper>
    </Container>
  );
}

export default SellPage;
