// frontend/src/pages/ViewWalletGroupPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { viewWalletGroup, viewWalletGroupById } from "../api/walletGroups";
import { useAuth } from "../context/AuthContext";

// Import MUI Components
import {
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

function ViewWalletGroupPage() {
  const { user } = useAuth(); // your logged-in user, containing chatId
  const { groupId } = useParams(); // e.g. /wallet-group/view/:groupId
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
  });

  useEffect(() => {
    if (!user) {
      // If no one is logged in, redirect to login
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        let data;
        if (groupId) {
          // We have a groupId param, so fetch that specific group
          data = await viewWalletGroupById(user.chatId, groupId);
        } else {
          // No groupId param, so fetch the active group
          data = await viewWalletGroup(user.chatId);
        }
        setGroupData(data);
      } catch (err) {
        console.error("Error viewing wallet group:", err);
        setError(err.response?.data?.error || err.message);
      }
    };

    fetchData();
  }, [user, groupId, navigate]);

  const handleCopy = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setSnackbar({
          open: true,
          message: `${label} copied to clipboard!`,
        });
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
        setSnackbar({
          open: true,
          message: `Failed to copy ${label}.`,
        });
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return null; // or some fallback
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={6} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom color="error">
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/")}
            startIcon={<ArrowBackIcon />}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <GroupIcon color="primary" sx={{ fontSize: 40, mr: 1 }} />
          <Typography variant="h5" component="h2">
            View Wallet Group
          </Typography>
        </Box>

        {groupData ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              <strong>Name:</strong> {groupData.name}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Wallets:
            </Typography>
            <List>
              {groupData.wallets?.map((w, index) => (
                <ListItem
                  key={index}
                  sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                  <Box display="flex" alignItems="center" width="100%">
                    <ListItemIcon>
                      <GroupIcon color={w.privateKey ? "action" : "disabled"} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body1"
                            sx={{ wordBreak: "break-all" }}>
                            <strong>Address:</strong> {w.address}
                          </Typography>
                          <Tooltip title="Copy Address">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(w.address, "Address")}>
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ wordBreak: "break-all" }}>
                            <strong>Private Key:</strong>{" "}
                            {w.privateKey || "Hidden"}
                          </Typography>
                          {w.privateKey && (
                            <Tooltip title="Copy Private Key">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleCopy(w.privateKey, "Private Key")
                                }>
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      }
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        ) : (
          <Typography variant="body1">Loading wallet group data...</Typography>
        )}

        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/")}
            startIcon={<ArrowBackIcon />}>
            Back to Home
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={snackbar.message}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        />
      </Paper>
    </Container>
  );
}

export default ViewWalletGroupPage;
