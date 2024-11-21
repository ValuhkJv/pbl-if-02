import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  Modal,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import RequestItems from "./RequestItems"; // Import RequestItems di sini

const StyledTableCell = styled(TableCell)({
  border: "1px solid #ddd",
  padding: "8px",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
  },
}));

export default function Request() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // Menyimpan request yang dipilih
  const [formData, setFormData] = useState({
    user_id: "",
    request_date: "",
    purpose: "",
    requester_status: "Submitted",
    head_unit_status: "Pending",
    sbum_staff_status: "Pending",
  });

  // Handle perubahan dropdown
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch("http://localhost:5000/requests");
      const data = await response.json();
      console.log(data);
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
      } else {
        console.log("No requests found or data is empty");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setLoading(false);
    }
  };

  const handleTambahData = () => {
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      user_id: "",
      request_date: "",
      purpose: "",
      requester_status: "Submitted",
      head_unit_status: "Pending",
      sbum_staff_status: "Pending",
    });
  };

  const handleEdit = (request) => {
    setIsEditing(true);
    setFormData(request);
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/requests/${id}`, { method: "DELETE" });
      setRequests(requests.filter((req) => req.request_id !== id));
    } catch (error) {
      console.error("Error deleting request:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/requests/${formData.request_id}`
      : "http://localhost:5000/requests";
    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (isEditing) {
        setRequests(
          requests.map((req) =>
            req.request_id === formData.request_id ? formData : req
          )
        );
      } else {
        setRequests([...requests, result]);
      }
      // Setelah menyimpan request, tampilkan RequestItems dengan request_id yang baru
      setSelectedRequest(result); // Set request yang baru ditambahkan atau diedit
      handleCloseModal();
    } catch (error) {
      console.error("Error saving request:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  const formatTanggal = (dateString) => {
    const tanggal = new Date(dateString);
    return tanggal.toLocaleDateString("id-ID"); // Atau gunakan "en-GB" untuk format dd/mm/yyyy
  };

  return (
    <div
      style={{
        width: "100%",
        marginTop: "15px",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <h2>Permintaan Barang</h2>
      {/* Filter status */}
      <FormControl variant="outlined" sx={{ minWidth: 200, my: 2 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filterStatus}
          onChange={handleFilterChange}
          label="Status"
        >
          <MenuItem value="Semua">Semua</MenuItem>
          <MenuItem value="Disetujui">Disetujui</MenuItem>
          <MenuItem value="Menunggu persetujuan">Menunggu persetujuan</MenuItem>
          <MenuItem value="Ditolak">Ditolak</MenuItem>
        </Select>
      </FormControl>

      {/* Table of requests */}
      <TableContainer component={Paper}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          style={{ marginBottom: "20px"}}
          onClick={handleTambahData}
        >
          Tambah Request
        </Button>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>User ID</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Purpose</StyledTableCell>
              <StyledTableCell>Status Pengaju</StyledTableCell>
              <StyledTableCell>Status Kepala Unit</StyledTableCell>
              <StyledTableCell>Status Staff</StyledTableCell>
              <StyledTableCell>Actions</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {requests.map((request, index) => (
              <StyledTableRow key={request.request_id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{request.user_id}</StyledTableCell>
                <StyledTableCell>
                  {formatTanggal(request.request_date)}
                </StyledTableCell>
                <StyledTableCell>{request.purpose}</StyledTableCell>
                <StyledTableCell>{request.requester_status}</StyledTableCell>
                <StyledTableCell>{request.head_unit_status}</StyledTableCell>
                <StyledTableCell>{request.sbum_staff_status}</StyledTableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(request)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="secondary"
                    onClick={() => handleDelete(request.request_id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>

        {/* Modal for adding/editing request */}
        <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              {isEditing ? "Edit Request" : "Tambah Request"}
              <IconButton
                aria-label="close"
                onClick={handleCloseModal}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Form fields for request */}
              <TextField
                fullWidth
                margin="normal"
                id="user_id"
                label="User ID"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                type="date"
                id="request_date"
                name="request_date"
                value={formData.request_date}
                onChange={(e) =>
                  setFormData({ ...formData, request_date: e.target.value })
                }
              />
              <TextField
                fullWidth
                margin="normal"
                id="purpose"
                name="purpose"
                label="Purpose"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ marginTop: "10px" }}
              >
                {isEditing ? "Update" : "Simpan"}
              </Button>
            </form>
          </Box>
        </Modal>
      </TableContainer>

      {/* Jika ada request yang dipilih, tampilkan RequestItems */}
      {selectedRequest && (
        <RequestItems requestId={selectedRequest.request_id} />
      )}
    </div>
  );
}
