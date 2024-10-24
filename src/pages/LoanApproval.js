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

export default function LoanApproval() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");

  // data dummy
  const loanRequests = [
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
      <h2>Persetujuan Peminjaman</h2>
      <FormControl variant="outlined" sx={{ minWidth: 200, my: 2}}>
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
        <Table aria-label="loan approval table">
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
            {loanRequests
              .filter(
                (request) =>
                  filterStatus === "Semua" || request.status === filterStatus
              )
              .map((request, index) => (
                <StyledTableRow key={request.id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{request.name}</StyledTableCell>
                  <StyledTableCell>{request.nik}</StyledTableCell>
                  <StyledTableCell>{request.itemName}</StyledTableCell>
                  <StyledTableCell>{request.inventoryNo}</StyledTableCell>
                  <StyledTableCell>{request.quantity}</StyledTableCell>
                  <StyledTableCell>{request.purpose}</StyledTableCell>
                  <StyledTableCell>{request.borrowDate}</StyledTableCell>
                  <StyledTableCell>{request.returnDate}</StyledTableCell>
                  <StyledTableCell>{request.status}</StyledTableCell>
                  <StyledTableCell>
                    <Button variant="contained" color="primary">
                      Approve
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
