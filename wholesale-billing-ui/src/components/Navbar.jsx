import {
  AppBar,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";

export default function Navbar() {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: "#fff",
        color: "#000",
        boxShadow: 1,
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          Wholesale Billing System
        </Typography>

        <Button
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}