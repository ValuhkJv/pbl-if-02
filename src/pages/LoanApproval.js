import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  Typography,
  Modal,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import axios from "axios";
import {
  InfoOutlined as InfoOutlinedIcon,
  DeleteForeverOutlined as DeleteForeverOutlinedIcon,
  ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
  ThumbUpOffAltOutlined as ThumbUpOffAltOutlinedIcon,
} from "@mui/icons-material";

const StyledTableCell = styled(TableCell)({
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "left",
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

// Modal style
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

// Tombol Setujui (Hijau)
const ApproveButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#2e7d32", // Hijau gelap
  color: "white",
  "&:hover": {
    backgroundColor: "#1b5e20", // Hijau lebih gelap saat hover
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  textTransform: "none", // Mencegah uppercase otomatis
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
}));

// Tombol Tolak (Merah)
const RejectButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#d32f2f", // Merah
  color: "white",
  "&:hover": {
    backgroundColor: "#b71c1c", // Merah lebih gelap saat hover
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
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
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
}));

// Tombol Hapus (Oranye)
const RemoveButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ed6c02", // Oranye
  justifyContent: "center",
  color: "white",
  "&:hover": {
    backgroundColor: "#e65100", // Oranye lebih gelap saat hover
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  textTransform: "none",
  fontWeight: 600,
  padding: "8px 16px",
  borderRadius: "12px",
  transition: "all 0.3s ease",
}));

