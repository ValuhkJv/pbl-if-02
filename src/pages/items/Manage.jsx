import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
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
  Grid,
  Divider,
  InputAdornment,
  TablePagination,
  TableContainer,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  EditOutlined as EditIcon,
  DeleteForeverOutlined as DeleteForeverOutlinedIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { styled } from "@mui/system";
import Alert from "../../components/alert";

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
  fontWeight: 100,
  padding: "2px 4px",
  transition: "all 0.3s ease",
  fontSize: "8px",
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
  fontWeight: 100,
  padding: "4px 8px",
  borderRadius: "50%",
  transition: "all 0.3s ease",
  fontSize: "12px",
}));

function ManageInventory() {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);
  const [isEditing, setEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category_id: "",
    unit: "",
    stock: "",
  });

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  // Map category ID to URL
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
          Alert.success("Deleted!", "Item has been successfully deleted.");
        } else {
          Alert.error("Error", "Failed to delete the item.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Alert.error("Error", "Something went wrong.");
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
      .then((response) => {
        if (!response.ok) {
          // If the response is not OK, throw an error
          throw new Error("Data gagal disimpan. Periksa kembali input.");
        }
        return response.json();
      })
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
        Alert.success("Berhasil!", "Data barang berhasil disimpan.", "success");
      })
      .catch((error) => console.error("Error:", error));
    handleCloseModal(); // Tutup modal setelah submit
    Alert.error("Gagal!", "Kode barang atau Barang Sudah ada.", "error");
  };

  const categoryNames = {
    1: "Persediaan Barang Konsumsi",
    2: "Barang Rumah Tangga",
    3: "Barang Peminjaman",
  };

  // Filter data berdasarkan search term
  const filteredItems = items.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Get current page items
  const currentItems = filteredItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Grid container spacing={2}>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
          mt: 3,
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginBottom={3}
        >
          <Divider
            style={{
              width: "3%",
              backgroundColor: "black",
              height: "10%",
            }}
          />
          <Typography
            style={{
              margin: "0 10px",
              fontFamily: "Sansita",
              fontSize: "26px",
            }}
          >
            Manajemen Barang
          </Typography>
          <Divider
            style={{
              width: "3%",
              backgroundColor: "black",
              height: "10%",
            }}
          />
        </Box>
        <Box
          sx={{
            borderRadius: 1,
            mb: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: "250px",
                backgroundColor: "white",
                borderRadius: 1,
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                },
              }}
            />
          </Box>

          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            sx={{
              color: "white",
              "&:hover": {
                bgcolor: "#242D34",
                color: "white",
              },
              height: "40px",
            }}
            onClick={handleTambahData}
          >
            Tambah Data
          </Button>
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
          <Typography variant="h6" color="white">
            Manajemen {categoryNames[currentCategoryId]}
          </Typography>
        </div>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px", // Border-radius untuk tabel
            overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>No</StyledTableCell>
                <StyledTableCell>Kode Barang</StyledTableCell>
                <StyledTableCell>Nama Barang</StyledTableCell>
                <StyledTableCell>Kategori</StyledTableCell>
                <StyledTableCell>Satuan</StyledTableCell>
                <StyledTableCell>Stok</StyledTableCell>
                <StyledTableCell>Aksi</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.map((item, index) => (
                <StyledTableRow key={item.item_id || item.item_code}>
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell>{item.item_code}</StyledTableCell>
                  <StyledTableCell>{item.item_name}</StyledTableCell>
                  <StyledTableCell>
                    {categoryNames[item.category_id]}
                  </StyledTableCell>
                  <StyledTableCell>{item.unit}</StyledTableCell>
                  <StyledTableCell>{item.stock}</StyledTableCell>
                  <StyledTableCell>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Tooltip title="Edit" placement="top">
                        <DetailButton
                          sx={{
                            padding: "0",
                            borderRadius: "50%",
                            height: "35px",
                            width: "35px",
                            minWidth: "35px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => handleEditData(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </DetailButton>
                      </Tooltip>
                      <Tooltip title="Hapus" placement="top" key={item.item_id}>
                        <RemoveButton
                          sx={{
                            my: 1,
                            mx: 2,
                            padding: "0",
                            borderRadius: "50%",
                            height: "35px",
                            width: "35px",
                            minWidth: "35px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => {
                            setItemIdToDelete(item.item_id);
                            Alert.confirmDelete(() => handleDeleteData());
                          }}
                        >
                          <DeleteForeverOutlinedIcon />
                        </RemoveButton>
                      </Tooltip>
                    </div>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredItems.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </Paper>
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
            borderRadius: 3,
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
    </Grid>
  );
}

export default ManageInventory;
