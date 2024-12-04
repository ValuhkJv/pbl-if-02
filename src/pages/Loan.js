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
} from "@mui/material";
import { Add, Replay, ShoppingCart, Close } from "@mui/icons-material";
import { format } from "date-fns";
import PengembalianModal from "./PengembalianModal";

const PeminjamanBarang = () => {
  const [noInventaris, setNoInventaris] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [nim_nik_nidn, setNIM_NIK_NIDN] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [noTransaksi, setNoTransaksi] = useState([]);
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [tanggal, setTanggal] = useState(format(new Date(), "dd MMM yyyy"));
  const [jam, setJam] = useState(format(new Date(), "HH:mm:ss"));
  const [openModal, setOpenModal] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [openPengembalianModal, setOpenPengembalianModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

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
      setNIM_NIK_NIDN(user.nim_nik_nidn || ""); // Pastikan nim_nik_nidn ada
    } else {
      console.warn("User  data tidak ditemukan di localStorage.");
    }
  }, []);

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
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
      setTransactions([...transactions, ...newTransaction]);
      resetFields();
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
      const response = await fetch("http://localhost:5000/peminjaman");
      if (!response.ok) throw new Error("Gagal mengambil data transaksi.");
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui transaksi.");
    }
  };

  const refreshTransactions = async () => {
    try {
      const response = await fetch("http://localhost:5000/peminjaman");
      if (!response.ok) throw new Error("Gagal mengambil data peminjaman");
      const data = await response.json();
      setTransactions(data);
      // Update localStorage jika diperlukan
      localStorage.setItem("transactions", JSON.stringify(data));
    } catch (error) {
      console.error("Error refreshing transactions:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/peminjaman/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus peminjaman");
      }

      alert(data.message);
      // Refresh data setelah penghapusan
      await refreshTransactions();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus peminjaman.");
    }
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:5000/peminjaman");
        if (!response.ok) throw new Error("Gagal mengambil data transaksi.");
        const data = await response.json();
        setTransactions(data);
        console.log("Data transaksi dari backend:", data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTransactions();
  }, []);

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
                  <TableRow key={transaction.no_transaksi}>
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
                     
                      <img
                        src={`http://localhost:5000/uploads/${transaction.bukti_pengembalian}`}
                        alt=""
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          marginTop: "5px",
                        }}
                        
                      />
                      {transaction.status_peminjaman === "Disetujui" && (
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
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Close />
                      </IconButton>
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
            width: "35%",
            height: "35%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>Keperluan Peminjaman</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="keperluan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            sx={{ mt: "10px" }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModal}
            color="secondary"
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
              handlePinjam(); // Simpan transaksi
              handleCloseModal();
            }}
            sx={{
              border: "2px solid #69D2FF",
              backgroundColor: "#69D2FF",
              color: "black",
              padding: "8px 16px",
            }}
          >
            Simpan Transaksi
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default PeminjamanBarang;
