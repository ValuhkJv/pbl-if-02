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
  TablePagination,
  TableContainer,
  Paper,
  Box,
  Divider,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/system";
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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
      !searchTerm || 
      new Date(item.date).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.total_requests.toString().includes(searchTerm)
  );

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(0);
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
    <Box
      sx={{
        width: "100%",
        margin: "0 auto", // Pusatkan di layar
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: 2,
        px: 2,
        py: 4,
        bgcolor: "background.paper",
        justifyContent: "space-between",
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
          alignItems="center"
        >
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
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          
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
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Tanggal Permintaan</StyledTableCell>
              <StyledTableCell>Jumlah Permintaan</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((request, index) => (
              <StyledTableRow key={request.date}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>
                  {new Date(request.date).toLocaleDateString()}
                </StyledTableCell>
                <StyledTableCell>{request.total_requests}</StyledTableCell>
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
                      onClick={() =>
                        navigate(`/DetailPermintaan/${request.date}`)
                      }
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

export default RequestList;
