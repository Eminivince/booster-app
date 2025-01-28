// frontend/src/pages/BuyPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { startBuy } from "../api/transactions";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import { getActiveWalletGroup } from "../api/walletGroups"; // Import API to fetch active wallet group

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
} from "@mui/material";

function BuyPage() {
  const [walletGroup, setWalletGroup] = useState(null);
  const [buyAmounts, setBuyAmounts] = useState({});
  const [timeRange, setTimeRange] = useState({ min: 2, max: 30 }); // in minutes
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth(); // Get the logged-in user from context

  // Fetch the active wallet group
  const fetchWalletGroup = async () => {
    if (!user?.chatId) return;
    try {
      const group = await getActiveWalletGroup(user.chatId);
      setWalletGroup(group);

      // Initialize buyAmounts with default values (e.g., 0)
      const initialAmounts = {};
      group.wallets.forEach((wallet) => {
        initialAmounts[wallet.address] = "";
      });
      setBuyAmounts(initialAmounts);
    } catch (err) {
      console.error("Error fetching wallet group:", err);
      setResult("Error fetching wallet group.");
    }
  };

  useEffect(() => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate("/login");
      return;
    }
    fetchWalletGroup();
  }, [user, navigate]);

  // Handle buy amount change for a specific wallet
  const handleAmountChange = (address, value) => {
    setBuyAmounts((prev) => ({
      ...prev,
      [address]: value,
    }));
  };

  // Handle time range change
  const handleTimeRangeChange = (e) => {
    const { name, value } = e.target;
    setTimeRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletGroup) {
      setResult("No active wallet group found.");
      return;
    }

    // Validate buy amounts
    const amounts = Object.values(buyAmounts);
    if (amounts.some((amt) => !amt.trim() || isNaN(amt) || Number(amt) <= 0)) {
      setResult("Please enter valid buy amounts for all wallets.");
      return;
    }

    // Validate time range
    const min = Number(timeRange.min);
    const max = Number(timeRange.max);
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0 || min > max) {
      setResult("Please enter a valid time range (min ≤ max, both > 0).");
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      // Prepare payload: array of { walletAddress, amount }
      const buyDetails = walletGroup.wallets.map((wallet) => ({
        walletAddress: wallet.address,
        amount: buyAmounts[wallet.address],
      }));

      const resp = await startBuy(user.chatId, buyDetails, {
        minDelayMinutes: min,
        maxDelayMinutes: max,
      });

      setResult(
        `Buy process initiated.\nSuccess: ${resp.successCount}, Fail: ${resp.failCount}`
      );
    } catch (err) {
      console.error("Error starting buy:", err);
      setResult(
        err.response?.data?.error ||
          "An error occurred while starting the buy process."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not logged in, prompt to log in
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Start Buy Process
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please log in to start buying tokens.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/login")}>
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
          Start Buy Process
        </Typography>

        {result && (
          <Alert
            severity={
              result.startsWith("Buy process initiated") ? "success" : "error"
            }
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
            {result}
          </Alert>
        )}

        {walletGroup ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" gutterBottom>
              Buy Amounts per Wallet:
            </Typography>
            <Grid container spacing={2}>
              {walletGroup.wallets.map((wallet) => (
                <Grid item xs={12} sm={6} key={wallet.address}>
                  <TextField
                    label={wallet.address}
                    type="number"
                    inputProps={{ step: "0.0001", min: "0" }}
                    value={buyAmounts[wallet.address]}
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
              Transaction Time Range (between buys):
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Min (minutes)"
                  name="min"
                  type="number"
                  inputProps={{ min: "1" }}
                  value={timeRange.min}
                  onChange={handleTimeRangeChange}
                  required
                  fullWidth
                  disabled={isLoading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Max (minutes)"
                  name="max"
                  type="number"
                  inputProps={{ min: "1" }}
                  value={timeRange.max}
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
                {isLoading ? "Starting Buy Process..." : "Start Buy"}
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
          sx={{ mt: 4 }}
          >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
}

export default BuyPage;
