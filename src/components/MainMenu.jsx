// frontend/src/components/MainMenu.js
import React from "react";
import { Link as RouterLink } from "react-router-dom";

// Import MUI Components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

function MainMenu() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State for mobile menu
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Navigation Links
  const navLinks = [
    { title: "Manage Wallet Groups", path: "/wallet-groups" },
    { title: "View Wallet Groups", path: "/wallet-group/view" },
    { title: "Manage Tokens", path: "/tokens" },
    { title: "Distribute AMB", path: "/distribute" },
    { title: "Collect Funds", path: "/collect" },
    { title: "Burn Tokens", path: "/burn" },
    { title: "Start Buy Process", path: "/buy" },
    { title: "Start Sell Process", path: "/sell" },
    { title: "Get Usage Data", path: "/usage-report" },
    { title: "Help", path: "/help" },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo or App Name */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          component={RouterLink}
          to="/">
          Manual Booster
        </Typography>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box>
            {navLinks.map((link) => (
              <Button
                key={link.title}
                color="inherit"
                component={RouterLink}
                to={link.path}
                sx={{ textTransform: "none", marginLeft: 2 }}>
                {link.title}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Menu */}
        {isMobile && (
          <div>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}>
              {navLinks.map((link) => (
                <MenuItem
                  key={link.title}
                  component={RouterLink}
                  to={link.path}
                  onClick={handleClose}>
                  {link.title}
                </MenuItem>
              ))}
            </Menu>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default MainMenu;
