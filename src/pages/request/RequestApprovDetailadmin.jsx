import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  TableContainer,
  Paper,
  Box,
  Typography,
  Stack,
  Divider,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  TablePagination
} from "@mui/material";
import { styled } from "@mui/system";
import {
  Search as SearchIcon,
} from "@mui/icons-material";

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

const DetailPersetujuanAdmin = () => {
  const { created_at } = useParams(); // request_id permintaan
  const [details, setDetails] = useState([]); // Data detail barang
  const [status, setStatus] = useState(""); // Status aksi
  const [reason, setReason] = useState(""); // Alasan jika ditolak
  const [activeIndex, setactiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const token = localStorage.getItem("token"); // Ambil token dari local storage

  useEffect(() => {
    console.log("Tanggal yang dikirim ke backend:", created_at);

    axios
      .get(
        `http://localhost:5000/requestsApprovalAdmin/details/${created_at}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
          },
        }
      )
      .then((res) => setDetails(res.data))
      .catch((err) => console.error(err));
  }, [created_at, token]);

  const handleApproval = (approvalStatus, request_id) => {
    const payload = {
      status: approvalStatus,
      rejection_reason:
        approvalStatus === "Rejected by Staff SBUM" ? reason : null,
    };

    axios
      .put(
        `http://localhost:5000/requestsApprovalAdmin/${request_id}/admin-approval`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
          },
        }
      )
      .then(() => alert("Permintaan berhasil diperbarui."))
      .catch((err) => console.error(err));
  };

  const handleRejectButton = (index) => {
    setStatus("Rejected by Staff SBUM");
    setactiveIndex(index);
  };

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

  // Menggabungkan filter status dan pencarian dalam satu fungsi
  const getFilteredRows = () => {
    return details.filter((item) => {
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


  return (
    <Box
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
          DETAIL PERSETUJUAN
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
        alignItems="center"
        spacing={2}
        sx={{
          pb: 2,
        }}
      >
        {/* Filter di kiri */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
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
              <MenuItem value="pending">Menunggu Persetujuan</MenuItem>
              <MenuItem value="Approved by Head">Disetujui Kepala Unit</MenuItem>
              <MenuItem value="Approved by Staff SBUM">Disetujui Staff SBUM</MenuItem>
              <MenuItem value="Rejected by Head">Ditolak Kepala Unit</MenuItem>
              <MenuItem value="Rejected by Staff SBUM">Ditolak Staff SBUM</MenuItem>
            </Select>
          </FormControl>
        </Stack>
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
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
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
      />
      {/* Tabel Detail Permintaan */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px", // Border-radius untuk tabel
          overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Alasan</StyledTableCell>
              <StyledTableCell>Divisi</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((item, index) => (
              <StyledTableRow key={item.request_id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{item.item_name}</StyledTableCell>
                <StyledTableCell>{item.quantity}</StyledTableCell>
                <StyledTableCell>{item.reason}</StyledTableCell>
                <StyledTableCell>{item.user_division}</StyledTableCell>
                <StyledTableCell>{item.status}</StyledTableCell>
                <StyledTableCell>
                  {/* Tombol Persetujuan */}
                  <div style={{ marginTop: "20px" }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleApproval("Approved by Staff SBUM", item.request_id)
                      }
                    >
                      Setujui
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleRejectButton(index)}
                    >
                      Tolak
                    </Button>
                  </div>

                  {/* Input Alasan Penolakan */}
                  {status === "Rejected by Staff SBUM" &&
                    activeIndex === index && (
                      <div style={{ marginTop: "20px" }}>
                        <TextField
                          fullWidth
                          label="Alasan Penolakan"
                          variant="outlined"
                          multiline
                          rows={3}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          style={{ marginTop: "10px" }}
                          onClick={() =>
                            handleApproval(
                              "Rejected by Staff SBUM",
                              item.request_id
                            )
                          }
                        >
                          Kirim
                        </Button>
                      </div>
                    )}
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
    </Box>
  );
};

export default DetailPersetujuanAdmin;
