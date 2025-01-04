import React, { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import { ProtectedRoute } from "../components/ProtectedRoute";
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
  CssBaseline,
  ListItemButton,
  Typography,
  Divider,
  Collapse,
  useMediaQuery,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Home as HomeIcon,
  Approval as ApprovalIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  Summarize as SummarizeIcon,
  Handshake as HandshakeIcon,
  RequestQuote as RequestQuoteIcon,
  EventAvailable as EventAvailableIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Link, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import polibatam from "../assets/logoPolibatam.png";
import DashboardStaf from "../components/AdminDashboard";
import DashboardUnit from "../components/UnitDashboard";
import DashboardUnitHead from "../components/HeadUnitDashboard";
import DashboardMahasiswa from "../components/MhsDashboard";
import Manage from "./items/Manage";
import Loan from "./Loan/Loan";
import Pengembalian from "./Loan/Pengembalian";
import LoanApproval from "./Loan/LoanApproval";
import LoanApprovalDetail from "./Loan/LoanApprovalDetail";
import LoanHistory from "./Loan/LoanHistory";
import Request from "./request/Request";
import RequestApproval from "./request/RequestApproval";
import RequestApprovDetail from "./request/RequestApprovDetail";
import RequestList from "./request/RequestList";
import Laporan from "./Laporan";
import DetailRequest from "./request/RequestDetails";
import RequestApprovalAdmin from "./request/RequestApprovaladmin";
import RequestApprovDetailadmin from "./request/RequestApprovDetailadmin";
import StockIn from "./stockin/StockIn";
import RequestHistoryAdmin from "./request/RequestHistoryAdmin";
import RequestHistoryAdminDetail from "./request/RequestHistoryAdminDetail";

const drawerWidth = 280;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      marginLeft: 0,
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  })
);

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
  backgroundColor: "#3691BE",
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
}));

