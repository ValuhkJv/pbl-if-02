import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

  // data dummy
  const loanHistory = [
    {
      id: 1,
      name: "lala",
      nik: "2343546",
      itemName: "infocus",
      inventoryNo: "234567",
      quantity: 2,
      purpose: "untuk kegiatan kuliah",
      borrowDate: "10/09/2024",
      returnDate: "10/15/2024",
      status: "Menunggu persetujuan",
    },
    {
      id: 2,
      name: "budi",
      nik: "12345678",
      itemName: "laptop",
      inventoryNo: "09876",
      quantity: 1,
      purpose: "untuk kegiatan kuliah",
      borrowDate: "10/10/2024",
      returnDate: "10/18/2024",
      status: "Disetujui",
    },
  ];

  // handle perubahan dropdown
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  return (
    <div
      style={{
        width: "100%",
        marginTop: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "20px",
      }}
    >
      <h2>Riwayat Transaksi Peminjaman</h2>
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
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loanHistory
              .filter(
                (history) =>
                  filterStatus === "Semua" || history.status === filterStatus
              )
              .map((history, index) => (
                <StyledTableRow key={history.id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{history.name}</StyledTableCell>
                  <StyledTableCell>{history.nik}</StyledTableCell>
                  <StyledTableCell>{history.itemName}</StyledTableCell>
                  <StyledTableCell>{history.inventoryNo}</StyledTableCell>
                  <StyledTableCell>{history.quantity}</StyledTableCell>
                  <StyledTableCell>{history.purpose}</StyledTableCell>
                  <StyledTableCell>{history.borrowDate}</StyledTableCell>
                  <StyledTableCell>{history.returnDate}</StyledTableCell>
                  <StyledTableCell>{history.status}</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
