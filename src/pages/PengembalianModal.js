import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";

const PengembalianModal = ({ open, onClose, loanData, onUpdate }) => {
  const [kondisiBarangSaatAmbil, setKondisiBarangSaatAmbil] = useState("");
  const [kondisiBarangSaatKembali, setKondisiBarangSaatKembali] = useState("");
  const [buktiPengembalian, setBuktiPengembalian] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open && loanData) {
      setKondisiBarangSaatAmbil(loanData.kondisi_barang || "");
      setPreviewImage(null);
      setBuktiPengembalian(null);
    }
  }, [open, loanData]);

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!kondisiBarangSaatAmbil || !kondisiBarangSaatKembali || !buktiPengembalian) {
        throw new Error('Semua field harus diisi');
      }
  
      const formData = new FormData();
      formData.append('kondisi_saat_ambil', kondisiBarangSaatAmbil);
      formData.append('kondisi_saat_kembali', kondisiBarangSaatKembali);
      formData.append('bukti_pengembalian', buktiPengembalian);
  
      // Debug log
      console.log('Sending data:', {
        kondisi_saat_ambil: kondisiBarangSaatAmbil,
        kondisi_saat_kembali: kondisiBarangSaatKembali
      });
  
      const response = await axios.post(`http://localhost:5000/pengembalian/${loanData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      console.log('Response:', response.data);
  
      if (response.data.message) {
        alert(response.data.message);
        onUpdate();
        onClose();
      }
  
    } catch (error) {
      console.error('Error submitting return:', error);
      setError(error.response?.data?.error || error.message);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg",  "image/jfif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setError("Hanya file gambar yang diizinkan");
        setOpenSnackbar(true);
        e.target.value = null;
        return;
      }

      if (file.size > maxSize) {
        setError("Ukuran file maksimal 5MB");
        setOpenSnackbar(true);
        e.target.value = null;
        return;
      }

      setBuktiPengembalian(file);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Pengembalian Barang</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="kondisi-barang-saat-ambil-label">
              Kondisi Barang Saat Ambil
            </InputLabel>
            <Select
              labelId="kondisi-barang-saat-ambil-label"
              value={kondisiBarangSaatAmbil}
              onChange={(e) => setKondisiBarangSaatAmbil(e.target.value)}
              required
            >
              <MenuItem value="Baik">Baik</MenuItem>
              <MenuItem value="Lecet">Lecet</MenuItem>
              <MenuItem value="Rusak">Rusak</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel id="kondisi-barang-saat-kembali-label">
              Kondisi Barang Saat Kembali
            </InputLabel>
            <Select
              labelId="kondisi-barang-saat-kembali-label"
              value={kondisiBarangSaatKembali}
              onChange={(e) => setKondisiBarangSaatKembali(e.target.value)}
              required
            >
              <MenuItem value="Baik">Baik</MenuItem>
              <MenuItem value="Lecet">Lecet</MenuItem>
              <MenuItem value="Rusak">Rusak</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="file"
            label="Upload Bukti Pengembalian"
            margin="normal"
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: "image/*" }}
            onChange={handleFileChange}
          />
          {previewImage && (
            <Box mt={2} textAlign="center">
              <Typography variant="subtitle1">
                Preview Bukti Pengembalian
              </Typography>
              <img
                src={previewImage}
                alt="Preview Bukti Pengembalian"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Batal
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PengembalianModal;
