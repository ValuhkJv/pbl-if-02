import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  InputAdornment,
  TextField,
  Box,
  Stack,
  Typography,
  Tooltip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Snackbar,
  Alert,
  Modal,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Search as SearchIcon,
  DeleteForeverOutlined as DeleteForeverOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ExportLoanWord from "./ExportLoanWord";

export default function LoanHistory() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("Semua");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
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

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: "1px solid #ddd",
    padding: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
      transition: "background-color 0.3s ease",
    },
  }));

  // Tombol Hapus (Oranye)
  const RemoveButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#ed6c02", // Oranye
    justifyContent: "center",
    color: "white",
    "&:hover": {
      backgroundColor: "#e65100", // Oranye lebih gelap saat hover
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    textTransform: "none",
    fontWeight: 100,
    padding: "2px 4px",
    transition: "all 0.3s ease",
    fontSize: "8px",
  }));

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

  const months = [
    "Semua",
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Filter rows berdasarkan tanggal, bulan dan tahun
  const filteredRows = history.filter((item) => {
    const tanggalPinjam = new Date(item.borrow_date);

    // Filter berdasarkan status
    const statusMatch =
      filterStatus === "Semua" ||
      (filterStatus === "return" &&
        (item.status === "return" ||
          item.status.startsWith("return: terlambat"))) ||
      (filterStatus !== "return" && item.status === filterStatus);

    // Filter pencarian di multiple fields
    const searchMatch =
      !searchTerm ||
      (item.full_name &&
        item.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nik && item.nik.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone_number &&
        item.phone_number.toLowerCase().includes(searchTerm.toLowerCase()));
    // Filter berdasarkan rentang tanggal
    const dateMatch =
      (!startDate || tanggalPinjam >= startDate.setHours(0, 0, 0, 0)) &&
      (!endDate ||
        tanggalPinjam <= new Date(endDate).setHours(23, 59, 59, 999));

    // Filter berdasarkan bulan dan tahun
    const monthMatch =
      selectedMonth === "Semua" ||
      tanggalPinjam.getMonth() + 1 === months.indexOf(selectedMonth);

    return statusMatch && searchMatch && dateMatch && monthMatch;
  });

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);

      if (!token) {
        console.error("No token found in localStorage");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/peminjaman?view=history",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response status:", response.status);
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Transactions:", data); // Detailed data log

      if (data.length === 0) {
        console.warn("No transactions found");
      }

      // Modifikasi: Pastikan setiap item memiliki borrowing_ids
      const transformedData = data.map((loan) => ({
        ...loan,
        borrowing_ids: [loan.borrowing_id], // Buat array dengan single borrowing_id
      }));

      setHistory(transformedData);
    } catch (error) {
      console.error("Detailed Error:", error);
      alert("Gagal memuat data peminjaman: " + error.message);
    }
  };

  // Use fetchHistory in useEffect
  useEffect(() => {
    fetchHistory();
  }, []);

  // Modifikasi fungsi handleDelete
  const handleDelete = async (borrowingId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/peminjaman/${borrowingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus peminjaman");
      }

      await response.json();

      setHistory((prevHistory) =>
        prevHistory.filter((item) => item.borrowing_id !== borrowingId)
      );

      setSnackbar({
        open: true,
        message: "Peminjaman berhasil dihapus",
        severity: "success",
      });
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  // Modifikasi fungsi handleOpenDeleteDialog
  const handleOpenDeleteDialog = (groupData) => {
    setItemToDelete(groupData);
    setDeleteDialogOpen(true);
  };

  // Fungsi untuk menutup dialog konfirmasi hapus
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Fungsi konfirmasi delete
  const confirmDelete = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete);
      handleCloseDeleteDialog();
    }
  };

  // handle perubahan dropdown
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredRows.slice(startIndex, endIndex);

  // Tambahkan method render untuk filter tambahan
  const renderDateFilterSection = () => (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="flex-start"
      sx={{ mt: 2 }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Tanggal Mulai"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="Tanggal Selesai"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
      <FormControl variant="outlined" sx={{ minWidth: 200 }}>
        <InputLabel>Bulan</InputLabel>
        <Select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          label="Bulan"
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200, // Atur tinggi maksimum dropdown
                width: 250, // Atur lebar dropdown jika diperlukan
              },
            },
          }}
        >
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
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
            Bukti Pengembalian
          </Typography>

          {loan.return_proof && (
            <Box sx={{ mb: 2 }}>
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
    <Box
      sx={{
        width: "100%",
        margin: "0 auto", // Pusatkan di layar
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        mt: 2,
        borderRadius: 2,
        p: 2,
        mb: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          mb: 4,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
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
          RIWAYAT TRANSAKSI PEMINJAMAN
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
        justifyContent="center"
        alignItems="center"
        spacing={2}
        sx={{
          pb: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ mt: "4px", px: 2, width: "100%" }}
        >
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
              width: 230,
              minWidth: 200,
            }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
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

          {renderDateFilterSection()}
        </Stack>
      </Stack>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ExportLoanWord loanData={filteredRows} />
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
      ></TableContainer>
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "#0C628B",
          padding: "25px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          borderBottom: "1px solid #e0e0e0",
        }}
      ></div>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px", // Border-radius untuk tabel
          overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
        }}
      >
        <Table aria-label="loan history table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>NIM/NIK</StyledTableCell>
              <StyledTableCell>Nomor Telepon</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>No Inventaris</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Keperluan</StyledTableCell>
              <StyledTableCell>Tanggal Pengambilan</StyledTableCell>
              <StyledTableCell>Tanggal Pengembalian</StyledTableCell>
              <StyledTableCell>Kondisi Ambil</StyledTableCell>
              <StyledTableCell>Kondisi Kembali</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((item, index) => (
              <StyledTableRow key={item.borrowing_id || index}>
                <StyledTableCell>
                  {index + 1 + page * rowsPerPage}
                </StyledTableCell>
                <StyledTableCell>{item.full_name}</StyledTableCell>
                <StyledTableCell>{item.nik}</StyledTableCell>
                <StyledTableCell>{item.phone_number}</StyledTableCell>
                <StyledTableCell>{item.item_name}</StyledTableCell>
                <StyledTableCell>{item.item_code}</StyledTableCell>
                <StyledTableCell>{item.quantity}</StyledTableCell>
                <StyledTableCell>{item.reason || "-"}</StyledTableCell>
                <StyledTableCell>
                  {new Date(item.borrow_date).toLocaleString()}
                </StyledTableCell>
                <StyledTableCell>
                  {new Date(item.return_date).toLocaleString()}
                </StyledTableCell>
                <StyledTableCell>
                  {item.initial_condition || "-"}
                </StyledTableCell>
                <StyledTableCell>
                  {item.return_condition || "-"}
                </StyledTableCell>

                <StyledTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
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
                          handleOpenDetail(item);
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
                      </DetailButton>
                    </Tooltip>
                    {/* Only show delete button for return/rejected status */}
                    {(item.status === "return" ||
                      item.status === "rejected" ||
                      item.status.startsWith("return: terlambat")) && (
                      <Tooltip title="Hapus">
                        <RemoveButton
                          variant="contained"
                          sx={{
                            my: 1,
                            mx: 2,
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
                            // Buat struktur data yang benar untuk dihapus
                            const deleteData = {
                              items: Array.isArray(item.items)
                                ? item.items
                                : [item],
                            };
                            handleOpenDeleteDialog(deleteData);
                          }}
                        >
                          <DeleteForeverOutlinedIcon
                            sx={{ fontSize: "20px" }}
                          />
                        </RemoveButton>
                      </Tooltip>
                    )}
                  </div>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "& .MuiTablePagination-toolbar": {
              justifyContent: "flex-end",
            },
          }}
        />
      </TableContainer>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: "12px", padding: "8px" },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"Apakah Anda yakin ingin menghapus?"}
        </DialogTitle>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              border: "2px solid ",
              borderColor: "black",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Batal
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              border: "2px solid #69D2FF",
              backgroundColor: "#69D2FF",
              color: "black",
              padding: "8px 16px",
            }}
            autoFocus
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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
    </Box>
  );
}
