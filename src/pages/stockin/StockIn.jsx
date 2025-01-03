import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Divider,
  Stack,
  InputAdornment,
  TablePagination,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import Alert from "../../components/alert";
import { styled } from "@mui/system";
import {
  Search as SearchIcon, Add as AddIcon, DeleteForeverOutlined as DeleteForeverOutlinedIcon,
} from "@mui/icons-material";

const StyledTableCell = styled(TableCell)({
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
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


const StockInPage = () => {
  const [formData, setFormData] = useState({
    category_id: "",
    item_id: "",
    quantity: "",
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [stockInData, setStockInData] = useState([]);
  const [open, setOpen] = useState(false); // State untuk mengontrol modal
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch stock-in data as a reusable function
  const fetchStockInData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/stock-in");
      setStockInData(response.data.data);
    } catch (error) {
      console.error("Error fetching stock-in data:", error);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/categories/stockin"
        );
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
      const fetchItems = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/items/stockin?category_id=${formData.category_id}`
          );
          setItems(response.data.data);
        } catch (error) {
          console.error("Error fetching items:", error);
        }
      };
      fetchItems();
    } else {
      setItems([]);
    }
  }, [formData.category_id]);

  // Fetch stock-in data initially
  useEffect(() => {
    fetchStockInData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/stock-in", formData);
      Alert.success("Berhasil!", "Stok barang berhasil ditambahkan.");
      setFormData({ category_id: "", item_id: "", quantity: "" });
      fetchStockInData(); // Refresh table after adding stock
      handleClose(); // Tutup modal setelah submit
    } catch (error) {
      console.error("Error adding stock-in:", error);
      alert("Gagal menambahkan stok barang.");
    }
  };

  const handleDelete = (stock_in_id) => {
    Alert.confirmDelete(async () => {
      try {
        await axios.delete(`http://localhost:5000/stock-in/${stock_in_id}`);
        Alert.success("Berhasil!", "Data barang masuk berhasil dihapus!");
        fetchStockInData(); // Refresh tabel setelah penghapusan
      } catch (error) {
        console.error("Error deleting stock-in data:", error);
        Alert.error("Gagal!", "Data barang masuk gagal dihapus.");
      }
    });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value, 5);
    setPage(0);
  };

  // Filter rows based on search term
  const filteredRows = stockInData.filter((item) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      (item.category_name && item.category_name.toLowerCase().includes(searchLower)) ||
      (item.item_name && item.item_name.toLowerCase().includes(searchLower)) ||
      (item.quantity && item.quantity.toString().includes(searchTerm)) ||
      (item.created_at && new Date(item.created_at).toLocaleDateString().toLowerCase().includes(searchLower))
    );
  });

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  return (
    <Box
      sx={{
        width: "100%",
        margin: "0 auto", // Pusatkan di layar
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        borderRadius: 2,
        px: 2,
        py: 4,
        bgcolor: "background.paper",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          mb: 4,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
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
          MANAJEMEN BARANG MASUK
        </Typography>
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{
          pb: 2,
        }}
      >
        {/* Filter di kiri */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}

          >
            <AddIcon />
            Tambah stock
          </Button>
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >

          <TextField
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
        </Stack>
      </Stack>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
      <div
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "#0C628B",
          padding: "25px",
          borderTopLeftRadius: "12px",
          borderTopRightRadius: "12px",
          borderBottom: "1px solid #e0e0e0",
        }}
      />

      {/* Tabel */}
      <TableContainer component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}>
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell>No</StyledTableCell>
              <StyledTableCell>Kategori Barang</StyledTableCell>
              <StyledTableCell>Nama Barang</StyledTableCell>
              <StyledTableCell>Jumlah</StyledTableCell>
              <StyledTableCell>Tanggal Masuk</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <StyledTableRow key={row.stock_in_id}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell>{row.category_name}</StyledTableCell>
                <StyledTableCell>{row.item_name}</StyledTableCell>
                <StyledTableCell>{row.quantity}</StyledTableCell>
                <StyledTableCell>
                  {new Date(row.created_at).toLocaleString()}
                </StyledTableCell>
                <StyledTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Tooltip title="Hapus" placement="top">
                      <RemoveButton
                        variant="contained"
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
                        }} onClick={() => handleDelete(row.stock_in_id)}
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
          rowsPerPageOptions={[5, 10, 25]} // rows per page options
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      {/* Modal Form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Barang Masuk</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Kategori Barang"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem
                      key={category.category_id}
                      value={category.category_id}
                    >
                      {category.category_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Nama Barang"
                  name="item_id"
                  value={formData.item_id}
                  onChange={handleChange}
                  required
                >
                  {items.map((item) => (
                    <MenuItem key={item.item_id} value={item.item_id}>
                      {item.item_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Jumlah Barang"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Batal
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Tambah Stok
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default StockInPage;
