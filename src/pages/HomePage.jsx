// frontend/src/pages/HomePage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Button,
} from "@mui/material";
import { getActiveWalletGroup } from "../api/walletGroups";
import { getActiveToken } from "../api/tokens";
import MainMenu from "../components/MainMenu";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TokenIcon from "@mui/icons-material/Token";

function HomePage() {
  const { user, logout } = useAuth(); // Get the logged-in user object and logout function
  const navigate = useNavigate(); // For navigation if needed

  const [activeGroup, setActiveGroup] = useState(null);
  const [activeToken, setActiveToken] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // If user not logged in, navigate to /login
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Use the user's chatId from context
        const group = await getActiveWalletGroup(user.chatId);
        setActiveGroup(group);

        const token = await getActiveToken(user.chatId);
        setActiveToken(token);
      } catch (err) {
        console.error("Error fetching active group/token:", err);
        setError(
          "Could not fetch active group/token. Please add token or try again later."
        );
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Main menu (if any) */}
      <MainMenu />

      {/* Logout Button */}
      <Box display="flex" justifyContent="flex-end" mb={2} mt={2}>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {/* Active Wallet Group Section */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Wallet Group</Typography>
              </Box>
              {activeGroup ? (
                <Typography variant="body1">{activeGroup.name}</Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None selected.
                </Typography>
              )}
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => navigate("/wallet-groups")}>
                  Manage Wallet Groups
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Active Token Section */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
              <Box display="flex" alignItems="center" mb={2}>
                <TokenIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Active Token</Typography>
              </Box>
              {activeToken ? (
                <Typography variant="body1">
                  {activeToken.symbol} ({activeToken.name})
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  None selected.
                </Typography>
              )}
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={() => navigate("/tokens")}>
                  Manage Tokens
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Additional Information or Actions */}
      {!loading && !error && (
        <Box mt={10}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/buy")}
                startIcon={<TokenIcon />}>
                Buy Tokens
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/sell")}
                startIcon={<TokenIcon />}>
                Sell Tokens
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/burn")}
                startIcon={<TokenIcon />}>
                Burn Tokens
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default HomePage;
