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
  Container,
  Box,
  Divider,
  Typography
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

export default function RequestApproval() {
  // state untuk menyimpan status filter
  const [filterStatus, setFilterStatus] = useState("Semua");

  // data dummy
  const RequestApproval = [
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
    <div>

      <Container maxWidth="sm" style={{ marginTop: 40 }}>
        <Box display="flex" alignItems="center" justifyContent="center" marginBottom={3}>
          <Divider style={{ width: "20%", backgroundColor: "#0C628B" }} />
          <Typography variant="h6" style={{ margin: "0 10px", color: "#000000", fontWeight: "bold", fontFamily: "Sansita", fontSize: "27px" }}>
            Persetujuan Permintaan
          </Typography>
          <Divider style={{ width: "20%", backgroundColor: "#0C628B" }} />
        </Box>
      </Container>

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
          padding: "10px",
          borderTopLeftRadius: "5px",
          borderTopRightRadius: "5px",
          borderBottom: "1px solid #e0e0e0",
        }}
      ></div>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "5px", // Border-radius untuk tabel
          overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
        }}
      >
        <Table aria-label="request approval table">
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
            {RequestApproval
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
