import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbar, Alert } from "@mui/material";

const AuthHandler = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const checkTokenValidity = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      await axios.get("http://localhost:5000/validate-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      if (error.response?.status === 403) {
        setOpen(true);
        sessionStorage.clear();
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    }
  };

  useEffect(() => {
    checkTokenValidity();
    const interval = setInterval(checkTokenValidity, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="warning" sx={{ width: "100%" }}>
        Sesi telah berakhir. Silakan login kembali.
      </Alert>
    </Snackbar>
  );
};

export default AuthHandler;
