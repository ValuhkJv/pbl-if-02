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

export default function RequestHistory() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");

  // data dummy
  const RequestHistory = [
    {
      id: 1,
      name: "lala",
      unit: "PAM",
      jenisbarang: "Kertas A4",
      quantity: 2,
      purpose: "untuk kegiatan kuliah",
      date: "10/09/2024",
      statusPengaju: "Submited",
      statusKepalaUnit: "Disetujui",
      statusStafSBUM: "Menunggu Persetujuan",
    },
    {
      id: 2,
      name: "budi",
      unit: "12345678",
      jenisbarang: "laptop",
      quantity: 1,
      purpose: "untuk kegiatan kuliah",
      date: "10/10/2024",
      statusPengaju: "Submited",
      statusKepalaUnit: "Disetujui",
      statusStafSBUM: "Menunggu Persetujuan",
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
      <h2>Riwayat Transaksi Permintaan</h2>
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
        <Table aria-label="request history table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>Unit</StyledTableCell>
              <StyledTableCell>Jenis Barang</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Uraian</StyledTableCell>
              <StyledTableCell>Tanggal</StyledTableCell>
              <StyledTableCell>Status Pengaju</StyledTableCell>
              <StyledTableCell>Status Kepala Unit</StyledTableCell>
              <StyledTableCell>Status Staf SBUM</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {RequestHistory
              .filter(
                (request) =>
                  filterStatus === "Semua" || request.status === filterStatus
              )
              .map((request, index) => (
                <StyledTableRow key={request.id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{request.name}</StyledTableCell>
                  <StyledTableCell>{request.unit}</StyledTableCell>
                  <StyledTableCell>{request.jenisbarang}</StyledTableCell>
                  <StyledTableCell>{request.quantity}</StyledTableCell>
                  <StyledTableCell>{request.purpose}</StyledTableCell>
                  <StyledTableCell>{request.date}</StyledTableCell>
                  <StyledTableCell>{request.statusPengaju}</StyledTableCell>
                  <StyledTableCell>{request.statusKepalaUnit}</StyledTableCell>
                  <StyledTableCell>{request.statusStafSBUM}</StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
