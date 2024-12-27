import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequestApprovalAdmin = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const division = localStorage.getItem("division_name");

  const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
    wordWrap: "break-word",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/requestsApprovalAdmin/${division}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  }, [division]);

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Data Persetujuan Permintaan Barang
      </Typography>
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
          {requests.map((request, index) => (
            <TableRow key={request.user_id}>
              <StyledTableCell>{index + 1}</StyledTableCell>
              <StyledTableCell>{request.full_name}</StyledTableCell>
              <StyledTableCell>{request.total_requests}</StyledTableCell>
              <StyledTableCell>
                {new Date(request.created_at).toLocaleDateString()}
              </StyledTableCell>
              <StyledTableCell>{request.division_name}</StyledTableCell>
              <StyledTableCell>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate(
                      `/requestsApprovalAdmin/details/${new Date(
                        request.created_at
                      ).toLocaleDateString("en-CA")}`
                    );
                  }}
                >
                  Detail
                </Button>
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestApprovalAdmin;
