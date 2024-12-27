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
} from "@mui/material";

const DetailPersetujuanAdmin = () => {
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
        `http://localhost:5000/requestsApprovalAdmin/details/${created_at}`,
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
      rejection_reason:
        approvalStatus === "Rejected by Staff SBUM" ? reason : null,
    };

    axios
      .put(
        `http://localhost:5000/requestsApprovalAdmin/${request_id}/admin-approval`,
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
    setStatus("Rejected by Staff SBUM");
    setactiveIndex(index);
  };

  return (
    <div>
      <h2>Detail Persetujuan</h2>
      {/* Tabel Detail Permintaan */}
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
                      handleApproval("Approved by Staff SBUM", item.request_id)
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
                {status === "Rejected by Staff SBUM" &&
                  activeIndex === index && (
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
                          handleApproval(
                            "Rejected by Staff SBUM",
                            item.request_id
                          )
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
    </div>
  );
};

export default DetailPersetujuanAdmin;