export default function Dashboard() {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = parseInt(localStorage.getItem("role"), 10 || "guest");
  const [openDrawer, setOpenDrawer] = React.useState(true);
  const [openPeminjaman, setOpenPeminjaman] = useState(false);
  const [openPermintaan, setOpenPermintaan] = useState(false);
  const [openManajemenBarang, setOpenManajemenBarang] = useState(false);
  const [openPengembalian, setOpenPengembalian] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const roleMapping = {
    1: "staf",
    2: "kepalaunit",
    3: "unit",
    4: "mahasiswa",
  };
  const setRole = roleMapping[role];

  if (!role || !user) {
    return <Navigate to="/" />;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
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

  const handleClickPengembalian = () => {
    setOpenPengembalian(!openPengembalian);
  };

  const menuItemsByRole = {
    1: [
      { text: "Barang Masuk", icon: <SummarizeIcon />, link: "/stock-in" },
      { text: "Laporan", icon: <SummarizeIcon />, link: "/report" },
    ],
    2: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/RequestList",
      },
    ],
    3: [
      {
        text: "Permintaan",
        icon: <RequestQuoteIcon />,
        link: "/RequestList",
      },
    ],
  };

  const menuItems = menuItemsByRole[role] || [];

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#e0e0e0",
        width: "100%",
        height: "100vh",
        minHeight: "100vh", // memastikan minimal setinggi viewport
        position: "fixed", // membuat elemen fixed di viewport
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto", // untuk menghandle konten yang melebihi viewport
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" open={openDrawer}>
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
            aria-label="open drawer"
            sx={{ mr: 2, ...(openDrawer && { display: "none" }) }}
            onClick={handleOpenDrawer}
          >
            <MenuIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            color="inherit"
            aria-label="logout"
            onClick={handleMenu}
          >
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            keepMounted
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#242D34",
          },
        }}
        variant={isSmallScreen ? "temporary" : "persistent"}
        anchor="left"
        open={openDrawer}
      >
        <DrawerHeader>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              height: { xs: "60px", sm: "80px" }, // Ukuran dinamis untuk tinggi
              padding: { xs: "10px 0", sm: "20px 0" }, // Padding kecil untuk layar kecil
            }}
          >
            <img
              src={polibatam}
              alt="logo polibatam"
              style={{
                height: isSmallScreen ? "50px" : "70px", // Logo lebih kecil di layar kecil
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "white",
                fontSize: { xs: "10px", sm: "14px" }, // Font lebih kecil di perangkat kecil
              }}
            >
              <strong>SBUM</strong><br /> SUB-BAGIAN UMUM POLIBATAM
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDrawer}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon sx={{ color: "white" }} />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider
          sx={{
            backgroundColor: "rgb(255, 255, 255)",
            height: "1px",
            margin: "8px 0",
          }}
        />
        <Box sx={{ overflow: "auto", height: "100%", py: 1, px: 1 }}>
          <List>
            <ListItem disablePadding sx={{ color: "white" }}>
              <ListItemButton component={Link} to={`/dashboard/${setRole}`}>
                <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>

            {setRole === "staf" && (
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
                      sx={{ pl: { xs: 2, sm: 8 }, color: "white" }}
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
                      to="/request/approvaladmin"
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

            {setRole === "kepalaunit" && (
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
                   
                  </List>
                </Collapse>
              </>
            )}

            {(setRole === "kepalaunit" ||
              setRole === "mahasiswa" ||
              setRole === "unit") && (
              <>
                <ListItem disablePadding sx={{ color: "white" }}>
                  <ListItemButton onClick={handleClickPengembalian}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <ListItemIcon sx={{ color: "white", minWidth: "36px" }}>
                        <EventAvailableIcon />
                      </ListItemIcon>
                      <ListItemText primary="Peminjaman" />
                    </Box>
                    {openPengembalian ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                <Collapse in={openPengembalian} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/loan"
                    >
                      <ListItemText primary="Peminjaman" />
                    </ListItemButton>
                    <ListItemButton
                      sx={{ pl: 8, color: "white" }}
                      component={Link}
                      to="/return"
                    >
                      <ListItemText primary="Pengembalian" />
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

      <Main open={openDrawer}>
        <DrawerHeader />
        <Routes>
          {/* Staf Routes */}
          <Route
            path="/dashboard/staf"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardStaf />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/manage/*"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Manage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan/approval"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <LoanApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan/transaction/history"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <LoanHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/approvaladmin"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <RequestApprovalAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <Laporan />
              </ProtectedRoute>
            }
          />
          {/* Kepala Unit Routes */}
          <Route
            path="/dashboard/kepalaunit"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardUnitHead />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/approval"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <RequestApproval />
              </ProtectedRoute>
            }
          />
          {/* Unit Routes */}
          <Route
            path="/dashboard/unit"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <DashboardUnit />
              </ProtectedRoute>
            }
          />{" "}
          {/* Mahasiswa Routes */}
          <Route
            path="/dashboard/mahasiswa"
            element={
              <ProtectedRoute allowedRoles={[4]}>
                <DashboardMahasiswa />
              </ProtectedRoute>
            }
          />{" "}
          {/* Shared Routes (Multiple Roles) */}
          <Route
            path="/loan"
            element={
              <ProtectedRoute allowedRoles={[2, 3, 4]}>
                <Loan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/return"
            element={
              <ProtectedRoute allowedRoles={[2, 3, 4]}>
                <Pengembalian />
              </ProtectedRoute>
            }
          />
          <Route
            path="/RequestList"
            element={
              <ProtectedRoute allowedRoles={[2, 3]}>
                <RequestList />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/request"
            element={
              <ProtectedRoute allowedRoles={[2, 3]}>
                <Request />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/transaction/history"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <RequestHistoryAdmin />
              </ProtectedRoute>
            }
          />
          {/* Detail Routes */}
          <Route
            path="/DetailPermintaan/:date"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3]}>
                <DetailRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestsApprovHead/head-approval/details/:created_at"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <RequestApprovDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestsApprovalAdmin/details/:created_at"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <RequestApprovDetailadmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestsHistory/details/:created_at"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <RequestHistoryAdminDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/loan-approval/detail/:date"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <LoanApprovalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-in"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                {" "}
                <StockIn />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Main>
    </Box>
  );
}
