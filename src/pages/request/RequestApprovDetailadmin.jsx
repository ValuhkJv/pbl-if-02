import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  TableContainer,
  Paper,
  Typography,
  Checkbox,
  MenuItem,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
  Divider,
  Stack
} from "@mui/material";
import { styled } from "@mui/system";
import { Search as SearchIcon } from "@mui/icons-material";
import sweetAlert from "../../components/Alert";

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
  const { created_at } = useParams();
  const [details, setDetails] = useState([]);
  const [itemApprovals, setItemApprovals] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/requestsApprovalAdmin/details/${created_at}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDetails(response.data);
      } catch (error) {
        console.error("Error fetching details:", error);
        sweetAlert.error("Error", "Failed to fetch details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [created_at, token]);

  const handleApprovalChange = (request_id, checked) => {
    setItemApprovals((prev) => ({
      ...prev,
      [request_id]: checked,
    }));

    if (checked) {
      setRejectionReasons((prev) => {
        const updated = { ...prev };
        delete updated[request_id];
        return updated;
      });
    } else {
      setRejectionReasons((prev) => ({
        ...prev,
        [request_id]: prev[request_id] || "",
      }));
    }
  };

  const handleRejectionReasonChange = (request_id, reason) => {
    setRejectionReasons((prev) => ({
      ...prev,
      [request_id]: reason,
    }));
  };

  const validateSubmission = () => {
    const hasDecisions = details.some(
      (item) =>
        itemApprovals[item.request_id] ||
        rejectionReasons[item.request_id]?.trim()
    );

    if (!hasDecisions) {
      sweetAlert.warning("Warning", "Please make a decision for at least one item");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission()) return;
    setLoading(true);
    try {
      const requests = details
        .filter(item => item.status === "Approved by Head" &&
          (itemApprovals[item.request_id] !== undefined ||
            rejectionReasons[item.request_id]?.trim()))
        .map((item) => ({
          request_id: item.request_id,
          status: itemApprovals[item.request_id]
            ? "Approved by Staff SBUM"
            : "Rejected by Staff SBUM",
          rejection_reason: itemApprovals[item.request_id]
            ? null
            : rejectionReasons[item.request_id]?.trim(),
        }));

      if (requests.length === 0) {
        throw new Error("No eligible requests to update");
      }

      // Process requests sequentially instead of concurrently
      for (const request of requests) {
        await axios.put(
          `http://localhost:5000/requestsApprovalAdmin/${request.request_id}/admin-approval`,
          request,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      sweetAlert.success(
        `Berhasil memperbarui permintaan`
      );
      setItemApprovals({});
      setRejectionReasons({});

      // Refresh the details after successful update
      const response = await axios.get(
        `http://localhost:5000/requestsApprovalAdmin/details/${created_at}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDetails(response.data);

    } catch (error) {
      console.error("Error updating requests:", error);
      sweetAlert.error(
        "Gagal",
        "Gagal memperbarui permintaan: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRows = () => {
    return details.filter(
      (item) =>
        (!searchTerm ||
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterStatus === "Semua" || item.status === filterStatus)
    );
  };

  const displayedRows = getFilteredRows().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto",
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
            marginRight: 2, width: "250px",
            backgroundColor: "white",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="Semua">Semua</MenuItem>
              <MenuItem value="Approved by Staff SBUM">
                Disetujui Staff SBUM
              </MenuItem>
              <MenuItem value="Rejected by Staff SBUM">Ditolak Staff SBUM</MenuItem>
              <MenuItem value="Approved by Head">Menunggu Persetujuan</MenuItem>
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
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            marginRight: 2, width: "250px",
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
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Alasan</StyledTableCell>
              <StyledTableCell>Divisi</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Approve</StyledTableCell>
              <StyledTableCell>Alasan Penolakan</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((item, index) => (
              <StyledTableRow key={item.request_id}>
                <StyledTableCell>
                  {index + 1 + page * rowsPerPage}
                </StyledTableCell>
                <StyledTableCell>{item.item_name}</StyledTableCell>
                <StyledTableCell>{item.quantity}</StyledTableCell>
                <StyledTableCell>{item.reason}</StyledTableCell>
                <StyledTableCell>{item.user_division}</StyledTableCell>
                <StyledTableCell>{item.status}</StyledTableCell>
                <StyledTableCell>
                  {item.status === "Approved by Head" ? (
                    <Checkbox
                      checked={itemApprovals[item.request_id] || false}
                      onChange={(e) =>
                        handleApprovalChange(item.request_id, e.target.checked)
                      }
                    />
                  ) : item.status === "Approved by Staff SBUM" ? (
                    "✓"
                  ) : (
                    "-"
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {item.status === "Approved by Head" &&
                    !itemApprovals[item.request_id] ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={rejectionReasons[item.request_id] || ""}
                      onChange={(e) =>
                        handleRejectionReasonChange(
                          item.request_id,
                          e.target.value
                        )
                      }
                      placeholder="Enter reason for rejection"
                    />
                  ) : (
                    item.rejection_reason || "-"
                  )}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={details.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => setRowsPerPage(+e.target.value)}
        />
      </TableContainer>

      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ mt: 2, backgroundColor: "#0C628B", color: "white" }}
      >
        Submit
      </Button>

    </Box>
  );
};

export default DetailPersetujuanAdmin;
