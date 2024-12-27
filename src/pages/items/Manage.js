import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  Button,
  Modal,
  Box,
  TextField,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

function ManageInventory() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category_id: "",
    unit: "",
    stock: "",
  });

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const categoryMap = {
    1: "/manage/barangkonsumsi",
    2: "/manage/barangrt",
    3: "/manage/barangpeminjaman",
  };

  // Ambil categoryId berdasarkan pathname
  const currentCategoryId = Object.keys(categoryMap).find(
    (id) => categoryMap[id] === location.pathname
  );

  useEffect(() => {
    if (currentCategoryId) {
      // Memastikan currentCategoryId adalah angka
      const categoryId = parseInt(currentCategoryId, 10);

      if (!isNaN(categoryId)) {
        console.log("Fetching data for category ID:", categoryId);
        fetch(`http://localhost:5000/manage/${categoryId}`)
          .then((response) => response.json())
          .then((data) => {
            setItems(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
          });
      }
    }
  }, [currentCategoryId]); // Bergantung pada currentCategoryId

  if (loading) {
    return <CircularProgress />;
  }

  const handleTambahData = () => {
    setEditing(false);
    setFormData({
      item_code: "",
      item_name: "",
      category_id: currentCategoryId || "",
      unit: "",
      stock: "",
    });
    setOpenModal(true);
  };

  const handleEditData = (item) => {
    setEditing(true);
    setFormData(item);
    setOpenModal(true);
  };

  const handleDeleteData = () => {
    fetch(`http://localhost:5000/items/${itemIdToDelete}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          // Jika berhasil, hapus item dari state
          setItems((prevItems) =>
            prevItems.filter((item) => item.item_id !== itemIdToDelete)
          );
        }
        setOpenDeleteDialog(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormData({
      item_code: "",
      item_name: "",
      category_id: "",
      unit: "",
      stock: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing
      ? `http://localhost:5000/items/${formData.item_id}` // Ganti id dengan item_id
      : "http://localhost:5000/items";
    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (isEditing) {
          setItems(
            items.map((item) =>
              item.item_id === formData.item_id
                ? { ...item, ...formData }
                : item
            )
          );
        } else {
          setItems([...items, data]);
        }
        handleCloseModal();
      })
      .catch((error) => console.error("Error:", error));
  };

  const categoryNames = {
    1: "Persediaan Barang Konsumsi",
    2: "Barang Rumah Tangga",
    3: "Barang Peminjaman",
  };

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" gutterBottom>
        Manajemen Barang
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        style={{ marginBottom: "20px" }}
        onClick={handleTambahData}
      >
        Tambah Data
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Kode Barang</TableCell>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Kategori</TableCell>
            <TableCell>Satuan</TableCell>
            <TableCell>Stok</TableCell>
            <TableCell>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.item_id || item.item_code}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.item_code}</TableCell>
              <TableCell>{item.item_name}</TableCell>
              <TableCell>{categoryNames[item.category_id]}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => handleEditData(item)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => {
                    setItemIdToDelete(item.item_id);
                    setOpenDeleteDialog(true);
                  }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
                <Dialog
                  fullScreen={fullScreen}
                  open={openDeleteDialog}
                  onClose={() => setOpenDeleteDialog(false)}
                  aria-labelledby="responsive-dialog-title"
                >
                  <DialogTitle id="responsive-dialog-title">
                    Konfirmasi Penghapusan
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Apakah Anda yakin ingin menghapus barang ini? Tindakan ini
                      tidak dapat dibatalkan.
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      variant="outlined"
                      color="black"
                      onClick={() => setOpenDeleteDialog(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => handleDeleteData(itemIdToDelete)}
                    >
                      Hapus
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isEditing ? "Edit Data Barang" : "Tambah Data Barang"}
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 25,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              slotProps={{ input: { readOnly: isEditing } }}
              id="item_code"
              label="Kode Barang"
              name="item_code"
              value={formData.item_code}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="item_name"
              label="Nama Barang"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="category_id"
              label="Kategori"
              value={categoryNames[formData.category_id]}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="unit"
              label="Satuan"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="stock"
              label="Stok"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
            >
              Simpan
            </Button>
          </form>
        </Box>
      </Modal>
    </TableContainer>
  );
}

export default ManageInventory;
