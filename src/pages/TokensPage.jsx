// frontend/src/pages/TokensPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTokens, addToken, activateToken } from "../api/tokens";
import { useAuth } from "../context/AuthContext"; // <--- import your AuthContext

// Import MUI Components
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TokenIcon from "@mui/icons-material/Token";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";

function TokensPage() {
  const [tokens, setTokens] = useState([]);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });
  const [newTokenAddress, setNewTokenAddress] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth(); // get the logged-in user from context

  // Fetch tokens for the logged-in user's chatId
  const fetchTokens = async () => {
    if (!user?.chatId) return; // no user => no fetch
    try {
      const data = await getTokens(user.chatId);
      setTokens(data);
    } catch (err) {
      console.error("Error getting tokens", err);
      setStatusMessage({ type: "error", message: "Error getting tokens" });
    }
  };

  useEffect(() => {
    if (!user) {
      // If not logged in, redirect to login
      navigate("/login");
      return;
    }
    // If user is defined, fetch tokens
    fetchTokens();
  }, [user, navigate]);

  // Handle adding a new token
  const handleAddToken = async (e) => {
    e.preventDefault();
    if (!newTokenAddress.trim()) return;
    if (!user?.chatId) return; // extra safety

    try {
      const added = await addToken(user.chatId, newTokenAddress.trim());
      setStatusMessage({
        type: "success",
        message: `Token added/active: ${added.symbol} (${added.name})`,
      });
      setNewTokenAddress("");
      fetchTokens();
    } catch (err) {
      console.error("Error adding token", err);
      setStatusMessage({ type: "error", message: "Error adding token" });
    }
  };

  // Handle activating an existing token
  const handleActivate = async (tokenId) => {
    try {
      await activateToken(user.chatId, tokenId);
      setStatusMessage({ type: "success", message: "Token activated." });
      fetchTokens();
    } catch (err) {
      console.error("Error activating token", err);
      setStatusMessage({ type: "error", message: "Error activating token" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TokenIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h5" component="h2">
            Manage Tokens
          </Typography>
        </Box>

        {statusMessage.message && (
          <Alert severity={statusMessage.type} sx={{ mb: 2 }}>
            {statusMessage.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleAddToken} noValidate>
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              required
              fullWidth
              id="newTokenAddress"
              label="Contract Address"
              name="newTokenAddress"
              placeholder="Enter contract address"
              value={newTokenAddress}
              onChange={(e) => setNewTokenAddress(e.target.value)}
              disabled={!user}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ ml: 2, height: "56px" }}
              startIcon={<AddCircleIcon />}
              disabled={!user}>
              Add Token
            </Button>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Your Tokens:
        </Typography>
        <List>
          {tokens.map((t) => (
            <ListItem
              key={t._id}
              secondaryAction={
                !t.isActive && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleActivate(t._id)}
                    startIcon={<CheckCircleIcon />}>
                    Activate
                  </Button>
                )
              }>
              <ListItemIcon>
                <TokenIcon color={t.isActive ? "success" : "action"} />
              </ListItemIcon>
              <ListItemText
                primary={`${t.symbol} (${t.name})`}
                secondary={t.isActive ? "Active" : "Inactive"}
              />
            </ListItem>
          ))}
        </List>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default TokensPage;
