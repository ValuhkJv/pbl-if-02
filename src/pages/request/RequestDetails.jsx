import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Container,
  TableContainer,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const DetailPermintaan = () => {
  const { date } = useParams();
  const [details, setDetails] = useState([]);
  const userId = localStorage.getItem("user_id");
  const formattedDate = new Date(date).toLocaleDateString("en-CA"); // Hanya ambil bagian tanggalnya saja
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  useEffect(() => {
    if (userId) {
      axios
        .get(
          `http://localhost:5000/requests/detail/${formattedDate}?user_id=${userId}`
        )

        .then((res) => {
          setDetails(res.data);
        })
        .catch((err) => console.error("Error fetching details:", err));
    }
  }, [formattedDate, userId]);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value, 5);
    setPage(0);
  };

  // Filter rows based on search term
  const filteredRows = details.filter(
    (item) =>
      (!searchTerm || // if no search term, show all
        (item.item_name &&
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterStatus === "Semua" || item.status === filterStatus)
  );

  return (
    <Container maxWidth="xl" sx={{ mx: "auto", padding: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 5,
          padding: 2,
          justifyContent: "space-between",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Detail Permintaan Tanggal {formattedDate}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ mt: "4px" }}
        >
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
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "6px",
          overflowX: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Hari</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Alasan Permintaan</TableCell>
              <TableCell>Nama Barang</TableCell>
              <TableCell>Satuan</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Nama Peminta</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Alasan Penolakan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.map((detail, index) => (
              <TableRow key={detail.request_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{detail.day_of_week}</TableCell>
                <TableCell>
                  {new Date(detail.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{detail.division_name}</TableCell>
                <TableCell>{detail.reason}</TableCell>
                <TableCell>{detail.item_name}</TableCell>
                <TableCell>{detail.unit}</TableCell>
                <TableCell>{detail.quantity}</TableCell>
                <TableCell>{detail.requested_by}</TableCell>
                <TableCell>{detail.status}</TableCell>
                <TableCell>{detail.rejection_reason || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} // rows per page options
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default DetailPermintaan;
