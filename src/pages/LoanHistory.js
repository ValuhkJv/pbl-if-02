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
} from "@mui/material";
import { styled } from "@mui/system";

const StyledTableCell = styled(TableCell)({
  border: "1px solid #ddd",
  padding: "8px",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export default function LoanHistory() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
    })} WIB`; // Tambahkan zona waktu
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

  return (
    <div
      style={{
        width: "100%",
        marginTop: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        backgroundColor: "white"
      }}
    >
      <h2>Riwayat Transaksi Peminjaman</h2>
      <FormControl variant="outlined" sx={{ minWidth: 200, my: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filterStatus}
          onChange={handleFilterChange}
          label="Status"
        >
          <MenuItem value="Semua">Semua</MenuItem>
          <MenuItem value="Disetujui">Disetujui</MenuItem>
          <MenuItem value="Menunggu persetujuan">Menunggu persetujuan</MenuItem>
          <MenuItem value="Ditolak">Ditolak</MenuItem>
        </Select>
      </FormControl>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
      ></TableContainer>
      <div
        style={{
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
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((item, index) => (
              <StyledTableRow key={item.id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
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
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}
