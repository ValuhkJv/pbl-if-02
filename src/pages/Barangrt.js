import React, { useState, useEffect } from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  IconButton,
  Tooltip,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Divider,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import {
  BorderColorOutlined as BorderColorOutlinedIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

export default function BarangRTTable() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    kode_barang: "",
    nama_barang: "",
    stok: "",
    satuan: "",
  });

  const columns = [
    { id: "no", label: "No", minWidth: 80 },
    { id: "kode_barang", label: "Kode Barang", minWidth: 100, align: "center" },
    { id: "nama_barang", label: "Nama Barang", minWidth: 170, align: "center" },
    { id: "stok", label: "Stock", minWidth: 100, align: "center" },
    { id: "satuan", label: "Satuan", minWidth: 100, align: "center" },
    { id: "opsi", label: "Opsi", minWidth: 100, align: "center" },
  ];

  // Daftar satuan yang akan ditampilkan di dropdown
  const satuanOptions = [
    { value: "pcs", label: "Pieces" },
    { value: "pack", label: "Pack" },
    { value: "roll", label: "Roll" },
    { value: "rim", label: "Rim" },
    { value: "box", label: "Box" },
    { value: "pad", label: "Pad" },
    { value: "btl", label: "Botol" },
    { value: "bngks", label: "Bungkus" },
  ];

  const fetchData = () => {
    fetch("http://localhost:5000/barangrt")
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched data:", data); // Debugging
        setRows(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter rows based on search term
  const filteredRows = rows.filter(
    (row) =>
      row.nama_barang &&
      row.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setPage(0); // Reset to the first page whenever the search term changes
  }, [searchTerm]);

  const handleTambahBarang = () => {
    setFormData({
      id: "",
      kode_barang: "",
      nama_barang: "",
      stok: "",
      satuan: "",
    });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleEditBarang = (row) => {
    console.log("Editing row:", row); // Debugging
    setFormData(row);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleDeleteBarang = (id) => {
    fetch(`http://localhost:5000/barangrt/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          setRows(rows.filter((row) => row.id !== id));
        }
      })
      .catch((error) => console.error("Error deleting data:", error));
  };

  const handleSave = () => {
    const url = isEdit
      ? `http://localhost:5000/barangrt/${formData.id}`
      : "http://localhost:5000/barangrt";
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isEdit) {
          setRows(rows.map((row) => (row.id === data.id ? data : row)));
        } else {
          fetchData(); // Refresh data from server
        }
        setIsModalOpen(false);
      })
      .catch((error) => console.error("Error saving data:", error));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleOpenDeleteDialog = (id) => {
    setSelectedItemId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedItemId(null);
  };

  const confirmDelete = () => {
    if (selectedItemId) {
      handleDeleteBarang(selectedItemId);
      handleCloseDeleteDialog();
    }
  };

  return (
    <Grid>
      <Paper
        sx={{
          width: "100%",
          marginTop: "15px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          marginBottom={3}
        >
          <Divider
            sx={{ width: "3%", backgroundColor: "#0C628B", height: "2px" }}
          />
          <Typography
            variant="h4"
            sx={{ margin: "0 10px", fontFamily: "'Sansita', sans-serif" }}
          >
            Barang Rumah Tangga
          </Typography>
          <Divider
            sx={{ width: "3%", backgroundColor: "#0C628B", height: "2px" }}
          />
        </Box>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#0C628B",
            padding: "25px",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
            borderBottom: "1px solid #e0e0e0",
            justifyContent: "flex-end",
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ backgroundColor: "white", borderRadius: "12px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#0C628B" }} />
                </InputAdornment>
              ),
              style: { height: "45" }, // Set height for the input
            }}
            sx={{
              width: "250px",
              marginRight: "20px",
              "& .MuiOutlinedInput-root": {
                height: "45px", // Set height for the root of the input
              },
            }}
          />
          <Button
            startIcon={<AddCircleIcon />}
            sx={{
              padding: "8px 16 px",
              color: "#0C628B",
              borderColor: "#0C628B",
              backgroundColor: "#fff",
              borderRadius: "8px",
              height: "45px", // Set height for the button
              "&:hover": {
                backgroundColor: "#43C0FB",
                borderColor: "#fff",
                color: "#fff",
              },
            }}
            onClick={handleTambahBarang}
          >
            Tambah Barang
          </Button>
        </div>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ fontWeight: "bold" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                    <TableCell align="center">{row.kode_barang}</TableCell>
                    <TableCell align="center">{row.nama_barang}</TableCell>
                    <TableCell align="center">{row.stok}</TableCell>
                    <TableCell align="center">{row.satuan}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => handleEditBarang(row)}
                          style={{ color: "#0C628B" }}
                        >
                          <BorderColorOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleOpenDeleteDialog(row.id)}
                          style={{ color: "#0C628B" }}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: "12px", padding: "8px" }, // Atur border-radius sesuai kebutuhan
        }}
      >
        <DialogTitle id="alert-dialog-title">
          {"Apakah Anda yakin ingin menghapus?"}
        </DialogTitle>
        <DialogActions
          sx={{
            justifyContent: "center", // Tombol berada di tengah
            gap: 2, // Jarak antara tombol
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{
              border: "2px solid ",
              borderColor: "black",
              color: "black", // Warna teks tombol
              borderRadius: "8px", // Border radius tombol
              padding: "8px 16px", // Padding tombol
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

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        PaperProps={{
          sx: { borderRadius: "12px" }, // Atur border-radius sesuai kebutuhan
        }}
      >
        <DialogTitle>{isEdit ? "Edit Barang" : "Tambah Barang"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Kode Barang"
            fullWidth
            value={formData.kode_barang}
            onChange={(e) =>
              setFormData({ ...formData, kode_barang: e.target.value })
            }
            margin="dense"
            disabled={isEdit}
            required
          />
          <TextField
            label="Nama Barang"
            fullWidth
            value={formData.nama_barang}
            onChange={(e) =>
              setFormData({ ...formData, nama_barang: e.target.value })
            }
            margin="dense"
            required
          />
          <TextField
            label="Stock"
            fullWidth
            type="number"
            value={formData.stok}
            onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
            margin="dense"
            required
          />
          <FormControl margin="normal" required fullWidth>
            <InputLabel id="unit-label">Satuan</InputLabel>
            <Select
              label="Satuan"
              fullWidth
              value={formData.satuan}
              onChange={(e) =>
                setFormData({ ...formData, satuan: e.target.value })
              }
              margin="dense"
              required
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 150, // Maksimal tinggi dropdown
                    overflowY: "auto", // Scroll jika item terlalu banyak
                  },
                },
              }}
            >
              {satuanOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
