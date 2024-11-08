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
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  Approval as ApprovalIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  Summarize as SummarizeIcon,
  Handshake as HandhakeIcon,
  RequestQuote as RequestQuoteIcon,
  EventAvailable as EventAvailableIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { Link, Route, Routes } from "react-router-dom";
import polibatam from "../assets/logoPolibatam.png";
import DashboardStaf from "./DashboardStaf";
import DashboardUnit from "./DashboardUnit";
import DashboardUnitHead from "./DashboardUnitHead";
import DashboardMahasiswa from "./DashboardMahasiswa";
import LoanApproval from "./LoanApproval";
import Manage from "./Manage";
import Laporan from "./Laporan";

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
  // Hardcode role untuk pengujian
  const role = "staf"; // Bisa diganti dengan 'staf', 'kepalaUnit', 'unit', atau 'mahasiswa'/ receive role as prop
  const [openPeminjaman, setOpenPeminjaman] = useState(false);
  const [openPermintaan, setOpenPermintaan] = useState(false);

  const handleLogout = () => {
    console.log("Logout diklik");
  };

  const handleClickPeminjaman = () => {
    setOpenPeminjaman(!openPeminjaman);
  };

  const handleClickPermintaan = () => {
    setOpenPermintaan(!openPermintaan);
  };

  // Define the sidebar items for each role
  const menuItemsByRole = {
    staf: [
      {
        text: "Manajemen Barang",
        icon: <FeaturedPlayListIcon />,
        link: "/inventory",
      },
      { text: "Laporan", icon: <SummarizeIcon />, link: "/report" },
    ],
    kepalaUnit: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/request",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/request/transaction/history",
      },
    ],
    unit: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/loan/approval",
      },
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/request/",
      },
    ],
    mahasiswa: [
      {
        text: "Peminjaman",
        icon: <EventAvailableIcon />,
        link: "/loan/approval",
      },
    ],
  };

  // Get the menu items for the current role
  const menuItems = menuItemsByRole[role] || [];

  // Fungsi untuk memilih dashboard berdasarkan role
  const getDashboardComponent = () => {
    switch (role) {
      case "staf":
        return <DashboardStaf />;
      case "unit":
        return <DashboardUnit />;
      case "kepalaUnit":
        return <DashboardUnitHead />;
      case "mahasiswa":
        return <DashboardMahasiswa />;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
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
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* sidebar */}
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
              display: "flex", // menyusun elemen dalam satu baris
              alignItems: "center", // menyelaraskan logo dan teks secara vertikal
              textAlign: "left", // menjaga teks rata kiri
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
              <strong>SBUM</strong> <br />
              SUB-BAGIAN UMUM POLIBATAM
            </Typography>
          </Box>
          <Divider
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.3)", // warna putih dengan opacity 50%
              height: "1px",
              margin: "8px 0",
            }}
          />

          <List>
            {/* dashboard */}
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton component={Link} to={`/dashboard/${role}`}>
                <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" sx={{ margin: 0 }} />
              </ListItemButton>
            </ListItem>

            {/* Dropdown Peminjaman hanya muncul jika role adalah 'Staf' */}
            {role === "staf" && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton
                    onClick={handleClickPeminjaman}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%", // pastikan lebar 100% agar konten tidak terpotong
                      whiteSpace: "nowrap", // cegah teks terputus ke baris baru
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <ApprovalIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Peminjaman" />
                    </Box>
                    {/* Ikon dropdown di samping */}
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
              </>
            )}

            {/* Dropdown Permintaan hanya muncul jika role adalah 'Kepala Unit' atau 'Staf' */}
            {(role === "kepalaUnit" || role === "staf") && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton
                    onClick={handleClickPermintaan}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%", // pastikan lebar 100% agar konten tidak terpotong
                      whiteSpace: "nowrap", // cegah teks terputus ke baris baru
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 0,
                      }}
                    >
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <HandhakeIcon />
                      </ListItemIcon>
                      <ListItemText primary="Persetujuan Permintaan" />
                    </Box>
                    {/* Ikon dropdown di samping */}
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
                      to="/request/transaction/history"
                    >
                      <ListItemText primary="Riwayat Transaksi" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </>
            )}

            {/* Render menu items based on the role */}
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ color: "white" }}>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ whiteSpace: "nowrap" }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* konten */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
          <Routes>
            <Route path="/dashboard/staf" element={<DashboardStaf />} />
            <Route path="/dashboard/unit" element={<DashboardUnit />} />
            <Route path="/dashboard/kepalaUnit" element={<DashboardUnitHead />} />
            <Route path="/dashboard/mahasiswa" element={<DashboardMahasiswa />} />
            <Route path="/loan/approval" element={<LoanApproval />} />
            <Route path="/inventory" element={<Manage />} />
            <Route path="/report" element={<Laporan />} />
          </Routes>
      </Box>
    </Box>
  );
}
