import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { use } from "react";

function DashboardStaf() {
  const [dashboardData, setDashboardData] = useState({
    items: [],
    overdueItems: [],
    topRequests: [],
    topBorrowings: [],
    zeroStockItems: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menambahkan fungsi untuk memantau status peminjaman
  const checkBorrowingStatus = async (borrowingIds) => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };

      const statusChecks = borrowingIds.map((id) =>
        fetch(`http://localhost:5000/borrowing/status/${id}`, { headers }).then(
          (res) => res.json()
        )
      );

      const statuses = await Promise.all(statusChecks);

      // Filter out items that have been returned
      setDashboardData((prevData) => ({
        ...prevData,
        overdueItems: prevData.overdueItems.filter(
          (item, index) => !statuses[index].isReturned
        ),
      }));
    } catch (error) {
      console.error("Error checking borrowing status:", error);
    }
  };

  // New function to check stock status
  const checkStockStatus = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };

      const response = await fetch("http://localhost:5000/items/zero-stock", {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch zero stock items");

      const zeroStockItems = await response.json();

      setDashboardData((prevData) => ({
        ...prevData,
        zeroStockItems: Array.isArray(zeroStockItems) ? zeroStockItems : [],
      }));
    } catch (error) {
      console.error("Error checking stock status:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  // Menambahkan effect untuk memantau status peminjaman
  useEffect(() => {
    if (dashboardData.overdueItems.length > 0) {
      const borrowingIds = dashboardData.overdueItems.map(
        (item) => item.borrowing_id
      );
      // Check status every minute
      const statusInterval = setInterval(() => {
        checkBorrowingStatus(borrowingIds);
      }, 60000);

      // Initial check
      checkBorrowingStatus(borrowingIds);

      return () => clearInterval(statusInterval);
    }
  }, [dashboardData.overdueItems]);

  useEffect(() => {
    checkStockStatus();
    const stockInterval = setInterval(() => {
      checkStockStatus();
    }, 60000);
    return () => clearInterval(stockInterval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const [itemsRes, overdueRes, requestsRes, borrowingRes, zeroStockRes] =
        await Promise.all([
          fetch("http://localhost:5000/dashboard/counts", { headers }),
          fetch("http://localhost:5000/borrowing/overdue", { headers }),
          fetch("http://localhost:5000/requests/top", { headers }),
          fetch("http://localhost:5000/borrowing/top", { headers }),
          fetch("http://localhost:5000/items/zero-stock", { headers }),
        ]);

      // Check if any response failed
      if (
        !itemsRes.ok ||
        !overdueRes.ok ||
        !requestsRes.ok ||
        !borrowingRes.ok ||
        !zeroStockRes.ok
      ) {
        throw new Error("One or more requests failed");
      }

      const [counts, overdue, requests, borrowings] = await Promise.all([
        itemsRes.json(),
        overdueRes.json(),
        requestsRes.json(),
        borrowingRes.json(),
        zeroStockRes.json(),
      ]);

      setDashboardData({
        items: [
          { id: 1, count: counts?.requests || 0, title: "Permintaan Barang" },
          { id: 2, count: counts?.borrowings || 0, title: "Peminjaman Barang" },
          { id: 3, count: counts?.items || 0, title: "Daftar Barang" },
        ],
        overdueItems: Array.isArray(overdue) ? overdue : [], // Ensure it's an array
        topRequests: Array.isArray(requests) ? requests : [],
        topBorrowings: Array.isArray(borrowings) ? borrowings : [],
        zeroStockItems: Array.isArray(zeroStockRes) ? zeroStockRes : [],
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to fetch dashboard data");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Zero Stock Notifications */}
      {(dashboardData.zeroStockItems || []).map((item) => (
        <Alert
          severity="warning"
          key={item.item_id}
          icon={<ErrorIcon />}
          style={{ marginBottom: 10 }}
        >
          Barang {item.item_name} ({item.item_id}) telah habis. Harap segera restock barang tersebut.
        </Alert>
      ))}

      {/* Notifications for overdue items */}
      {(dashboardData.overdueItems || []).map((item) => (
        <Alert
          severity="error"
          key={item.borrowing_id}
          icon={<ErrorIcon />}
          style={{ marginBottom: 10 }}
        >
          Peminjaman {item.item_name} oleh {item.borrower} dengan NIK/NIM/NIDN{" "}
          {item.nik} telah melewati batas waktu pengembalian (
          {new Date(item.return_date).toLocaleDateString()})
        </Alert>
      ))}
      {/* Summary Cards */}
      <Grid container spacing={2} justifyContent={"center"}>
        {dashboardData.items?.map((item) => (
          <Grid item key={item.borrowing_id} xs={12} sm={6} md={4}>
            <Card style={{ backgroundColor: "#69D2FF" }}>
              <CardContent
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box textAlign="center" flexGrow={1}>
                  <Typography variant="h5" style={{ fontWeight: "bold" }}>
                    {item.count}
                  </Typography>
                  <Typography>{item.title}</Typography>
                </Box>
                <DescriptionIcon style={{ fontSize: 70, marginRight: 16 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tables */}
      <Grid container spacing={4} style={{ marginTop: 20 }}>
        {/* Top Requests Table */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                style={{ fontWeight: "bold", marginBottom: 10 }}
              >
                Permintaan Barang Paling Banyak
              </Typography>
              <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Nama Barang
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Total Permintaan
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Terakhir Permintaan
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.topRequests?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {row.nama}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {row.total}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {row.terakhir}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Top Borrowings Table */}
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                style={{ fontWeight: "bold", marginBottom: 10 }}
              >
                Peminjaman Barang Paling Banyak
              </Typography>
              <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Nama Barang
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Total Peminjaman
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontWeight: "bold", color: "#808080" }}
                      >
                        Terakhir Peminjaman
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardData.topBorrowings?.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontWeight: "bold" }}>
                          {row.nama}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {row.total}
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{ fontWeight: "bold" }}
                        >
                          {row.terakhir}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error Snackbar */}
      <Snackbar
        open={error !== null}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default DashboardStaf;
