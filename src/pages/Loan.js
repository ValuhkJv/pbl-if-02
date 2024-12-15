import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Grid,
  Divider,
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Replay, ShoppingCart, Close } from "@mui/icons-material";
import { format } from "date-fns";
import PengembalianModal from "./PengembalianModal";

const PeminjamanBarang = () => {
  const [noInventaris, setNoInventaris] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [nim_nik_nidn, setNimNikNidn] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [items, setItems] = useState([]);
  const [keteranganError, setKeteranganError] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [noTransaksi, setNoTransaksi] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [tanggal] = useState(format(new Date(), "dd MMM yyyy"));
  const [jam, setJam] = useState(format(new Date(), "HH:mm:ss"));
  const [openModal, setOpenModal] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [openPengembalianModal, setOpenPengembalianModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [tanggalAmbil, setTanggalAmbil] = useState(null);
  const [tanggalKembali, setTanggalKembali] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Reset keterangan error when modal opens
  useEffect(() => {
    if (openModal) {
      setKeteranganError(false);
    }
  }, [openModal]);

  useEffect(() => {
    // Fetch barang dengan stok tersedia dari backend
    const fetchBarang = async () => {
      try {
        const response = await fetch("http://localhost:5000/barang-peminjaman");
        if (!response.ok) throw new Error("Gagal mengambil data barang.");
        const data = await response.json();
        const availableBarang = data.filter((item) => item.stok > 0);
        setBarangList(availableBarang);
      } catch (error) {
        console.error(error.message);
        alert("Terjadi kesalahan saat mengambil data barang.");
      }
    };
    fetchBarang();
  }, []);

  useEffect(() => {
    // Generate nomor transaksi
    setNoTransaksi(`TRX-${format(new Date(), "yyyyMMddHHmmss")}`);
  }, []);

  useEffect(() => {
    // Update jam secara real-time
    const interval = setInterval(() => {
      setJam(format(new Date(), "HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ambil data user dari localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      console.log("Data User:", user);
      setPeminjam(user.nama || ""); // Pastikan nama ada
      setNimNikNidn(user.nim_nik_nidn || ""); // Pastikan nim_nik_nidn ada
    } else {
      console.warn("User  data tidak ditemukan di localStorage.");
    }
  }, []);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions);
      console.log("Stored Transactions:", parsedTransactions);
      setTransactions(parsedTransactions);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Mengambil data dari localStorage saat komponen dimuat
  useEffect(() => {
    const storedItems = localStorage.getItem("items");
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, []);

  // Menyimpan data ke localStorage setiap kali items diperbarui
  useEffect(() => {
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  const handleAddItem = () => {
    if (noInventaris && namaBarang && jumlah > 0) {
      setItems([...items, { noInventaris, namaBarang, jumlah }]);
      setNoInventaris("");
      setNamaBarang("");
      setJumlah(1);
    }
  };

  const handlePinjam = async () => {
    // Validasi keterangan
    if (!keterangan.trim()) {
      setKeteranganError(true);
      return;
    }

    // Validasi tanggal ambil
    if (
      !tanggalAmbil ||
      new Date(tanggalAmbil) <
        new Date(new Date().setDate(new Date().getDate() + 2))
    ) {
      alert("Peminjaman berhasil diajukan");
      return;
    }

    const newTransaction = items.map((item) => ({
      no_inventaris: item.noInventaris, // Sesuaikan dengan properti backend
      nama_barang: item.namaBarang,
      jumlah: item.jumlah,
      keterangan,
      status_peminjaman: "Menunggu Persetujuan",
      no_transaksi: noTransaksi,
      peminjam,
      nim_nik_nidn,
    }));

    try {
      // Kirim semua item secara parallel
      const promises = newTransaction.map((transaction) =>
        fetch("http://localhost:5000/peminjaman", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        })
      );

      await Promise.all(promises);
      alert("Peminjaman berhasil diajukan");
      await refreshTransactions();
      setTransactions([...transactions, ...newTransaction]);
      resetFields();
      setKeterangan(""); // Reset keterangan
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengajukan peminjaman.");
    }
  };

  const resetFields = () => {
    setNoInventaris("");
    setNamaBarang("");
    setJumlah(1);
    setItems([]);
    setSelectedBarang(null);
  };

  const handleOpenPengembalianModal = (transaction) => {
    setSelectedLoan(transaction);
    setOpenPengembalianModal(true);
  };

  const handleClosePengembalianModal = () => {
    setOpenPengembalianModal(false);
  };

  const handleUpdateTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/peminjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Gagal mengambil data peminjaman");
      const data = await response.json();
      setTransactions(data);
      localStorage.setItem("transactions", JSON.stringify(data));
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const refreshTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/peminjaman", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Gagal mengambil data peminjaman");

      const data = await response.json();

      // Filter hanya data yang belum dihapus
      const activeTransactions = data.filter((t) => !t.is_deleted);
      setTransactions(activeTransactions);
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      setSnackbar({
        open: true,
        message: "Gagal memperbarui data",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setSnackbar({
        open: true,
        message: "ID peminjaman tidak valid",
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/peminjaman/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus peminjaman");
      }

      const data = await response.json();

      // Refresh data setelah delete berhasil
      await refreshTransactions();

      console.log("Before delete:", transactions);
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t.id !== id)
      );
      console.log("After delete:", transactions);

      setSnackbar({
        open: true,
        message: data.message,
        severity: "success",
      });

      // Update local storage
      const updatedTransactions = transactions.filter((t) => t.id !== id);
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

      // Refresh the transactions list to ensure sync with server
      await refreshTransactions();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:5000/peminjaman", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Gagal mengambil data peminjaman");
        }

        const data = await response.json();

        // Filter hanya data yang belum dihapus
        const activeTransactions = data.filter((t) => !t.is_deleted);

        // Debug: Log fetched data
        console.log("Fetched Transactions:", data);
        setTransactions(activeTransactions);
        setTransactions(data);
        localStorage.setItem("transactions", JSON.stringify(data));
      } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Gagal memuat data peminjaman");
      }
    };

    fetchTransactions();
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Fungsi untuk membuka dialog konfirmasi hapus
  const handleOpenDeleteDialog = (id) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Fungsi untuk menutup dialog konfirmasi hapus
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Fungsi konfirmasi delete
  const confirmDelete = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete);
      handleCloseDeleteDialog();
      await refreshTransactions();
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/peminjaman/cancel/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal membatalkan peminjaman");
      }

      // Try to parse the response as JSON
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Response bukan dalam format JSON");
      }

      setSnackbar({
        open: true,
        message: data.message || "Peminjaman berhasil dibatalkan",
        severity: "success",
      });

      // Refresh transaksi setelah pembatalan
      await refreshTransactions();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message,
        severity: "error",
      });
    }
  };

    // Hitung tanggal H+2
    const calculateMinDate = () => {
      const today = new Date();
      today.setDate(today.getDate() + 2);
      return today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    };

  return (
    <Grid>
      <Typography variant="h4" gutterBottom mb={5} mt={5}>
        Peminjaman Barang
      </Typography>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            Input Barang Peminjaman
          </Typography>
          <Divider />
        </Box>

        <Box p={4}>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              label="No Transaksi Peminjaman"
              value={noTransaksi}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Tanggal"
              value={tanggal}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Jam"
              value={jam}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Nama Peminjam"
              value={peminjam}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="NIK/NIM/NIDN"
              value={nim_nik_nidn}
              InputProps={{ readOnly: true }}
            />
          </Box>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#0C628B",
              padding: "10px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <Typography variant="h6" gutterBottom color="white">
              Barang Peminjaman
            </Typography>
          </div>

          <Box display="flex" gap={2} mb={2} mt={3} mx={1}>
            {/* Input Fields dan Tombol */}
            <Autocomplete
              variant="outlined"
              placeholder="No inventaris..."
              options={barangList}
              getOptionLabel={(option) =>
                `${option.nama_barang} (${option.no_inventaris})`
              }
              onChange={(e, newValue) => {
                setSelectedBarang(newValue);
                if (newValue) {
                  setNoInventaris(newValue.no_inventaris);
                  setNamaBarang(newValue.nama_barang);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Cari Barang" />
              )}
              sx={{ width: "300px" }}
            />
            <TextField
              label="Nama Barang"
              value={namaBarang}
              InputProps={{ readOnly: true }}
              onChange={(e) => setNamaBarang(e.target.value)}
            />
            <TextField
              label="Jumlah"
              type="number"
              value={jumlah}
              inputProps={{ max: 3, min: 1 }}
              onChange={(e) => {
                const inputJumlah = Number(e.target.value);
                if (selectedBarang && inputJumlah > selectedBarang.stok) {
                  alert("Jumlah melebihi stok tersedia!");
                } else {
                  setJumlah(inputJumlah);
                }
              }}
            />
            <Box display="flex" gap={2} mb={2} mt={1}>
              <Button
                variant="contained"
                color="primary"
                disabled={items.length >= 3}
                startIcon={<Add />}
                onClick={handleAddItem}
              >
                Tambah
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<Replay />}
                onClick={resetFields}
              >
                Ulang
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#0C628B", color: "white" }}
                color="success"
                startIcon={<ShoppingCart />}
                onClick={handleOpenModal}
                disabled={items.length === 0}
              >
                Pinjam
              </Button>
            </Box>
          </Box>
          {/* Tabel untuk menampilkan barang yang akan dipinjam */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No Inventaris</TableCell>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>QTY</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.noInventaris}</TableCell>
                    <TableCell>{item.namaBarang}</TableCell>
                    <TableCell>{item.jumlah}</TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setItems(
                            items.filter(
                              (i) => i.noInventaris !== item.noInventaris
                            )
                          );
                        }}
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom color="black">
            Transaksi Peminjaman
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ mt: "30px" }}>
              <TableHead>
                <TableRow>
                  <TableCell>No Inventaris</TableCell>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>Jumlah</TableCell>
                  <TableCell>Keperluan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Alasan Penolakan</TableCell>
                  <TableCell>Kondisi Saat Pinjam</TableCell>
                  <TableCell>Kondisi Saat Kembali</TableCell>
                  <TableCell>Bukti Pengembalian</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.no_inventaris}</TableCell>
                    <TableCell>{transaction.nama_barang}</TableCell>
                    <TableCell>{transaction.jumlah}</TableCell>
                    <TableCell>{transaction.keterangan}</TableCell>
                    <TableCell>{transaction.status_peminjaman}</TableCell>
                    <TableCell>{transaction.alasan_penolakan || "-"}</TableCell>
                    <TableCell>
                      {transaction.kondisi_saat_ambil || "-"}
                    </TableCell>
                    <TableCell>
                      {transaction.kondisi_saat_kembali || "-"}
                    </TableCell>
                    <TableCell>
                      {transaction.bukti_pengembalian ? (
                        <img
                          src={`http://localhost:5000/uploads/${transaction.bukti_pengembalian}`}
                          alt="Bukti Pengembalian"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        ""
                      )}
                      {transaction.status_peminjaman === "Disetujui" &&
                        !transaction.bukti_pengembalian && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleOpenPengembalianModal(transaction)
                            }
                          >
                            Upload Pengembalian
                          </Button>
                        )}
                    </TableCell>

                    <TableCell>
                      {["Ditolak", "Kembali"].includes(
                        transaction.status_peminjaman
                      ) && (
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(transaction.id)}
                        >
                          <Close />
                        </IconButton>
                      )}
                      {transaction.status_peminjaman ===
                        "Menunggu Persetujuan" && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleCancel(transaction.id)}
                        >
                          Batalkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {/* Pengembalian Modal */}
              <PengembalianModal
                open={openPengembalianModal}
                onClose={handleClosePengembalianModal}
                loanData={selectedLoan}
                onUpdate={handleUpdateTransactions}
              />
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      {/* Modal untuk konfirmasi peminjaman */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          "& .MuiDialog-paper": {
            width: "45%",
            height: "45%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Peminjaman</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Keperluan"
            value={keterangan}
            onChange={(e) => {
              setKeterangan(e.target.value);
              setKeteranganError(false);
            }}
            error={keteranganError}
            helperText={
              keteranganError ? "Keperluan harus diisi minimal 1 kata" : ""
            }
            sx={{ mt: "10px", mb: 2 }}
            required
          />

          <TextField
            label="Tanggal Ambil"
            type="date"
            value={tanggalAmbil}
            onChange={(e) => {
              setTanggalAmbil(e.target.value);
              // Reset tanggal kembali jika tanggal ambil diubah
              setTanggalKembali("");
            }}
            inputProps={{
              min: calculateMinDate(), // Setel tanggal minimum
            }}
            margin="normal"
            required
            sx={{mr: 2}}
            error={
              tanggalAmbil &&
              new Date(tanggalAmbil) <
                new Date(new Date().setDate(new Date().getDate() + 1))
            }
            helperText={
              tanggalAmbil &&
              new Date(tanggalAmbil) <
                new Date(new Date().setDate(new Date().getDate() + 1))
                ? "Tanggal ambil minimal H+2"
                : ""
            }
          />
          <TextField
            label="Tanggal Kembali"
            type="date"
            margin="normal"
            value={tanggalKembali}
            onChange={(e) => setTanggalKembali(e.target.value)}
            inputProps={{
              min: calculateMinDate(), // Setel tanggal minimum
            }}
            required
          />
        </DialogContent>
        <DialogActions sx={{ mb: "20px", mx: 2 }}>
          <Button
            onClick={handleCloseModal}
            sx={{
              border: "2px solid ",
              borderColor: "black",
              color: "black", // Warna teks tombol
              borderRadius: "8px", // Border radius tombol
              padding: "8px 16px", // Padding tombol
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              if (keterangan.trim()) {
                handlePinjam();
                handleCloseModal();
              } else {
                setKeteranganError(true);
              }
            }}
            sx={{
              border: "2px solid #69D2FF",
              backgroundColor: "#69D2FF",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: "12px", padding: "8px" },
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"Apakah Anda yakin ingin menghapus?"}
        </DialogTitle>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              border: "2px solid ",
              borderColor: "black",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Batal
          </Button>
          <Button
            onClick={confirmDelete}
            sx={{
              border: "2px solid #69D2FF",
              backgroundColor: "#69D2FF",
              color: "black",
              padding: "8px 16px",
            }}
            autoFocus
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default PeminjamanBarang;
