import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Container,
  Box,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";

const DetailPersetujuanHead = () => {
  const { created_at } = useParams(); // request_id permintaan
  const [details, setDetails] = useState([]); // Data detail barang
  const [status, setStatus] = useState(""); // Status aksi
  const [reason, setReason] = useState(""); // Alasan jika ditolak
  const [activeIndex, setactiveIndex] = useState(null);
  const token = localStorage.getItem("token"); // Ambil token dari local storage

  useEffect(() => {
    console.log("Tanggal yang dikirim ke backend:", created_at);

    axios
      .get(
        `http://localhost:5000/requestsApprovHead/head-approval/details/${created_at}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
          },
        }
      )
      .then((res) => setDetails(res.data))
      .catch((err) => console.error(err));
  }, [created_at, token]);

  const handleApproval = (approvalStatus, request_id) => {
    const payload = {
      status: approvalStatus,
      rejection_reason: approvalStatus === "Rejected by Head" ? reason : null,
    };

    axios
      .put(
        `http://localhost:5000/requestsApprovHead/${request_id}/head-approval`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
          },
        }
      )
      .then(() => alert("Permintaan berhasil diperbarui."))
      .catch((err) => console.error(err));
  };

  const handleRejectButton = (index) => {
    setStatus("Rejected by Head");
    setactiveIndex(index);
  };

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
        <Typography variant="h4" gutterBottom>
          Detail Persetujuan
        </Typography>
        {/* Tabel Detail Permintaan */}
      </Box>
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
              <TableCell>No</TableCell>
              <TableCell>Nama Barang</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Alasan</TableCell>
              <TableCell>Divisi</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details.map((item, index) => (
              <TableRow key={item.request_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.user_division}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>
                  {/* Tombol Persetujuan */}
                  <div style={{ marginTop: "20px" }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() =>
                        handleApproval("Approved by Head", item.request_id)
                      }
                    >
                      Setujui
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      style={{ marginLeft: "10px" }}
                      onClick={() => handleRejectButton(index)}
                    >
                      Tolak
                    </Button>
                  </div>

                  {/* Input Alasan Penolakan */}
                  {status === "Rejected by Head" && activeIndex === index && (
                    <div style={{ marginTop: "20px" }}>
                      <TextField
                        fullWidth
                        label="Alasan Penolakan"
                        variant="outlined"
                        multiline
                        rows={3}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ marginTop: "10px" }}
                        onClick={() =>
                          handleApproval("Rejected by Head", item.request_id)
                        }
                      >
                        Kirim
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DetailPersetujuanHead;
