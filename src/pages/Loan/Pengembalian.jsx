import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Grid,
  Snackbar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip,
  Box,
  Modal,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import PengembalianModal from "./PengembalianModal";
import { styled } from "@mui/system";
import Alert from "../../components/alert"; // Import alert service


const Pengembalian = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [transactions, setTransactions] = useState([]);
  const [openPengembalianModal, setOpenPengembalianModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "center",
    wordWrap: "break-word",
  });

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  }));

  // Modal style
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // Tombol Detail (Biru)
  const DetailButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#1976d2", // Biru
    color: "white",
    "&:hover": {
      backgroundColor: "#0d47a1", // Biru lebih gelap saat hover
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    textTransform: "none",
    fontWeight: 100,
    padding: "4px 8px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
    fontSize: "12px",
  }));

  const handleOpenPengembalianModal = (transaction) => {

    // Check if we have borrowing_ids array and use the first ID
    const borrowing_id =
      transaction.borrowing_ids?.[0] || transaction.borrowing_id;

    if (!borrowing_id) {
      Alert.error("Error", "Data peminjaman tidak valid");
      return;
    }

    // Create a modified transaction object with the correct borrowing_id
    const modifiedTransaction = {
      ...transaction,
      borrowing_id: borrowing_id, // Add the borrowing_id property
    };

    setSelectedLoan(modifiedTransaction);
    setOpenPengembalianModal(true);
  };

  const handleClosePengembalianModal = () => {
    setOpenPengembalianModal(false);
  };

  const handleUpdateTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/peminjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data peminjaman");
      const data = await response.json();
      setTransactions(data);
      localStorage.setItem("transactions", JSON.stringify(data));
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const handleDelete = async (borrowing_id) => {
    if (!borrowing_id) {
      Alert.error("Error", "ID peminjaman tidak valid");
      return;
    }

    const deleteAction = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("roles_id");

        const response = await fetch(`http://localhost:5000/peminjaman/${borrowing_id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Gagal menghapus peminjaman");
        }

        const data = await response.json();
        // For staff (roles_id === 1): remove from state
        // For regular users: mark as deleted but keep in state
        setTransactions(prevTransactions => {
          const newTransactions = userRole === "1"
            ? prevTransactions.filter(t => t.borrowing_id !== borrowing_id)
            : prevTransactions.map(t => {
              if (t.borrowing_id === borrowing_id) {
                return { ...t, is_deleted: true };
              }
              return t;
            });

          // Update localStorage with the new state
          localStorage.setItem("transactions", JSON.stringify(newTransactions));

          return newTransactions;
        });

        Alert.success("Berhasil!", data.message);
      } catch (error) {
        console.error(error);
        Alert.error("Error", error.message);
      }
    };

    Alert.confirmDelete(deleteAction);
  };

  const handleCancelBorrowing = async (borrowing_id) => {
    const cancelAction = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `http://localhost:5000/peminjaman/cancel/${borrowing_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Gagal membatalkan peminjaman");
        }

        const data = await response.json();
        await refreshTransactions();
        Alert.success("Berhasil!", data.message);
      } catch (error) {
        console.error(error);
        Alert.error("Error", error.message);
      }
    };

    Alert.confirmCancel(cancelAction);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("roles_id"); // Simpan role saat login
        const userId = localStorage.getItem("user_id");

        if (!token) {
          throw new Error("Token tidak tersedia");
        }

        const response = await fetch("http://localhost:5000/peminjaman", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error Response Text:", errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const data = await response.json();

        // Filter data based on role and deletion status
        const filteredData = data.filter(transaction => {
          const isStaff = userRole === "1";
          const isOwner = transaction.borrower_id === parseInt(userId);

          // Staff can see all non-deleted items
          // Regular users see their own items, including soft-deleted ones
          return isStaff
            ? !transaction.is_deleted
            : isOwner;
        });

        setTransactions(filteredData);
        localStorage.setItem("transactions", JSON.stringify(filteredData));

      } catch (error) {
        console.error("Fetch Transactions Error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        setSnackbar({
          open: true,
          message: `Gagal memuat data peminjaman: ${error.message}`,
          severity: "error",
        });
      }
    };

    fetchTransactions();
  }, []); // Jalankan sekali saat komponen dimuat

  const refreshTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/peminjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data peminjaman");

      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      setSnackbar({
        open: true,
        message: "Gagal memperbarui data",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const shouldRefresh = localStorage.getItem("shouldRefreshPengembalian");
    if (shouldRefresh === "true") {
      refreshTransactions();
      localStorage.removeItem("shouldRefreshPengembalian");
    }
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  useEffect(() => {
    console.log("Transactions:", transactions);
  }, [transactions]);

  // Menggabungkan filter status dan pencarian dalam satu fungsi
  const getFilteredRows = () => {
    return transactions.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "Semua" ||
        (filterStatus === "return" &&
          (item.status === "return" ||
            item.status.startsWith("return: terlambat"))) ||
        (filterStatus !== "return" && item.status === filterStatus);

      return matchesSearch && matchesStatus;
    });
  };

  // Gunakan fungsi filter gabungan untuk mendapatkan data yang akan ditampilkan
  const filteredRows = getFilteredRows();
  const displayedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handler untuk membuka modal detail
  const handleOpenDetail = (loan) => {
    console.log("Opening detail for loan:", loan); // Tambahkan log ini
    setSelectedLoan(loan);
    setOpenDetailModal(true);
  };

  // Handler untuk menutup modal detail
  const handleCloseDetail = () => {
    setOpenDetailModal(false);
    setSelectedLoan(null);
  };

  // Komponen Modal Detail
  const DetailModal = ({ open, onClose, loan }) => {
    if (!loan) return null;

    return (
      <Modal open={open} onClose={onClose} aria-labelledby="detail-modal-title">
        <Box sx={modalStyle}>
          <Typography
            id="detail-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Detail Pengembalian
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tanggal Transaksi:
            </Typography>
            <Typography>
              Tanggal Pengambilan:{" "}
              {loan.borrow_date
                ? new Date(loan.borrow_date).toLocaleString()
                : "-"}
            </Typography>
            <Typography>
              Tanggal Pengembalian:
              {loan.return_date
                ? new Date(loan.return_date).toLocaleString()
                : "-"}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kondisi Barang:
            </Typography>
            <Typography>
              Saat Dipinjam: {loan.initial_condition || "-"}
            </Typography>
            <Typography>
              Saat Dikembalikan: {loan.return_condition || "-"}
            </Typography>
          </Box>

          {loan.return_proof && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bukti Pengembalian:
              </Typography>
              <img
                src={`http://localhost:5000/uploads/${loan.return_proof}`}
                alt="Bukti Pengembalian"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          )}

          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              mt: 2,
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Tutup
          </Button>
        </Box>
      </Modal>
    );
  };

  return (
    <Grid
      sx={{
        width: "100%",
        margin: "0 auto", // Pusatkan di layar
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: 2,
        px: 2,
        py: 4,
        bgcolor: "background.paper",
      }}
    >
      {/* Header Dashboard */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom={2}
      >
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
        <Typography
          style={{
            margin: "0 10px",
            fontFamily: "Sansita",
            fontSize: "26px",
          }}
        >
          PENGEMBALIAN PEMINJAMAN BARANG
        </Typography>
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="flex-end"
        sx={{ mb: 4, mt: 5 }}
      >
        <FormControl variant="outlined" sx={{
          width: "250px",
          backgroundColor: "white",
          borderRadius: 1,
          "& .MuiOutlinedInput-root": {
            height: "40px",
          },
        }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            label="Status"
          >
            <MenuItem value="Semua">Semua</MenuItem>
            <MenuItem value="approved">Disetujui</MenuItem>
            <MenuItem value="pending">Menunggu persetujuan</MenuItem>
            <MenuItem value="rejected">Ditolak</MenuItem>
            <MenuItem value="return">Dikembalikan</MenuItem>
          </Select>
        </FormControl>

        {/* Search di kanan */}
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "250px",
            backgroundColor: "white",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}
        />
      </Stack>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          padding: "0",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#0C628B",
            padding: "8px",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="h6" gutterBottom color="white">
            Transaksi Pengembalian
          </Typography>
        </div>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px", // Border-radius untuk tabel
            overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <StyledTableCell>No</StyledTableCell>
                <StyledTableCell>No Inventaris</StyledTableCell>
                <StyledTableCell>Nama Barang</StyledTableCell>
                <StyledTableCell>Jumlah</StyledTableCell>
                <StyledTableCell>Keperluan</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
                <StyledTableCell>Nomor Telepon</StyledTableCell>
                <StyledTableCell>Alasan Penolakan</StyledTableCell>
                <StyledTableCell>Pengembalian</StyledTableCell>
                <StyledTableCell>Detail</StyledTableCell>
                <StyledTableCell>Aksi</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRows.map((transaction, index) => (
                <StyledTableRow key={transaction.borrowing_id}>
                  <StyledTableCell>
                    {index + 1 + page * rowsPerPage}
                  </StyledTableCell>
                  <StyledTableCell>{transaction.item_code}</StyledTableCell>
                  <StyledTableCell>{transaction.item_name}</StyledTableCell>
                  <StyledTableCell>{transaction.quantity}</StyledTableCell>
                  <StyledTableCell>{transaction.reason}</StyledTableCell>
                  <StyledTableCell>
                    {transaction.status.startsWith("return: terlambat") ? (
                      <Typography color="error">
                        {transaction.status}
                      </Typography>
                    ) : (
                      transaction.status
                    )}
                  </StyledTableCell>
                  <StyledTableCell>{transaction.phone_number}</StyledTableCell>
                  <StyledTableCell>
                    {transaction.rejection_reason || "-"}
                  </StyledTableCell>

                  <StyledTableCell>
                    {transaction.status === "approved" &&
                      !transaction.return_proof && (
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <Button
                            variant="contained"
                            sx={{
                              padding: "6px",
                              color: "white",
                              backgroundColor: "#3691BE",
                              borderColor: "#0C628B",
                              borderRadius: "8px",
                              textTransform: "none",
                              boxShadow: "-moz-initial",
                              "&:hover": {
                                borderColor: "#3333",
                                color: "#fff",
                              },
                            }}
                            onClick={() => {
                              console.log(
                                "Full transaction object:",
                                JSON.stringify(transaction, null, 2)
                              );
                              console.log(
                                "borrowing_id:",
                                transaction?.borrowing_id
                              );
                              handleOpenPengembalianModal(transaction);
                            }}
                          >
                            Upload Pengembalian
                          </Button>
                        </Stack>
                      )}
                  </StyledTableCell>
                  <StyledTableCell>
                    {" "}
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                      <Tooltip title="Detail">
                        <DetailButton
                          variant="contained"
                          sx={{
                            padding: "0",
                            borderRadius: "50%",
                            height: "35px",
                            width: "35px",
                            minWidth: "35px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            handleOpenDetail(transaction);
                          }}
                        >
                          <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
                        </DetailButton>
                      </Tooltip>
                    </Stack>
                  </StyledTableCell>
                  <StyledTableCell>
                    {["rejected", "return"].includes(transaction.status) && (
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDelete(transaction.borrowing_id)
                        }
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                    {transaction.status === "pending" && (
                      <Button
                        variant="contained"
                        sx={{
                          padding: "6px",
                          color: "white",
                          borderRadius: "8px",
                          textTransform: "none",
                          boxShadow: "-moz-initial",
                          "&:hover": {
                            borderColor: "darkred",
                            color: "#fff",
                          },
                        }}
                        color="error"
                        onClick={() =>
                          handleCancelBorrowing(transaction.borrowing_id)
                        }
                      >
                        Batalkan
                      </Button>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
            {/* Pengembalian Modal */}
            <PengembalianModal
              open={openPengembalianModal}
              onClose={handleClosePengembalianModal}
              loanData={selectedLoan}
              onUpdate={handleUpdateTransactions}
            />
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Paper>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <DetailModal
        open={openDetailModal}
        onClose={handleCloseDetail}
        loan={selectedLoan}
      />
    </Grid>
  );
};

export default Pengembalian;
