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
  Tooltip,
  CircularProgress,
  Alert,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

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

  const ActionButton = styled(Button)(({ theme }) => ({
    padding: "0",
    borderRadius: "50%",
    height: "35px",
    width: "35px",
    minWidth: "35px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
      new Date(item.date)
        .toLocaleDateString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
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
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      console.error("User ID is required!");
      return;
    }
    axios
      .get(`http://localhost:5000/requests?user_id=${userId}`)
      .then((response) => setRequests(response.data))
      .catch((error) => console.error("Error fetching requests:", error));
  }, [userId]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    const userId = sessionStorage.getItem("user_id");

    if (!userId) {
      setError("User ID tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/requests?user_id=${userId}`
      );
      setRequests(response.data);
      console.log("Fetched requests:", requests);
    } catch (err) {
      setError(
        "Gagal memuat data permintaan. " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportDetail = async (date) => {
    setExporting(true);
    try {
      const userId = sessionStorage.getItem("user_id");

      if (!userId) {
        throw new Error("User ID tidak ditemukan - silakan login ulang");
      }

      // Get the date in YYYY-MM-DD format, considering timezone
      const d = new Date(date);
      const formattedDate = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      console.log("Export request details:", {
        originalDate: date,
        formattedDate: formattedDate,
        userId: userId,
      });

      const response = await axios.get(
        `http://localhost:5000/requests/export/${formattedDate}`,
        {
          params: {
            user_id: userId,
          },
        }
      );

      console.log("Response data:", response.data.data[0]); // Add this line

      if (!response.data.success || !response.data.data?.length) {
        throw new Error("Tidak ada data untuk diekspor");
      }

      const firstDetail = response.data.data[0];

      // Create worksheet data
      const ws_data = [
        ["No.BO.16.2.2-V0 Borang Permintaan dan Serah Terima Persediaan"],
        [firstDetail.formatted_date],
        ["No", `: ${firstDetail.request_number}`, "", ""],
        ["Hari", `: ${firstDetail.day_of_week?.trim()}`, "", ""],
        ["Tanggal", `: Batam, ${firstDetail.formatted_date}`, "", ""],
        ["Unit/Bagian", `: ${firstDetail.division_name}`, "", ""],
        ["Uraian", `: ${firstDetail.reason}`, "", ""],
        [],
        ["No", "Jenis Barang", "Satuan", "Jumlah"],
      ];

      // Add items
      response.data.data.forEach((detail, index) => {
        ws_data.push([
          index + 1,
          detail.item_name || "-",
          detail.unit || "-",
          detail.quantity || 0,
        ]);
      });

      // Add signature section
      ws_data.push(
        [],
        [],
        [
          "Peminta / Penerima",
          "Menyetujui, Kepala Unit *)",
          "Menyerahkan, Petugas Umum",
          "",
        ],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        [
          `Nama    : ${firstDetail.requester_name || "-"}`,
          `Nama    : ${firstDetail.head_name || "-"}`,
          `Nama    : ${firstDetail.admin_name || "-"}`,
          "",
        ],
        [
          `NIK/NIP : ${firstDetail.request_by_id || "-"}`,
          `NIK/NIP : ${firstDetail.head_nik || "-"}`,
          `NIK/NIP : ${firstDetail.admin_nik || "-"}`,
          "",
        ],
        ["*)Kajur/KPS/Ka.Bag/Ka.Subbag/Ka.Unit/Ka.Pokja/Ka.Pusat", "", "", ""]
      );

      // Create and configure workbook
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();

      // Configure columns and merges
      ws["!cols"] = [
        { width: 20 },
        { width: 40 },
        { width: 25 },
        { width: 25 },
      ];

      // Add borders to all cells in the table
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_address = { c: C, r: R };
          const cell_ref = XLSX.utils.encode_cell(cell_address);

          if (!ws[cell_ref]) {
            ws[cell_ref] = { t: "s", v: "" };
          }

          ws[cell_ref].s = {
            font: { name: "Arial", sz: 11 },
            alignment: {
              vertical: "center",
              horizontal: R < 8 ? "left" : "center",
              wrapText: true,
            },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          };
        }
      }

      // Header styling
      const headerStyle = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "EEEEEE" } },
        alignment: { vertical: "center", horizontal: "center" },
        border: {
          top: { style: "medium" },
          bottom: { style: "medium" },
          left: { style: "medium" },
          right: { style: "medium" },
        },
      };
      // Apply header styles
      for (let C = 0; C <= 3; C++) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: 8 });
        ws[cell_ref].s = headerStyle;
      }

      // Apply header style to the header row
      const headerRow = 8; // Index of the header row (No, Jenis Barang, Satuan, Jumlah)
      for (let C = 0; C <= 3; C++) {
        const cell_ref = XLSX.utils.encode_cell({ c: C, r: headerRow });
        ws[cell_ref].s = headerStyle;
      }

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        {
          s: { r: ws_data.length - 1, c: 0 },
          e: { r: ws_data.length - 1, c: 3 },
        },
      ];

      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Generate and save file
      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true, // Enable cell styles
      });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      saveAs(blob, `Borang_Permintaan_${formattedDate}.xlsx`);
    } catch (err) {
      setError(err.message || "Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
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
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <div
            style={{
              bgcolor: "#0C628B",
              height: "25px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />
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
                  <StyledTableCell>
                    {page * rowsPerPage + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>
                    {new Date(request.date).toLocaleDateString()}
                  </StyledTableCell>
                  <StyledTableCell>{request.total_requests}</StyledTableCell>
                  <StyledTableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Tooltip title="Detail" placement="top">
                        <ActionButton
                          variant="contained"
                          color="primary"
                          onClick={() =>
                            navigate(`/DetailPermintaan/${request.date}`)
                          }
                        >
                          <InfoOutlinedIcon />
                        </ActionButton>
                      </Tooltip>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <Tooltip title="Export" placement="top">
                        <ActionButton
                          variant="contained"
                          color="secondary"
                          onClick={() => handleExportDetail(request.date)}
                          disabled={exporting}
                        >
                          {exporting ? (
                            <CircularProgress size={24} />
                          ) : (
                            <FileDownloadIcon />
                          )}
                        </ActionButton>
                      </Tooltip>
                    </Stack>
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
      )}
    </Box>
  );
};

export default RequestList;
