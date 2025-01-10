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
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import sweetAlert from "../../components/SweetAlert";

const PengembalianModal = ({ open, onClose, loanData, onUpdate }) => {
  const [initialCondition, setInitialCondition] = useState("");
  const [returnCondition, setReturnCondition] = useState("");
  const [returnProof, setReturnProof] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open && loanData) {
      console.log("Modal opened with loanData:", loanData);
      // Periksa struktur data
      console.log("borrowing_id:", loanData.borrowing_id);
      setInitialCondition(loanData.initialCondition || "");
      setPreviewImage(null);
      setReturnProof(null);
    }
  }, [open, loanData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      // Check if loanData and borrowing_id exist
      if (!loanData || !loanData.borrowing_id) {
        throw new Error("Invalid loan data");
      }

      if (!token) {
        throw new Error("No authentication token found");
      }

      if (!loanData.borrowing_id) {
        throw new Error("ID peminjaman tidak valid");
      }

      if (!initialCondition || !returnCondition || !returnProof) {
        throw new Error("Semua field harus diisi");
      }

      const formData = new FormData();
      formData.append("initial_condition", initialCondition);
      formData.append("return_condition", returnCondition);
      formData.append("return_proof", returnProof);

      console.log("Submitting return with data:", {
        borrowing_id: loanData.borrowing_id,
        initialCondition,
        returnCondition,
        returnProof: returnProof.name,
      });

      const response = await axios.post(
        `http://localhost:5000/pengembalian/${loanData.borrowing_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle successful response
      if (response.status === 200 || response.status === 201) {
        onUpdate();
        onClose();
        sweetAlert.success("Berhasil", "Pengembalian berhasil disubmit");
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      sweetAlert.error(
        "Error",
        error.response?.data?.message || error.message
      );
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/jfif",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        sweetAlert.error("Error", "Hanya file gambar yang diizinkan");
        e.target.value = null;
        return;
      }

      if (file.size > maxSize) {
        sweetAlert.error("Error", "Ukuran file maksimal 5MB");
        e.target.value = null;
        return;
      }

      setReturnProof(file);
      // Create preview URL
      const previewURL = URL.createObjectURL(file);
      setPreviewImage(previewURL);
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
              value={initialCondition}
              onChange={(e) => setInitialCondition(e.target.value)}
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
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
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
        <DialogActions sx={{mr: 2}}>
          <Button
            onClick={onClose}
            sx={{
              border: "2px solid",
              borderColor: "black",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
            color="secondary"
          >
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            sx={{
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
            > Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PengembalianModal;
