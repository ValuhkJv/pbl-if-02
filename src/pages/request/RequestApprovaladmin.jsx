import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  TableContainer,
  Paper,
  Box,
  Divider,
  Stack,
  TextField,
  InputAdornment,
  Tooltip,
  TablePagination,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Search as SearchIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

const RequestApprovalAdmin = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const division = sessionStorage.getItem("division_name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // State untuk filter tanggal
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  useEffect(() => {
    axios
      .get(`http://localhost:5000/requestsApprovalAdmin/${division}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, [division]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter rows berdasarkan tanggal, bulan dan tahun
  const filteredRows = requests.filter((item) => {
    const tanggalPinjam = new Date(item.created_at); // Add time component for proper date parsing

    // Filter pencarian di multiple fields
    const searchMatch =
      !searchTerm ||
      (item.full_name &&
        item.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.nik && item.nik.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phone_number &&
        item.phone_number.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter berdasarkan rentang tanggal
    let dateMatch = true;

    if (startDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      dateMatch = dateMatch && tanggalPinjam >= startDateTime;
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && tanggalPinjam <= endDateTime;
    }

    return searchMatch && dateMatch; // Return the combined filter result
  });

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const displayedRows = filteredRows.slice(startIndex, endIndex);

  // Tambahkan method render untuk filter tambahan
  const renderDateFilterSection = () => (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ width: { xs: "100%", md: "auto" } }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <DatePicker
            label="Tanggal Mulai"
            sx={{
              width: "250px",
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
            value={startDate}
            onChange={(newValue) => {
              if (newValue) {
                const date = new Date(newValue);
                date.setHours(0, 0, 0, 0);
                setStartDate(date);
              } else {
                setStartDate(null);
              }
            }}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Tanggal Selesai"
            sx={{
              width: "250px",
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
            value={endDate}
            onChange={(newValue) => {
              if (newValue) {
                const date = new Date(newValue);
                date.setHours(23, 59, 59, 999);
                setEndDate(date);
              } else {
                setEndDate(null);
              }
            }}
            minDate={startDate} // Prevent selecting end date before start date
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </LocalizationProvider>
    </Stack>
  );

  // Modified table cell to format date correctly
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
          DATA PERSETUJUAN PERMINTAAN BARANG
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
          {renderDateFilterSection()}
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
          borderRadius: "12px", // Border-radius untuk tabel
          overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
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
            {displayedRows.map((request, index) => (
              <StyledTableRow key={request.user_id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{request.full_name}</StyledTableCell>
                <StyledTableCell>{request.total_requests}</StyledTableCell>
                <StyledTableCell>
                  {formatDate(request.created_at)}
                </StyledTableCell>
                <StyledTableCell>{request.division_name}</StyledTableCell>
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
                            `/requestsApprovalAdmin/details/${new Date(
                              request.created_at
                            ).toLocaleDateString("en-CA")}/${request.user_id}`
                          );
                        }}
                      >
                        <InfoOutlinedIcon sx={{ fontSize: "20px" }} />
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

export default RequestApprovalAdmin;
