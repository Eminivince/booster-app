// frontend/src/pages/DistributePage.js
import React, { useState } from "react";
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
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

function DistributePage() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in user from context

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

    try {
      const resp = await distributeAMB(user.chatId, amount.trim());
      setResult(
        `Distribution completed.\nSuccess: ${resp.successCount}, Fail: ${resp.failCount}`
      );
    } catch (err) {
      console.error("Error distributing AMB:", err);
      setResult(
        err.response?.data?.error || "An error occurred while distributing AMB."
      );
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
              result.startsWith("Distribution completed") ? "success" : "error"
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
            onChange={(e) => setAmount(e.target.value)}
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
      </Paper>
    </Container>
  );
}

export default DistributePage;
