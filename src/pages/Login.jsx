import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";
import polibatam from "../assets/polibatam.png";
import backgroundImage from "../assets/tekno.png";
import sweetAlert from "../components/Alert";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userRole) {
      setError("Pilih jenis user terlebih dahulu!");
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password,
        roles_id: userRole,
      });

      console.log(response.data.token);

      // Store user data as an object
      const userData = {
        id: response.data.user_id,
        fullName: response.data.full_name,
        nik: response.data.nik,
        divisionName: response.data.division_name,
      };

      // Simpan token ke localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.roles_id);
      localStorage.setItem("user_id", response.data.user_id);
      localStorage.setItem("full_name", response.data.full_name);
      localStorage.setItem("nik", response.data.nik);
      localStorage.setItem("division_name", response.data.division_name);
      localStorage.setItem("user", JSON.stringify(userData)); // Store user data as JSON string

      // Tampilkan Toast sukses
      sweetAlert.successToast(
        `Selamat datang, ${response.data.full_name || "Pengguna"}!`
      );

      // Arahkan ke dashboard sesuai role
      const roleId = response.data.roles_id;
      const ROLE = {
        ADMIN: 1,
        UNIT_HEAD: 2,
        UNIT: 3,
        STUDENT: 4,
      };

      console.log(response.data);
      if (roleId === ROLE.ADMIN) {
        navigate("/dashboard/staf"); // Admin
      } else if (roleId === ROLE.UNIT_HEAD) {
        navigate("/dashboard/kepalaunit"); //  Kepala Unit
      } else if (roleId === ROLE.UNIT) {
        navigate("/dashboard/unit"); // Unit
      } else if (roleId === ROLE.STUDENT) {
        navigate("/dashboard/mahasiswa"); // Mahasiswa
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
      // Tampilkan Toast error
      sweetAlert.error(
        "Login gagal",
        err.response?.data?.message || "Coba lagi."
      );
    }
  };

  return (
    <Container
      component="main"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 3,
          maxWidth: "400px",
          width: "100%",
          bgcolor: "white",
          zIndex: 1,
          position: "absolute",
          borderRadius: "10px",
        }}
      >
        <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
          <img
            src={polibatam}
            alt="polibatam"
            style={{ width: "320px", height: "103px" }}
          />
        </Box>
        <Typography
          display="flex"
          justifyContent="center"
          component="h1"
          variant="h5"
          color="grey"
          sx={{ fontWeight: "bold", fontFamily: "Sansita" }}
        >
          Sub Bagian Umum Polibatam
        </Typography>
        <Box component="form" sx={{ mt: 1 }} onSubmit={handleLogin}>
          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2, mt: 2 }}>
              {error}
            </Alert>
          )}
          {/*dropdown jenis user */}
          <Box display="flex" justifyContent="center">
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="jenis-user-label">Jenis User</InputLabel>
              <Select
                labelId="jenis-user-label"
                id="jenis-user"
                value={userRole}
                onChange={handleRoleChange}
                label="Jenis User"
                fullWidth
                sx={{
                  borderRadius: "10px", //menambhakan border
                  "& .MuiSelect-select": {
                    padding: "16px", // atur padding dalam
                    fontSize: "0.875rem", // atur warna teks dropdown
                    fontFamily: "Sansita", // atur style tulisan
                  },
                }}
              >
                <MenuItem value={1}>staf</MenuItem>
                <MenuItem value={2}>kepala unit</MenuItem>
                <MenuItem value={3}>unit</MenuItem>
                <MenuItem value={4}>mahasiswa</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/*field username & passwowrd */}
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: "10px", // menambahka1n border raadius
                fontFamily: "Sansita",
              },
            }}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: "10px", // menambahkan border raadius
              },
            }}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              fontFamily: "Sansita",
              backgroundColor: "#3691BE",
              "&:hover": { backgroundColor: "#2c7ba8" },
            }}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
export default Login;