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
  Modal,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Search as SearchIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export default function LoanHistory() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("Semua");

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
    const tanggalPinjam = new Date(item.tanggal_pinjam);

    // Filter berdasarkan status
    const statusMatch =
      filterStatus === "Semua" || item.status_peminjaman === filterStatus;

    // Filter berdasarkan nama barang
    const namaBarangMatch =
      !searchTerm ||
      item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter berdasarkan rentang tanggal
    const dateMatch =
      (!startDate || tanggalPinjam >= startDate.setHours(0, 0, 0, 0)) &&
      (!endDate ||
        tanggalPinjam <= new Date(endDate).setHours(23, 59, 59, 999));

    // Filter berdasarkan bulan dan tahun
    const monthMatch =
      selectedMonth === "Semua" ||
      tanggalPinjam.getMonth() + 1 === months.indexOf(selectedMonth);

    return statusMatch && namaBarangMatch && dateMatch && monthMatch;
  });

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token);

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await fetch("http://localhost:5000/peminjaman", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error("Gagal mengambil data peminjaman");
        }

        const data = await response.json();
        console.log("Fetched Transactions:", data); // Detailed data log

        if (data.length === 0) {
          console.warn("No transactions found");
        }

        setHistory(data);
      } catch (error) {
        console.error("Detailed Error:", error);
        alert("Gagal memuat data peminjaman: " + error.message);
      }
    };
    fetchHistory();
  }, []);

  // handle perubahan dropdown
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const formatTanggalDanJam = (dateString) => {
    if (!dateString) return "-";
    const tanggal = new Date(dateString);

    if (isNaN(tanggal)) return "-";

    return `${tanggal.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })}`; // Tambahkan zona waktu
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredLoanApproval = history.filter(
    (item) =>
      filterStatus === "Semua" || item.status_peminjaman === filterStatus
  );

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredLoanApproval.slice(startIndex, endIndex);

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
      <Box sx={{ mb: 4, justifyContent: "center", alignItems: "center" }}>
        <Typography variant="h4">Riwayat Transaksi Peminjaman</Typography>
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
          justifyContent= "center"
          sx={{ mt: "4px", px: 2, width: "100%" }}
        >
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
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
              width: 230,
              minWidth: 200,
            }}
          />
          {renderDateFilterSection()}
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
        <Table aria-label="loan history table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>NIK</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>No Inventaris</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Keperluan</StyledTableCell>
              <StyledTableCell>Tanggal Pinjam</StyledTableCell>
              <StyledTableCell>Tanggal Kembali</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Detail</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => (
                <StyledTableRow key={item.id}>
                  <StyledTableCell>
                    {index + 1 + page * rowsPerPage}
                  </StyledTableCell>
                  <StyledTableCell>{item.peminjam}</StyledTableCell>
                  <StyledTableCell>{item.nim_nik_nidn}</StyledTableCell>
                  <StyledTableCell>{item.nama_barang}</StyledTableCell>
                  <StyledTableCell>{item.no_inventaris}</StyledTableCell>
                  <StyledTableCell>{item.jumlah}</StyledTableCell>
                  <StyledTableCell>{item.keterangan}</StyledTableCell>
                  <StyledTableCell>
                    {formatTanggalDanJam(item.tanggal_pinjam)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {formatTanggalDanJam(item.tanggal_kembali)}
                  </StyledTableCell>
                  <StyledTableCell>{item.status_peminjaman}</StyledTableCell>
                  <StyledTableCell>
                    {" "}
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
                          handleOpenDetail(history);
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
                      </DetailButton>
                    </Tooltip>
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
        {/* Detail Modal */}
        <DetailModal
          open={openDetailModal}
          onClose={handleCloseDetail}
          loan={selectedLoan}
        />
      </TableContainer>
    </Box>
  );
}
