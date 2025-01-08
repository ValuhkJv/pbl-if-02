import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  TableContainer,
  Paper,
  Divider,
  Stack,
  Tooltip,
  InputAdornment,
  TextField,
  TablePagination
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InfoOutlined as InfoOutlinedIcon, Search as SearchIcon, } from "@mui/icons-material";
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

const RequestApprovalHead = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const division = localStorage.getItem("division_name"); // Divisi kepala unit
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  useEffect(() => {
    axios
      .get(`http://localhost:5000/requestsApprovHead/head-approval/${division}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, [division]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value, 5);
    setPage(0);
  };

  // Move filtering logic after null check
  const getFilteredRows = () => {
    if (!requests) return [];
    return requests.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        !searchTerm ||
        (item.full_name && item.full_name.toLowerCase().includes(searchLower)) ||
        (item.total_requests && item.total_requests.toString().includes(searchTerm))
      );
    });
  };

  const getDisplayedRows = () => {
    const filteredRows = getFilteredRows();
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRows.slice(startIndex, endIndex);
  };

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  const filteredRows = getFilteredRows();
  const displayedRows = getDisplayedRows();

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
          DATA PERMINTAAN BARANG
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
          alignItems="flex-end"
        >
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
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>Jumlah Permintaan</StyledTableCell>
              <StyledTableCell>Tanggal Permintaan</StyledTableCell>
              <StyledTableCell>Divisi</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((req, index) => (
              <StyledTableRow key={req.user_id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{req.full_name}</StyledTableCell>
                <StyledTableCell>{req.total_requests}</StyledTableCell>
                <StyledTableCell>
                  {new Date(req.created_at).toLocaleDateString()}
                </StyledTableCell>

                <StyledTableCell>{req.division_name}</StyledTableCell>
                <StyledTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
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
                          navigate(
                            `/requestsApprovHead/head-approval/details/${new Date(
                              req.created_at
                            ).toLocaleDateString("en-CA")}`
                          );
                        }}
                      >
                        <InfoOutlinedIcon />
                      </DetailButton>
                    </Tooltip>
                  </div>
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

export default RequestApprovalHead;
