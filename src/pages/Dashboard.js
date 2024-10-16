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
  List as ListIcon,
  Report as ReportIcon,
  ExpandLess, 
  ExpandMore,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import polibatam from '../assets/logoPolibatam.png';

const drawerWidth = 240;

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

export default function Dashboard(props) {
  const [openPeminjaman, setOpenPeminjaman] = useState(false);
  const [openPermintaan, setOpenPermintaan] = useState(false);
 
  const handleLogout = () => {
    // Implementasi fungsi logout
    console.log("Logout diklik");
  };

  const handleClickPeminjaman = () => {
    setOpenPeminjaman(!openPeminjaman); //toggle dropdwon
  };

  const handleClickPermintaan =() => {
    setOpenPermintaan(!openPermintaan);
  };

  const menuItems = [
    { text: "Manajemen Barang", icon: <ListIcon />, link: "/inventory" },
    { text: "Laporan", icon: <ReportIcon />, link: "/report" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={true} sx={{ bgcolor: "#3691BE" }}>
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          minHeight: "80px !important"
        }}>
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2} }>
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <IconButton size="large" color="inherit" aria-label="logout" onClick={handleLogout} >
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
        }}>
        <Box sx={{ overflow: "auto", height: "100%" }}>
          <Box 
            sx={{ 
              display: "flex",        // menyusun elemen dalam satu baris
              alignItems: "center",   // menyelaraskan logo dan teks secara vertikal
              textAlign: "left",      // menjaga teks rata kiri
              height: "80px",
              padding: "20px 0"  
            }}>
            <img src={polibatam} alt="logo polibatam" style={{ height: "70px" }} />
            <Typography variant="body1" sx={{ color: "white" }}>
              SUB-BAGIAN UMUM POLIBATAM
            </Typography>
          </Box>
          <Divider sx={{ backgroundColor: "white", margin: "3px 0" }} /> {/*menambahkan garis*/}
        
          <List>
            {/* dashboard */}
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton component={Link} to="/dashboard">
                <ListItemIcon sx={{ color: "white" }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {/* dropdown peminjaman */}
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton onClick={handleClickPeminjaman}>
                <ListItemIcon sx={{ color: "white" }}>
                  <ApprovalIcon />
                </ListItemIcon>
                <ListItemText primary="Peminjaman" />
                  {openPeminjaman ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openPeminjaman} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4, color: "white" }} component={Link} to="/loan/approval">
                  <ListItemText primary="Persetujuan" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4, color: "white" }} component={Link} to="/loan/transaction/history">
                  <ListItemText primary="Riwayat Transaksi" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* dropdown permintaan */}
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton onClick={handleClickPermintaan}>
                <ListItemIcon sx={{ color: "white" }}>
                  <ApprovalIcon />
                </ListItemIcon>
                <ListItemText primary="Permintaan" />
                  {openPermintaan ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openPermintaan} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton sx={{ pl: 4, color: "white" }} component={Link} to="/request/approval">
                  <ListItemText primary="Persetujuan" />
                </ListItemButton>
                <ListItemButton sx={{ pl: 4, color: "white" }} component={Link} to="/request/transaction/history">
                  <ListItemText primary="Riwayat Transaksi" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* menu lainnya */}
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding sx={{ color: "white" }}>
                <ListItemButton component={Link} to={item.link}>
                  <ListItemIcon sx={{ color: "white"}}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* konten */}
        <div>
          <Typography>
            Hello
          </Typography>
        </div>
      </Box>
    </Box>
  );
}
