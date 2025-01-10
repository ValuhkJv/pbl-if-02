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
  TableContainer,
  Paper,
  TablePagination,
  Box,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Stack,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { styled } from "@mui/system";

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

const DetailPermintaan = () => {
  const { date } = useParams();
  const [details, setDetails] = useState([]);
  const userId = sessionStorage.getItem("user_id");
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
        filterStatus === "Semua" || item.status === filterStatus;

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
          DATA PERMINTAAN TANGGAL {formattedDate}
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
          <FormControl
            variant="outlined"
            sx={{
              width: "250px",
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="Semua">Semua</MenuItem>
              <MenuItem value="pending">Menunggu Persetujuan</MenuItem>
              <MenuItem value="Approved by Head">
                Disetujui Kepala Unit
              </MenuItem>
              <MenuItem value="Approved by Staff SBUM">
                Disetujui Staff SBUM
              </MenuItem>
              <MenuItem value="Rejected by Head">Ditolak Kepala Unit</MenuItem>
              <MenuItem value="Rejected by Staff SBUM">
                Ditolak Staff SBUM
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Search di kanan */}
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
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Hari</StyledTableCell>
              <StyledTableCell>Tanggal</StyledTableCell>
              <StyledTableCell>Unit</StyledTableCell>
              <StyledTableCell>Alasan Permintaan</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>Satuan</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Nama Peminta</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Alasan Penolakan</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((detail, index) => (
              <StyledTableRow key={detail.request_id}>
                <StyledTableCell>
                  {index + 1 + page * rowsPerPage}
                </StyledTableCell>
                <StyledTableCell>{detail.day_of_week}</StyledTableCell>
                <StyledTableCell>
                  {new Date(detail.date).toLocaleDateString()}
                </StyledTableCell>
                <StyledTableCell>{detail.division_name}</StyledTableCell>
                <StyledTableCell>{detail.reason}</StyledTableCell>
                <StyledTableCell>{detail.item_name}</StyledTableCell>
                <StyledTableCell>{detail.unit}</StyledTableCell>
                <StyledTableCell>{detail.quantity}</StyledTableCell>
                <StyledTableCell>{detail.requested_by}</StyledTableCell>
                <StyledTableCell>{detail.status}</StyledTableCell>
                <StyledTableCell>
                  {detail.rejection_reason || "-"}
                </StyledTableCell>
              </StyledTableRow>
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
    </Box>
  );
};

export default DetailPermintaan;
