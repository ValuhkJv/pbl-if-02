import React, { useState } from "react";
import {
  Box,
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  CssBaseline,
  ListItemButton,
  Typography,
  Divider,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  LoginOutlined as LoginOutlinedIcon,
  Home as HomeIcon,
  Approval as ApprovalIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  Summarize as SummarizeIcon,
  Handshake as HandshakeIcon,
  RequestQuote as RequestQuoteIcon,
  EventAvailable as EventAvailableIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import polibatam from "../assets/logoPolibatam.png";
import DashboardStaf from "../component/DashboardStaf";
import DashboardUnit from "../component/DashboardUnit";
import DashboardUnitHead from "../component/DashboardUnitHead";
import DashboardMahasiswa from "../component/DashboardMahasiswa";
import Loan from "./Loan";
import LoanApproval from "./LoanApproval";
import LoanHistory from "./LoanHistory";
import Request from "./Request";
import RequestApproval from "./RequestApproval";
import RequestHistory from "./RequestHistory";
import Laporan from "./Laporan";
import Barangkonsumsi from "./Barangkonsumsi";
import Barangpeminjaman from "./Barangpeminjaman";
import Barangrt from "./Barangrt";

const drawerWidth = 280;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user ? user.role : null;
  const [openPeminjaman, setOpenPeminjaman] = useState(false);
  const [openPermintaan, setOpenPermintaan] = useState(false);
  const [openManajemenBarang, setOpenManajemenBarang] = useState(false);
  const navigate = useNavigate();

  // Jika tidak ada user, redirect ke halaman login
  if (!role) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    // Hapus data user dari localStorage
    localStorage.removeItem("user");
    // Redirect ke halaman login
    navigate("/");
  };

  const handleClickPeminjaman = () => {
    setOpenPeminjaman(!openPeminjaman);
  };

  const handleClickPermintaan = () => {
    setOpenPermintaan(!openPermintaan);
  };

  const handleClickManajemenBarang = () => {
    setOpenManajemenBarang(!openManajemenBarang);
  };

  const menuItemsByRole = {
    staf: [{ text: "Laporan", icon: <SummarizeIcon />, link: "/report" }],
    kepalaUnit: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/request",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
    unit: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/request",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
    mahasiswa: [
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan",
      },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

  return (
    <Box sx={{ display: "flex", bgcolor: "#e0e0e0"}}>
      <CssBaseline />
      <AppBar position="fixed" open={true} sx={{ bgcolor: "#3691BE" }}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: "80px !important",
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <IconButton
            size="large"
            color="inherit"
            aria-label="logout"
            onClick={handleLogout}
          >
            <LoginOutlinedIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#242D34",
          },
        }}
      >
        <Box sx={{ overflow: "auto", height: "100%", py: 1, px: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: "80px",
              padding: "20px 0",
            }}
          >
            <img
              src={polibatam}
              alt="logo polibatam"
              style={{ height: "70px" }}
            />
            <Typography variant="body1" sx={{ color: "white" }}>
              <strong>SBUM</strong> <br /> SUB-BAGIAN UMUM POLIBATAM
            </Typography>
          </Box>
          <Divider
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              height: "1px",
              margin: "8px 0",
            }}
          />

          <List>
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton component={Link} to={`/dashboard/${role}`}>
                <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {role === "staf" && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton
                    onClick={handleClickPeminjaman}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <ApprovalIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Peminjaman" />
                    </Box>
                    {openPeminjaman ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPeminjaman} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/loan/approval"
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/loan/transaction/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton
                    onClick={handleClickPermintaan}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <HandshakeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Permintaan" />
                    </Box>
                    {openPermintaan ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPermintaan} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/approval"
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>

                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickManajemenBarang}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <FeaturedPlayListIcon />
                      </ListItemIcon>
                      <ListItemText primary="Manajemen Barang" />
                    </Box>
                    {openManajemenBarang ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openManajemenBarang} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangkonsumsi"
                    >
                      <ListItemText primary="Persediaan Barang Konsumsi" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangrt"
                    >
                      <ListItemText primary="Barang Rumah Tangga" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/manage/barangpeminjaman"
                    >
                      <ListItemText primary="Peminjaman" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {role === "kepalaUnit" && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton
                    onClick={handleClickPermintaan}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <HandshakeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Permintaan" />
                    </Box>
                    {openPermintaan ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPermintaan} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/approval"
                    >
                      <ListItemText primary="Persetujuan" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/request/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ color: "white" }}>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="/dashboard/staf" element={<DashboardStaf />} />
          <Route path="/dashboard/unit" element={<DashboardUnit />} />
          <Route path="/dashboard/kepalaUnit" element={<DashboardUnitHead />} />
          <Route path="/dashboard/mahasiswa" element={<DashboardMahasiswa />} />
          <Route path="/report" element={<Laporan />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/loan/approval" element={<LoanApproval />} />
          <Route path="/loan/transaction/history" element={<LoanHistory />} />
          <Route path="/request" element={<Request />} />
          <Route path="/request/approval" element={<RequestApproval />} />
          <Route path="/request/history" element={<RequestHistory />} />
          <Route path="/manage/barangkonsumsi" element={<Barangkonsumsi />} />
          <Route path="/manage/barangrt" element={<Barangrt />} />
          <Route path="/manage/barangpeminjaman" element={<Barangpeminjaman />} />
          {/* Route spesifik untuk setiap role */}
          {role === "staf" && (
            <Route path="/dashboard/staf" element={<DashboardStaf />} />
          )}
          {role === "unit" && (
            <Route path="/dashboard/unit" element={<DashboardUnit />} />
          )}
          {role === "kepalaUnit" && (
            <Route
              path="/dashboard/kepalaUnit"
              element={<DashboardUnitHead />}
            />
          )}
          {role === "mahasiswa" && (
            <Route
              path="/dashboard/mahasiswa"
              element={<DashboardMahasiswa />}
            />
          )}
        </Routes>
      </Box>
    </Box>
  );
}
