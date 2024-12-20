import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  Typography,
  Modal,
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment,
  Stack,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import {
  InfoOutlined as InfoOutlinedIcon,
  DeleteForeverOutlined as DeleteForeverOutlinedIcon,
  ClearOutlined as ClearOutlinedIcon,
  CheckOutlined as CheckOutlinedIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

export default function LoanApproval() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loanApproval, setLoanApproval] = useState([]);
  const [alasanPenolakan, setAlasanPenolakan] = useState({});
  const [showRejectInput, setShowRejectInput] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [requests, setRequests] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
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
    textAlign: "left",
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

  // Tombol Setujui (Hijau)
  const ApproveButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#2e7d32", // Hijau gelap
    color: "white",
    "&:hover": {
      backgroundColor: "#1b5e20", // Hijau lebih gelap saat hover
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    textTransform: "none", // Mencegah uppercase otomatis
    fontWeight: 100,
    padding: "4px 8px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    fontSize: "12px",
  }));

  // Tombol Tolak (Merah)
  const RejectButton = styled(Button)(({ theme }) => ({
    backgroundColor: "#d32f2f", // Merah
    color: "white",
    "&:hover": {
      backgroundColor: "#b71c1c", // Merah lebih gelap saat hover
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    },
    textTransform: "none",
    fontWeight: 100,
    padding: "4px 8px",
    borderRadius: "8px",
    transition: "all 0.3s ease",
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

  const fetchLoanApproval = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/peminjaman", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data peminjaman");
      }

      const data = await response.json();

      // Filter hanya data yang belum dihapus
      const activeTransactions = data.filter((t) => !t.is_deleted);

      // Debug: Log fetched data
      console.log("Fetched Transactions:", data);

      setLoanApproval(activeTransactions); // Menggunakan activeTransactions
      localStorage.setItem("transactions", JSON.stringify(activeTransactions));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("Gagal memuat data peminjaman");
    }
  };

  useEffect(() => {
    fetchLoanApproval();
  }, []);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleApprove = async (id) => {
    console.log("Approving loan with ID:", id); // Debug log
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/peminjaman/persetujuan/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // Tambahkan header Authorization
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status_peminjaman: "Disetujui" }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // Ambil data kesalahan
        throw new Error(errorData.error || "Gagal menyetujui peminjaman.");
      }

      alert("Peminjaman disetujui!");
      fetchLoanApproval();
    } catch (error) {
      console.error("Error approving loan:", error); // Log kesalahan
      alert("Terjadi kesalahan saat menyetujui peminjaman.");
    }
  };

  const handleReject = async (id) => {
    const alasan = alasanPenolakan[id];

    if (!alasan) {
      alert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/peminjaman/persetujuan/${id}`,
        {
          status_peminjaman: "Ditolak",
          alasan_penolakan: alasan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        alert("Penolakan berhasil disimpan.");
        setShowRejectInput(null); // Reset input visibility
        setAlasanPenolakan((prev) => ({
          ...prev,
          [id]: "", // Reset input value
        }));
        fetchLoanApproval();
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
      console.error(
        "Error rejecting loan:",
        error.response?.data || error.message
      );

      // Tampilkan pesan error dari server jika ada
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Terjadi kesalahan saat menyimpan penolakan.";

      alert(errorMessage);
    }
  };

  const handleReasonChange = (id, value) => {
    setAlasanPenolakan((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCloseReasonInput = (id) => {
    setShowRejectInput(null);
    setAlasanPenolakan((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const formatTanggal = (dateString) => {
    const tanggal = new Date(dateString);
    return tanggal.toLocaleDateString("id-ID");
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Filter rows based on search term
  const filteredRows = requests.filter(
    (item) =>
      item.nama_barang &&
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) &&
      // Filter by status
      (filterStatus === "Semua" || item.status_peminjaman === filterStatus)
  );

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  const filteredLoanApproval = loanApproval.filter(
    (item) =>
      filterStatus === "Semua" || item.status_peminjaman === filterStatus
  );

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredLoanApproval.slice(startIndex, endIndex);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setRequests(JSON.parse(storedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("request", JSON.stringify(requests));
  }, [requests]);

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
      setRequests(data);
      localStorage.setItem("transactions", JSON.stringify(data));
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: "ID peminjaman tidak valid",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/peminjaman/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus peminjaman");
      }

      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });

      // Memperbarui state dengan memanggil fetchLoanApproval
      fetchLoanApproval();

      setRequests((prevTransactions) =>
        prevTransactions.filter((t) => t.id !== id)
      );
      await refreshTransactions();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/peminjaman", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data peminjaman");
        }

        const data = await response.json();

        // Filter hanya data yang belum dihapus
        const activeTransactions = data.filter((t) => !t.is_deleted);

        // Debug: Log fetched data
        console.log("Fetched Transactions:", data);
        setRequests(activeTransactions);
        setRequests(data);
        localStorage.setItem("transactions", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Gagal memuat data peminjaman");
      }
    };

    fetchTransactions();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Fungsi untuk membuka dialog konfirmasi hapus
  const handleOpenDeleteDialog = (id) => {
    setItemToDelete(id);
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

  useEffect(() => {
    try {
      console.log("Opening modal with data:", selectedLoan);
      if (selectedLoan) {
        setOpenDetailModal(true);
      }
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  }, [selectedLoan]);

  // Handler untuk membuka modal detail
  const handleOpenDetail = (loan) => {
    console.log("Opening detail for loan:", loan); // Tambahkan log ini
    if (!loan) {
      console.error("No loan data provided");
      return;
    }
    setSelectedLoan(loan);
    setOpenDetailModal(true);
  };

  // Handler untuk menutup modal detail
  const handleCloseDetail = () => {
    setOpenDetailModal(false);
    setSelectedLoan(null);
  };

  useEffect(() => {
    console.log("Modal state:", openDetailModal);
    console.log("Selected loan:", selectedLoan);
  }, [openDetailModal, selectedLoan]);

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
            Detail Peminjaman
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informasi Peminjam:
            </Typography>
            <Typography>Nama: {loan.peminjam}</Typography>
            <Typography>NIM/NIK/NIDN: {loan.nim_nik_nidn}</Typography>
            <Typography>Status: {loan.status_peminjaman}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informasi Barang:
            </Typography>
            <Typography>Nama Barang: {loan.nama_barang}</Typography>
            <Typography>No Inventaris: {loan.no_inventaris}</Typography>
            <Typography>Jumlah: {loan.jumlah}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kondisi Barang:
            </Typography>
            <Typography>
              Saat Dipinjam: {loan.kondisi_saat_ambil || "-"}
            </Typography>
            <Typography>
              Saat Dikembalikan: {loan.kondisi_saat_kembali || "-"}
            </Typography>
          </Box>

          {loan.bukti_pengembalian && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bukti Pengembalian:
              </Typography>
              <img
                src={`http://localhost:5000/uploads/${loan.bukti_pengembalian}`}
                alt="Bukti Pengembalian"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          )}

          <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
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
        px: 2,
        mb: 2,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="h4">Persetujuan Peminjaman</Typography>
        </Box>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ mt: "4px" }}
        >
          <FormControl variant="outlined" sx={{ minWidth: 200, width: "100%" }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="Semua">Semua</MenuItem>
              <MenuItem value="Disetujui">Disetujui</MenuItem>
              <MenuItem value="Menunggu persetujuan">
                Menunggu persetujuan
              </MenuItem>
              <MenuItem value="Ditolak">Ditolak</MenuItem>
            </Select>
          </FormControl>

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
              width: 250,
            }}
          />
        </Stack>
      </Stack>

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
        <Table aria-label="loan approval table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>NIM/NIK/NIDN</StyledTableCell>
              <StyledTableCell>Tanggal Pinjam</StyledTableCell>
              <StyledTableCell>Tanggal Kembali</StyledTableCell>
              <StyledTableCell>Alasan Penolakan</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Validasi</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((request, index) => (
                <StyledTableRow hover key={request.id}>
                  <StyledTableCell>
                    {index + 1 + page * rowsPerPage}
                  </StyledTableCell>
                  <StyledTableCell>{request.peminjam}</StyledTableCell>
                  <StyledTableCell>{request.nim_nik_nidn}</StyledTableCell>
                  <StyledTableCell>
                    {formatTanggal(request.tanggal_pinjam)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {request.tanggal_kembali
                      ? formatTanggal(request.tanggal_kembali)
                      : ""}
                  </StyledTableCell>
                  <StyledTableCell>
                    {request.alasan_penolakan || "-"}
                  </StyledTableCell>

                  <StyledTableCell>{request.status_peminjaman}</StyledTableCell>
                  <StyledTableCell>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column", // Ubah menjadi column
                        alignItems: "center", // Tambahkan ini
                        justifyContent: "center", // Tambahkan ini
                        width: "100%", // Pastikan full width
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%", // Pastikan full width
                        }}
                      >
                        {(request.status_peminjaman ===
                          "Menunggu Persetujuan" ||
                          request.status_peminjaman === "Ditolak") && (
                          <ApproveButton
                            startIcon={<CheckOutlinedIcon />}
                            variant="contained"
                            sx={{
                              my: 1,
                              mx: 1,
                              borderRadius: "8px",
                              height: "35px",
                            }}
                            onClick={() => handleApprove(request.id)}
                          >
                            Setujui
                          </ApproveButton>
                        )}

                        {(request.status_peminjaman === "Disetujui" ||
                          request.status_peminjaman ===
                            "Menunggu Persetujuan") && (
                          <RejectButton
                            variant="contained"
                            startIcon={<ClearOutlinedIcon />}
                            sx={{
                              my: 1,
                              mx: 1,
                              padding: "8px 16px",
                              borderRadius: "8px",
                              height: "35px",
                            }}
                            onClick={() => setShowRejectInput(request.id)}
                          >
                            Tolak
                          </RejectButton>
                        )}
                      </div>

                      {showRejectInput === request.id && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            width: "100%", // Pastikan full width
                            marginTop: "10px", // Tambahkan margin top
                          }}
                        >
                          <TextField
                            placeholder="Alasan penolakan"
                            autoFocus
                            fullWidth // Gunakan fullWidth untuk TextField
                            onChange={(e) =>
                              handleReasonChange(request.id, e.target.value)
                            }
                            value={alasanPenolakan[request.id] || ""}
                            sx={{
                              width: "100%",
                              marginBottom: "10px", // Tambahkan margin bottom
                            }}
                          />
                          <div
                            style={{
                              display: "table-row",
                              justifyContent: "left",
                              gap: "20px",
                            }}
                          >
                            <Button
                              variant="contained"
                              sx={{
                                padding: "2px 4px",
                                borderRadius: "8px",
                                height: "30px",
                                mr: "2px",
                              }}
                              onClick={() => handleReject(request.id)}
                            >
                              Kirim
                            </Button>
                            <Button
                              variant="outlined"
                              sx={{
                                padding: "2px 4px",
                                borderRadius: "8px",
                                height: "30px",
                                ml: "4px",
                              }}
                              onClick={() => handleCloseReasonInput(request.id)}
                            >
                              Tutup
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
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
                            console.log("DetailButton clicked!");
                            handleOpenDetail(request);
                          }}
                        >
                          <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
                        </DetailButton>
                      </Tooltip>
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
                          onClick={() => handleOpenDeleteDialog(request.id)}
                        >
                          <DeleteForeverOutlinedIcon
                            sx={{ fontSize: "20px" }}
                          />
                        </RemoveButton>
                      </Tooltip>
                    
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
        />
      </TableContainer>
      {/* Detail Modal */}
      <DetailModal
        open={openDetailModal}
        onClose={handleCloseDetail}
        loan={selectedLoan}
      />

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
    </Box>
  );
}
