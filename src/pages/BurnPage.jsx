// frontend/src/pages/BurnPage.js
import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { burnAMB } from "../api/transactions";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

function BurnPage() {
  const [burnAmount, setBurnAmount] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user, token } = useAuth(); // Get the logged-in user and token from context

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input Validation
    if (!burnAmount.trim()) {
      setResult("Please enter a valid burn amount.");
      return;
    }

    const burnAmountNumber = parseFloat(burnAmount);
    if (isNaN(burnAmountNumber) || burnAmountNumber <= 0) {
      setResult("Please enter a positive number for the burn amount.");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      // Initiate the burn process using authenticated user data
      const resp = await burnAMB(burnAmountNumber, token);
      setResult(
        `Burn completed.\nSuccess: ${resp.successCount}, Fail: ${resp.failCount}`
      );
    } catch (err) {
      console.error("Error burning AMB:", err);
      // Display specific error message if available
      if (err.response && err.response.data && err.response.data.error) {
        setResult(`Error: ${err.response.data.error}`);
      } else {
        setResult("An error occurred while burning AMB.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in, prompt them to log in
  if (!user || !token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Burn AMB Tokens
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please log in to burn AMB tokens.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}
            startIcon={<LocalFireDepartmentIcon />}>
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <LocalFireDepartmentIcon color="secondary" sx={{ mr: 1 }} />
          <Typography variant="h5">Burn AMB Tokens</Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Burn Amount (AMB per wallet)"
            type="number"
            inputProps={{ step: "0.0001", min: "0" }}
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            fullWidth
            required
            disabled={isLoading}
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}>
            {isLoading ? "Burning..." : "Burn AMB"}
          </Button>
        </form>

        {result && (
          <Box mt={3}>
            {result.startsWith("Error") ? (
              <Alert severity="error" sx={{ whiteSpace: "pre-wrap" }}>
                {result}
              </Alert>
            ) : (
              <Alert severity="success" sx={{ whiteSpace: "pre-wrap" }}>
                {result}
              </Alert>
            )}
          </Box>
        )}

        <Box mt={3}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default BurnPage;
