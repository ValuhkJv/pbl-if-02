import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Container,
  Box,
  TableContainer,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";

const RequestApprovalHead = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const division = localStorage.getItem("division_name"); // Divisi kepala unit

  useEffect(() => {
    axios
      .get(`http://localhost:5000/requestsApprovHead/head-approval/${division}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, [division]);

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
          Data Permintaan Barang
        </Typography>
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
              <TableCell>Nama</TableCell>
              <TableCell>Jumlah Permintaan</TableCell>
              <TableCell>Tanggal Permintaan</TableCell>
              <TableCell>Divisi</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((req, index) => (
              <TableRow key={req.user_id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{req.full_name}</TableCell>
                <TableCell>{req.total_requests}</TableCell>
                <TableCell>
                  {new Date(req.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell>{req.division_name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={() => {
                      navigate(
                        `/requestsApprovHead/head-approval/details/${new Date(
                          req.created_at
                        ).toLocaleDateString("en-CA")}`
                      );
                    }}
                  >
                    <InfoOutlinedIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RequestApprovalHead;
