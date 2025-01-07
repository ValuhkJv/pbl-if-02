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
  TableContainer,
  Paper,
  Typography,
  Checkbox,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
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
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

const RequestApprovDetail = () => {
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
          `http://localhost:5000/requestsApprovHead/head-approval/details/${created_at}`,
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
    sweetAlert.warning("Processing", "Please wait while we process your request...");
    setLoading(true);
    try {
      // Only process items that are pending and have been modified
      const modifiedRequests = details
        .filter(item => 
          item.status.toLowerCase() === "pending" && 
          (itemApprovals.hasOwnProperty(item.request_id) || 
           rejectionReasons.hasOwnProperty(item.request_id))
        )
        .map(item => ({
          request_id: item.request_id,
          status: itemApprovals[item.request_id] ? "Approved by Head" : "Rejected by Head",
          rejection_reason: itemApprovals[item.request_id] 
            ? null 
            : rejectionReasons[item.request_id]?.trim()
        }));
  
      if (modifiedRequests.length === 0) {
        sweetAlert.warning("Warning", "No pending items were modified");
        return;
      }
  
      const results = await Promise.allSettled(
        modifiedRequests.map(request =>
          axios.put(
            `http://localhost:5000/requestsApprovHead/${request.request_id}/head-approval`,
            request,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );
  
      // Handle partial success/failure
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
  
      if (failed > 0) {
        sweetAlert.warning(
          "Sebagian Berhasil",
          `Berhasil memperbarui ${successful} permintaan. Gagal: ${failed} permintaan`
        );
      } else {
        // Use successToast for a less intrusive success notification
        sweetAlert.success(
          `Berhasil memperbarui ${successful} permintaan`
        );
      }
  
      if (successful > 0) {
        // Refresh the data
        window.location.reload();
      }
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
              <MenuItem value="Approved by Head">Disetujui Kepala Unit</MenuItem>
              <MenuItem value="Rejected by Head">Ditolak Kepala Unit</MenuItem>
              <MenuItem value="pending">Menunggu Persetujuan</MenuItem>
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
                  {item.status.toLowerCase() === "pending" ? (
                    <Checkbox
                      checked={itemApprovals[item.request_id] || false}
                      onChange={(e) =>
                        handleApprovalChange(item.request_id, e.target.checked)
                      }
                    />
                  ) : item.status === "Approved by Head" ? (
                    "✓"
                  ) : (
                    "-"
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  {item.status === "pending" &&
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

export default RequestApprovDetail;
