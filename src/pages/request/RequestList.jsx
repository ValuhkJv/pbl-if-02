import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
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
import { useNavigate } from "react-router-dom";
import {
  InfoOutlined as InfoOutlinedIcon,
  Search as SearchIcon,
  Add as AddIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";

const RequestList = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError("User ID tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/requests?user_id=${userId}`);
      setRequests(response.data);
    } catch (err) {
      setError("Gagal memuat data permintaan. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExportDetailExcel = async (date) => {

    try {
      // Format date to match PostgreSQL date format (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await axios.get(`http://localhost:5000/requests/export/${formattedDate}`, {
        params: { user_id: userId },
      });

      const details = response.data;

      if (details.length === 0) {
        alert("Tidak ada detail permintaan untuk tanggal ini.");
        return;
      }
      // Get the first detail for header information
      const firstDetail = details[0];

      const ws_data = [
        ["No.BO.16.2.2-V0 Borang Permintaan dan Serah Terima Persediaan"],
        ["27 Agustus 2024"],
        ["No", ":", firstDetail.request_number || "", ""],
        ["Hari", ":", firstDetail.day_of_week || "", ""],
        ["Tanggal", `: Batam, ${firstDetail.formatted_date}`, "", ""],
        ["Unit/Bagian", ":", firstDetail.division_name || "", ""],
        ["Uraian", ":", firstDetail.reason || "", ""],
        [],
        ["No", "Jenis Barang", "Satuan", "Jumlah"]
      ];

      // Add the details
      details.forEach((detail, index) => {
        ws_data.push([
          index + 1,
          detail.item_name,
          detail.unit,
          detail.quantity
        ]);
      });

      // Add signature section with actual names and employee IDs
      ws_data.push(
        [],
        [],
        ["Peminta / Penerima", "Menyetujui, Kepala Unit *)", "Menyerahkan, Petugas Umum", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        [`Nama    : ${firstDetail.requester_name || ""}`,
        `Nama    : ${firstDetail.approved_by_head || ""}`,
        `Nama    : ${firstDetail.approved_by_admin || ""}`, ""],
        [`NIK/NIP : ${firstDetail.request_by_id || ""}`,
          `NIK/NIP : `,
          `NIK/NIP : `, ""],
        ["*)Kajur/KPS/Ka.Bag/Ka.Subbag/Ka.Unit/Ka.Pokja/Ka.Pusat", "", "", ""]
      );

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(ws_data);

      // Set column widths
      ws['!cols'] = [
        { width: 5 },   // A
        { width: 30 },  // B
        { width: 15 },  // C
        { width: 15 }   // D
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Define merges
      ws['!merges'] = [
        // Title
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        // Date
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        // Signature section merges
        { s: { r: ws_data.length - 7, c: 0 }, e: { r: ws_data.length - 7, c: 0 } },
        { s: { r: ws_data.length - 7, c: 1 }, e: { r: ws_data.length - 7, c: 1 } },
        { s: { r: ws_data.length - 7, c: 2 }, e: { r: ws_data.length - 7, c: 2 } },
        // Footer note merge
        { s: { r: ws_data.length - 1, c: 0 }, e: { r: ws_data.length - 1, c: 3 } }
      ];

      // Generate buffer and save file
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array'
      });

      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, `Borang_Permintaan_${formattedDate}.xlsx`);
    } catch (error) {
      console.error("Error exporting details:", error);
      if (error.response) {
        alert(`Export failed: ${error.response.data.message || 'Server error occurred'}`);
      } else if (error.message === "User ID not found") {
        alert("Please login again to export data");
      } else {
        alert("An error occurred while trying to export. Please try again.");
        console.error(error); // Log the full error for debugging
      }
    }
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
                    <Tooltip title="Detail" placement="top">
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
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ mx: 1 }}
                    />
                    <Tooltip title="Export" placement="top">
                      <Button
                        variant="contained"
                        color="secondary"
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
                        onClick={() => handleExportDetailExcel(request.date)}
                      >
                        <FileDownloadIcon />
                      </Button>
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
