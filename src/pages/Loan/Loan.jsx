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
  Stack,
} from "@mui/material";
import { Add, Replay, ShoppingCart, Close } from "@mui/icons-material";
import { format } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import sweetAlert from "../../components/SweetAlert";


const Borrowing = () => {
  // State untuk form dan data
  const [noInventaris, setNoInventaris] = useState("");
  const [namaBarang, setNamaBarang] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [keterangan, setKeterangan] = useState("");
  const [tanggalPinjam, setTanggalPinjam] = useState(null);
  const [tanggalKembali, setTanggalKembali] = useState(null);
  const [jamPinjam, setJamPinjam] = useState(null);
  const [jamKembali, setJamKembali] = useState(null);

  // State untuk data user dan transaksi
  const [peminjam, setPeminjam] = useState("");
  const [nim_nik_nidn, setNimNikNidn] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const userId = localStorage.getItem("user_id");

  // State untuk daftar barang dan transaksi
  const [barangList, setBarangList] = useState([]);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // State untuk modal dan notifikasi
  const [openModal, setOpenModal] = useState(false);
  const [keteranganError, setKeteranganError] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [tanggal] = useState(format(new Date(), "yyyy-MM-dd"));
  const [jam, setJam] = useState(format(new Date(), "HH:mm:ss"));
  const handleCloseModal = () => setOpenModal(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Reset keterangan error when modal opens
  useEffect(() => {
    if (openModal) {
      setKeteranganError(false);
    }
  }, [openModal]);

  useEffect(() => {
    // Fetch barang dari kategori peminjaman dengan ID 3
    const fetchBarang = async () => {
      try {
        const response = await fetch("http://localhost:5000/items/category/3");
        if (!response.ok) throw new Error("Gagal mengambil data barang.");
        const data = await response.json();
        console.log("Data barang:", data); // Tambahkan log ini
        const availableBarang = data.filter((item) => item.stock > 0);
        setBarangList(availableBarang);
      } catch (error) {
        console.error(error.message);
        sweetAlert.error("Error", "Terjadi kesalahan saat mengambil data barang.");
      }
    };
    fetchBarang();
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("roles_id"); // Simpan role saat login
        const userId = localStorage.getItem("user_id");

        if (!token) {
          throw new Error("Token tidak tersedia");
        }

        const response = await fetch("http://localhost:5000/peminjaman", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error Response Text:", errorText);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          );
        }

        const data = await response.json();
        // Filter data based on role and deletion status
        const filteredData = data.filter((transaction) => {
          const isStaff = userRole === "1";
          const isOwner = transaction.borrower_id === parseInt(userId);

          // Staff can see all non-deleted items
          // Regular users see their own items, including soft-deleted ones
          return isStaff ? !transaction.is_deleted : isOwner;
        });

        setTransactions(filteredData);
        localStorage.setItem("transactions", JSON.stringify(filteredData));
      } catch (error) {
        console.error("DETAILED Fetch Transactions Error:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        sweetAlert.error("Error", `Gagal memuat data peminjaman: ${error.message}`);
      }
    };

    fetchTransactions();
  }, []); // Jalankan sekali saat komponen dimuat

  useEffect(() => {
    // Update jam secara real-time
    const interval = setInterval(() => {
      setJam(format(new Date(), "HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ambil data user saat komponen dimuat
  useEffect(() => {
    // Alternative approach using individual items:
    const fullName = localStorage.getItem("full_name");
    const nik = localStorage.getItem("nik");

    if (fullName && nik) {
      setPeminjam(fullName);
      setNimNikNidn(nik);
    } else {
      console.warn("User data incomplete in localStorage");
    }
  }, []);

  // Mengambil data dari localStorage dengan user-specific key
  useEffect(() => {
    const storedItems = localStorage.getItem(`cart_items_${userId}`);
    if (storedItems) {
      setItems(JSON.parse(storedItems));
    }
  }, [userId]);

  // Menyimpan data ke localStorage dengan user-specific key
  useEffect(() => {
    localStorage.setItem(`cart_items_${userId}`, JSON.stringify(items));
  }, [items, userId]);

  // Fungsi untuk menambah item ke daftar pinjaman
  const handleAddItem = () => {
    if (selectedBarang && jumlah > 0) {
      const newItem = {
        item_code: selectedBarang.item_code,
        item_name: selectedBarang.item_name,
        quantity: jumlah,
        userId: userId,
      };

      // Cek apakah item sudah ada di daftar
      const existingItemIndex = items.findIndex(
        (item) => item.item_code === newItem.item_code && item.userId === userId
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += jumlah;
        setItems(updatedItems);
      } else {
        setItems([...items, newItem]);
      }

      // Reset form
      setSelectedBarang(null);
      setNoInventaris("");
      setNamaBarang("");
      setJumlah(1);
    } else {
      sweetAlert.warning("Peringatan", "Pilih barang dan masukkan jumlah yang valid");

    }
  };

  // Fungsi untuk menghapus item dari keranjang
  const removeItemCart = (itemCode) => {
    setItems(
      items.filter(
        (item) => !(item.item_code === itemCode && item.userId === userId)
      )
    );
  };

  const validatePhoneNumber = (number) => {
    if (!number) {
      return "Nomor telepon harus diisi";
    }
    if (number.length < 8) {
      return "Nomor telepon minimal 8 angka";
    }
    if (number.length > 15) {
      return "Nomor telepon maksimal 15 angka";
    }
    return "";
  };

  // Fungsi untuk submit peminjaman
  const handleBorrowing = async () => {
    // Validasi input
    if (!keterangan.trim()) {
      setKeteranganError(true);
      return;
    }
   
    const phoneValidationError = validatePhoneNumber(phoneNumber);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      sweetAlert.warning(phoneValidationError);
      return;
    }

    if (!tanggalPinjam || !tanggalKembali || !jamPinjam || !jamKembali) {
      sweetAlert.warning("Tanggal dan jam harus diisi!");
      return;
    }

    // Gabungkan tanggal dan waktu
    const borrowDateTime = new Date(tanggalPinjam);
    borrowDateTime.setHours(jamPinjam.getHours(), jamPinjam.getMinutes(), 0, 0);

    const returnDateTime = new Date(tanggalKembali);
    returnDateTime.setHours(
      jamKembali.getHours(),
      jamKembali.getMinutes(),
      0,
      0
    );

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("user_id");

      // Create borrowing transactions
      const promises = items.map((item) => {
        const borrowingData = {
          item_code: item.item_code,
          borrower_id: parseInt(userId),
          quantity: item.quantity,
          borrow_date: borrowDateTime.toISOString(),
          return_date: returnDateTime.toISOString(),
          status: "pending",
          reason: keterangan,
          phone_number: phoneNumber,
          initial_condition: "baik", // Default initial condition
        };

        return fetch("http://localhost:5000/peminjaman", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(borrowingData),
        });
      });

      await Promise.all(promises);

      sweetAlert.success("Peminjaman berhasil diajukan");

      // Reset form
      resetFields();
    } catch (error) {
      console.error("Error in handleBorrowing:", error);
      sweetAlert.error("Error", `Terjadi kesalahan: ${error.message}`);
    }
  };

  const resetFields = () => {
    setItems([]);
    setKeterangan("");
    setTanggalPinjam(null);
    setTanggalKembali(null);
    setJamPinjam(null);
    setJamKembali(null);
    setPhoneNumber("");
    setSelectedBarang(null);
    setNoInventaris("");
    setNamaBarang("");
    setJumlah(1);
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
     sweetAlert.error("Gagal memperbarui peminjaman")
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      sweetAlert.error("Error", "ID peminjaman tidak valid");
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

      // Refresh data setelah delete berhasil
      await refreshTransactions();
      setTransactions((prevTransactions) =>
        prevTransactions.filter((t) => t.id !== id)
      );

    

      // Update local storage
      const updatedTransactions = transactions.filter((t) => t.id !== id);
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));

      // Refresh the transactions list to ensure sync with server
      await refreshTransactions();
    } catch (error) {
      console.error(error);
      sweetAlert.error("Error", error.message);
    }
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

  // Hitung tanggal H+2
  const calculateMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    return today; // Format YYYY-MM-DD
  };

  const isTimeInBusinessHours = (date) => {
    if (!date) return false;
    const hours = date.getHours();
    return hours >= 7 && hours <= 17;
  };

  const shouldDisableTime = (time, view) => {
    if (view === "hours") {
      const hours = time.getHours();
      return hours < 7 || hours > 17;
    }
    return false;
  };

  const renderDateFilterSection = () => (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems="flex-start"
      sx={{ mt: 2 }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <DatePicker
            label="Tanggal Pengambilan"
            sx={{ width: "100%" }}
            value={tanggalPinjam}
            onChange={(newValue) => {
              setTanggalPinjam(newValue);
              setTanggalKembali(null);
            }}
            minDate={calculateMinDate()}
            required
          />
          <TimePicker
            label="Jam Pengambilan"
            type="time"
            value={jamPinjam}
            onChange={(newValue) => {
              if (isTimeInBusinessHours(newValue)) {
                setJamPinjam(newValue);
              }
            }}
            shouldDisableTime={shouldDisableTime}
            minutesStep={30}
            ampm={false}
            sx={{ width: "100%" }}
            required
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <DatePicker
            label="Tanggal Pengembalian"
            sx={{ width: "100%" }}
            value={tanggalKembali}
            onChange={(newValue) => setTanggalKembali(newValue)}
            minDate={
              tanggalPinjam ? new Date(tanggalPinjam) : calculateMinDate()
            }
            required
          />
          <TimePicker
            label="Jam Pengembalian"
            type="time"
            value={jamKembali}
            onChange={(newValue) => {
              if (isTimeInBusinessHours(newValue)) {
                setJamKembali(newValue);
              }
            }}
            shouldDisableTime={shouldDisableTime}
            minutesStep={30}
            ampm={false}
            sx={{ width: "100%" }}
            required
          />
        </Box>
      </LocalizationProvider>
    </Stack>
  );

  return (
    <Grid>
      <Typography
        variant="h4"
        style={{ fontFamily: "Sansita" }}
        gutterBottom
        mb={5}
        mt={5}
      >
        Peminjaman Barang
      </Typography>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "0",
        }}
      >
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
          <Typography variant="h6" color="white" gutterBottom>
            Input Barang Peminjaman
          </Typography>
          <Divider />
        </div>

        <Box p={4}>
          <Box display="flex" gap={2} mb={3}>
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
              padding: "8px",
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
              options={barangList}
              getOptionLabel={(option) =>
                `${option.item_name} (${option.item_code})`
              }
              onChange={(e, newValue) => {
                setSelectedBarang(newValue);
                if (newValue) {
                  setNoInventaris(newValue.item_code);
                  setNamaBarang(newValue.item_name);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Cari Barang" />
              )}
              sx={{ width: "300px" }}
              ListboxProps={{
                style: {
                  maxHeight: '200px',
                  overflow: 'auto'
                }
              }}
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
                startIcon={<ShoppingCart />}
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
                startIcon={<Add />}
                onClick={() => setOpenModal(true)}
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
                {items
                  .filter((item) => item.userId === userId)
                  .map((item) => (
                    <TableRow key={item.borrowing_id}>
                      <TableCell>{item.item_code}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => removeItemCart(item.item_code)}
                        >
                          <Close />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      {/* Modal untuk konfirmasi peminjaman */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{
          "& .MuiDialog-paper": {
            width: "45%",
            height: "70%",
            maxWidth: "none",
          },
        }}
      >
        <DialogTitle>konfirmasi Peminjaman</DialogTitle>
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
            helperText={keteranganError ? "Keperluan harus diisi" : ""}
            sx={{ mt: "10px" }}
            required
          />
          <TextField
            fullWidth
            label="Nomor Telepon"
            type="number"
            value={phoneNumber}
            onChange={(e) => {
              const value = e.target.value;
              setPhoneNumber(value);
              setPhoneError(validatePhoneNumber(value));
            }}
            error={!!phoneError}
            helperText={phoneError}
            sx={{ mt: 2 }}
            required
            placeholder="Contoh: 081234567890"
            inputProps={{
              pattern: "[0-9]*",
              minLength: 8,
              maxLength: 15,
            }}
          />
          {renderDateFilterSection()}
          <DialogActions sx={{ mt: 2 }}>
            <Button
              onClick={() => setOpenModal(false)}
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
                if (keterangan.trim() && phoneNumber.trim()) {
                  handleBorrowing();
                  handleCloseModal();
                } else {
                  setKeteranganError(!keterangan.trim());
                  if (!phoneNumber.trim()) {
                    sweetAlert.warning("Nomor telepon harus diisi.");
                    return;
                  }
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
        </DialogContent>
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
    </Grid>
  );
};

export default Borrowing;