export default function LoanApproval() {
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loanApproval, setLoanApproval] = useState([]);
  const [alasanPenolakan, setAlasanPenolakan] = useState({});
  const [showRejectInput, setShowRejectInput] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [requests, setRequests] = useState([]);

  const fetchLoanApproval = async () => {
    try {
      const response = await axios.get("http://localhost:5000/peminjaman");
      const removedItems = JSON.parse(
        localStorage.getItem("removedLoanItems") || "[]"
      );

      const filteredData = response.data.filter(
        (item) => !removedItems.includes(item.id)
      );

      setLoanApproval(filteredData);
    } catch (error) {
      console.error("Error fetching loan data:", error);
      alert("Terjadi kesalahan saat mengambil data peminjaman.");
    }
  };

  useEffect(() => {
    fetchLoanApproval();
  }, []);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5000/peminjaman/persetujuan/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status_peminjaman: "Disetujui" }),
        }
      );

      if (!response.ok) throw new Error("Gagal menyetujui peminjaman.");
      alert("Peminjaman disetujui!");
      fetchLoanApproval();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyetujui peminjaman.");
    }
  };

  const handleReject = async (id) => {
    const alasan = alasanPenolakan[id];

    if (!alasan) {
      alert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/peminjaman/persetujuan/${id}`,
        {
          status_peminjaman: "Ditolak",
          alasan_penolakan: alasan,
        }
      );

      if (response.data) {
        alert("Penolakan berhasil disimpan.");
        setShowRejectInput(null); // Reset input visibility
        setAlasanPenolakan((prev) => ({
          ...prev,
          [id]: "", // Reset input value
        }));
        fetchLoanApproval();
      }
    } catch (error) {
      console.error("Error rejecting loan:", error);
      alert("Terjadi kesalahan saat menyimpan penolakan.");
    }
  };

  const handleReasonChange = (id, value) => {
    setAlasanPenolakan((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const formatTanggal = (dateString) => {
    const tanggal = new Date(dateString);
    return tanggal.toLocaleDateString("id-ID");
  };

  const handleRemoveRow = (id) => {
    // Ambil daftar item yang telah dihapus dari localStorage
    const removedItems = JSON.parse(
      localStorage.getItem("removedLoanItems") || "[]"
    );

    // Tambahkan item yang baru dihapus
    const updatedRemovedItems = [...removedItems, id];
    localStorage.setItem(
      "removedLoanItems",
      JSON.stringify(updatedRemovedItems)
    );

    // Filter dan perbarui state
    const updatedLoanApproval = loanApproval.filter(
      (request) => request.id !== id
    );
    setLoanApproval(updatedLoanApproval);
  };

  const handleCloseReasonInput = (id) => {
    setShowRejectInput(null);
    setAlasanPenolakan((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setRequests(JSON.parse(storedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("request", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    try {
      console.log("Opening modal with data:", selectedLoan);
      if (selectedLoan) {
        setOpenDetailModal(true);
      }
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  }, [selectedLoan]);

  // Handler untuk membuka modal detail
  const handleOpenDetail = (loan) => {
    console.log("Opening detail for loan:", loan); // Tambahkan log ini
    if (!loan) {
      console.error("No loan data provided");
      return;
    }
    setSelectedLoan(loan);
    setOpenDetailModal(true);
  };

  // Handler untuk menutup modal detail
  const handleCloseDetail = () => {
    setOpenDetailModal(false);
    setSelectedLoan(null);
  };

  useEffect(() => {
    console.log("Modal state:", openDetailModal);
    console.log("Selected loan:", selectedLoan);
  }, [openDetailModal, selectedLoan]);

  // Komponen Modal Detail
  const DetailModal = ({ open, onClose, loan }) => {
    if (!loan) return null;

    return (
      <Modal open={open} onClose={onClose} aria-labelledby="detail-modal-title">
        <Box sx={modalStyle}>
          <Typography
            id="detail-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Detail Peminjaman
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informasi Peminjam:
            </Typography>
            <Typography>Nama: {loan.peminjam}</Typography>
            <Typography>NIM/NIK/NIDN: {loan.nim_nik_nidn}</Typography>
            <Typography>Status: {loan.status_peminjaman}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Informasi Barang:
            </Typography>
            <Typography>Nama Barang: {loan.nama_barang}</Typography>
            <Typography>No Inventaris: {loan.no_inventaris}</Typography>
            <Typography>Jumlah: {loan.jumlah}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Kondisi Barang:
            </Typography>
            <Typography>
              Saat Dipinjam: {loan.kondisi_saat_ambil || "-"}
            </Typography>
            <Typography>
              Saat Dikembalikan: {loan.kondisi_saat_kembali || "-"}
            </Typography>
          </Box>

          {loan.bukti_pengembalian && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Bukti Pengembalian:
              </Typography>
              <img
                src={`http://localhost:5000/uploads/${loan.bukti_pengembalian}`}
                alt="Bukti Pengembalian"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          )}

          <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
            Tutup
          </Button>
        </Box>
      </Modal>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        marginTop: "15px",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        padding: "20px",
        backgroundColor: "white",
      }}
    >
      <h2>Persetujuan Peminjaman</h2>
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
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "#0C628B",
          padding: "25px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          borderBottom: "1px solid #e0e0e0",
        }}
      ></div>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px", // Border-radius untuk tabel
          overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
        }}
      >
        <Table aria-label="loan approval table">
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Nama</StyledTableCell>
              <StyledTableCell>NIM/NIK/NIDN</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>No Inventaris</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Keperluan</StyledTableCell>
              <StyledTableCell>Tanggal Pinjam</StyledTableCell>
              <StyledTableCell>Tanggal Kembali</StyledTableCell>
              <StyledTableCell>Alasan Penolakan</StyledTableCell>
              <StyledTableCell>Status</StyledTableCell>
              <StyledTableCell>Validasi</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(loanApproval.length > 0 ? loanApproval : [])
              .filter(
                (item) =>
                  filterStatus === "Semua" ||
                  item.status_peminjaman === filterStatus
              )
              .map((request, index) => (
                <StyledTableRow key={request.id}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{request.peminjam}</StyledTableCell>
                  <StyledTableCell>{request.nim_nik_nidn}</StyledTableCell>
                  <StyledTableCell>{request.nama_barang}</StyledTableCell>
                  <StyledTableCell>{request.no_inventaris}</StyledTableCell>
                  <StyledTableCell>{request.jumlah}</StyledTableCell>
                  <StyledTableCell>{request.keterangan}</StyledTableCell>
                  <StyledTableCell>
                    {formatTanggal(request.tanggal_pinjam)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {request.tanggal_kembali
                      ? formatTanggal(request.tanggal_kembali)
                      : ""}
                  </StyledTableCell>
                  <StyledTableCell>
                    {request.alasan_penolakan || "-"}
                  </StyledTableCell>

                  <StyledTableCell>{request.status_peminjaman}</StyledTableCell>
                  <StyledTableCell>
                    {(request.status_peminjaman === "Menunggu Persetujuan" ||
                      request.status_peminjaman === "Ditolak") && (
                      <ApproveButton
                        startIcon={<ThumbUpOffAltOutlinedIcon />}
                        variant="contained"
                        sx={{
                          my: 1,
                          mx: 1,
                          borderRadius: "8px",
                          height: "45px",
                        }}
                        onClick={() => handleApprove(request.id)}
                      >
                        Setujui
                      </ApproveButton>
                    )}

                    {(request.status_peminjaman === "Disetujui" || request.status_peminjaman === "Menunggu Persetujuan") && (
                      <RejectButton
                        variant="contained"
                        startIcon={<ThumbDownAltOutlinedIcon />}
                        sx={{
                          my: 1,
                          mx: 1,
                          padding: "8px 16 px",
                          borderRadius: "8px",
                          height: "45px",
                        }}
                        onClick={() => setShowRejectInput(request.id)}
                      >
                        Tolak
                      </RejectButton>
                    )}

                    {showRejectInput === request.id && (
                      <>
                        <TextField
                          placeholder="Alasan penolakan"
                          onChange={(e) =>
                            handleReasonChange(request.id, e.target.value)
                          }
                          value={alasanPenolakan[request.id] || ""}
                          sx={{ mt: 1, width: "100%" }}
                        />
                        <Button
                          variant="contained"
                          sx={{
                            mt: 1,
                            padding: "8px 16 px",
                            borderRadius: "8px",
                            height: "45px",
                          }}
                          onClick={() => handleReject(request.id)}
                        >
                          Kirim
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            mt: 1,
                            my: 1,
                            mx: 2,
                            padding: "8px 16 px",
                            borderRadius: "8px",
                            height: "45px",
                          }}
                          onClick={() => handleCloseReasonInput(request.id)}
                        >
                          Tutup
                        </Button>
                      </>
                    )}

                  </StyledTableCell>

                  <StyledTableCell>
                    <Tooltip title="Detail">
                      {" "}
                      <DetailButton
                        variant="contained"
                        startIcon={<InfoOutlinedIcon />}
                        sx={{
                          padding: "8px 16 px",
                          borderRadius: "8px",
                          height: "45px",
                        }}
                        onClick={() => {
                          console.log("DetailButton clicked!");
                          handleOpenDetail(request);
                        }}
                      ></DetailButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      {" "}
                      <RemoveButton
                        variant="contained"
                        startIcon={<DeleteForeverOutlinedIcon />}
                        sx={{
                          my: 1,
                          mx: 2,
                          padding: "8px 16 px",
                          borderRadius: "8px",
                          height: "45px",
                        }}
                        onClick={() => handleRemoveRow(request.id)}
                      ></RemoveButton>
                    </Tooltip>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Detail Modal */}
      <DetailModal
        open={openDetailModal}
        onClose={handleCloseDetail}
        loan={selectedLoan}
      />
    </div>
  );
}
