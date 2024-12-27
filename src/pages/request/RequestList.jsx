import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  TableContainer,
  Paper,
  Box,
} from "@mui/material";
import { Container, styled } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  InfoOutlined as InfoOutlinedIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";

const RequestList = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    wordWrap: "break-word",
  });

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
  const filteredRows = requests.filter(
    (item) =>
      (!searchTerm || // if no search term, show all
        (item.item_name &&
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterStatus === "Semua" || item.status === filterStatus)
  );

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID is required!");
      return;
    }
    axios
      .get(`http://localhost:5000/requests?user_id=${userId}`)
      .then((response) => setRequests(response.data))
      .catch((error) => console.error("Error fetching requests:", error));
  }, [userId]);

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
        <Typography variant="h4" gutterBottom flexGrow={1}>
          Data Permintaan Barang
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/request")}
          disabled={
            requests.filter(
              (req) =>
                new Date(req.request_date).toDateString() ===
                new Date().toDateString()
            ).length >= 5
          }
        >
          <AddIcon />
          Permintaan
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflowX: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 2,
            mb: 2,
          }}
        >
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
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Tanggal Permintaan</StyledTableCell>
              <StyledTableCell>Jumlah Permintaan</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request, index) => (
              <TableRow key={request.date}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>
                  {new Date(request.date).toLocaleDateString()}
                </StyledTableCell>
                <StyledTableCell>{request.total_requests}</StyledTableCell>
                <StyledTableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      navigate(`/DetailPermintaan/${request.date}`)
                    }
                  >
                    <InfoOutlinedIcon />
                  </Button>
                </StyledTableCell>
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

export default RequestList;
