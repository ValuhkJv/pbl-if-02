import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Tooltip,
  Dialog,
  DialogActions,
  DialogTitle,
  Snackbar,
  Alert,
  TablePagination,
  InputAdornment,
  Stack,
  Divider,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  InfoOutlined as InfoOutlinedIcon,
  DeleteForeverOutlined as DeleteForeverOutlinedIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

export default function LoanApproval() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loanApproval, setLoanApproval] = useState([]);
  const [requests, setRequests] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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

  const fetchLoanApproval = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/peminjaman?view=approval",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);

      // Transform the data to include items array
      const transformedData = data.map((loan) => ({
        ...loan,
        items: [
          {
            borrowing_id: loan.borrowing_ids[0], // Use the first borrowing ID
            status: loan.status,
            rejection_reason: loan.rejection_reason || "-",
          },
        ],
      }));

      setLoanApproval(Object.values(transformedData)); // Gunakan state yang sudah ada
    } catch (error) {
      console.error("Fetch error:", error);
      setSnackbar({
        open: true,
        message: `Error: ${error.message}`,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    fetchLoanApproval();
  }, []);

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Menggabungkan filter status dan pencarian dalam satu fungsi
  const getFilteredRows = () => {
    return loanApproval.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        Object.values(item)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "Semua" ||
        (filterStatus === "return" &&
          (item.status === "return" ||
            item.status.startsWith("return: terlambat"))) ||
        (filterStatus !== "return" && item.status === filterStatus);

      return matchesSearch && matchesStatus;
    });
  };

  // Gunakan fungsi filter gabungan untuk mendapatkan data yang akan ditampilkan
  const filteredRows = getFilteredRows();
  const displayedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setRequests(JSON.parse(storedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("request", JSON.stringify(requests));
  }, [requests]);

  // Modifikasi fungsi handleDelete
  const handleDelete = async (groupData) => {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("roles_id");

      // Ambil semua borrowing_id dari items dalam group
      const borrowingIds = groupData.items.map((item) => item.borrowing_id);
      const deletePromises = [];

      for (const id of borrowingIds) {
        // Check if item status is valid for deletion
        const itemToDelete = groupData.items.find(
          (item) => item.borrowing_id === id
        );

        // For staff (role 2), only allow deletion if status is 'rejected' or 'return'
        if (
          userRole === "2" &&
          !["rejected", "return"].includes(itemToDelete.status)
        ) {
          setSnackbar({
            open: true,
            message:
              "Staf hanya dapat menghapus peminjaman yang ditolak atau sudah dikembalikan",
            severity: "error",
          });
          return;
        }

        // Proceed with deletion
        deletePromises.push(
          fetch(`http://localhost:5000/peminjaman/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
        );
      }

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Update local state after successful deletion
      setLoanApproval((prevLoans) =>
        prevLoans.filter(
          (loan) => !borrowingIds.includes(loan.items[0].borrowing_id)
        )
      );

      setSnackbar({
        open: true,
        message: "Peminjaman berhasil dihapus",
        severity: "success",
      });

      // Refresh data to ensure sync with server
      fetchLoanApproval();
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: `Gagal menghapus peminjaman: ${error.message}`,
        severity: "error",
      });
    }
  };
  // Modifikasi fungsi handleOpenDeleteDialog
  const handleOpenDeleteDialog = (groupData) => {
    setItemToDelete(groupData);
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
    }
  };

  useEffect(() => {
    console.log("Current loanApproval state:", loanApproval);
    console.log("Current filteredRows:", filteredRows);
  }, [loanApproval, filteredRows]);

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
          PERSETUJUAN PEMINJAMAN
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
          <FormControl variant="outlined" sx={{
            width: "250px",
            backgroundColor: "white",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              height: "40px",
            },
          }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleFilterChange}
              label="Status"
            >
              <MenuItem value="Semua">Semua</MenuItem>
              <MenuItem value="approved">Disetujui</MenuItem>
              <MenuItem value="pending">Menunggu persetujuan</MenuItem>
              <MenuItem value="rejected">Ditolak</MenuItem>
              <MenuItem value="return">Dikembalikan</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Search di kanan */}
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
              <StyledTableCell>NIM/NIK</StyledTableCell>
              <StyledTableCell>Nomor Telepon</StyledTableCell>
              <StyledTableCell>Tanggal Pengambilan</StyledTableCell>
              <StyledTableCell>Tanggal Pengembalian</StyledTableCell>
              <StyledTableCell>Aksi</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedRows.map((loan, index) => (
              <StyledTableRow
                hover
                key={`${loan.borrower_id}_${loan.borrow_date}`}
              >
                <StyledTableCell>
                  {index + 1 + page * rowsPerPage}
                </StyledTableCell>
                <StyledTableCell>{loan.full_name}</StyledTableCell>
                <StyledTableCell>{loan.nik}</StyledTableCell>
                <StyledTableCell>{loan.phone_number}</StyledTableCell>
                <StyledTableCell>
                  {loan.borrow_date
                    ? new Date(loan.borrow_date).toLocaleString()
                    : "-"}
                </StyledTableCell>
                <StyledTableCell>
                  {loan.return_date
                    ? new Date(loan.return_date).toLocaleString()
                    : "-"}
                </StyledTableCell>

                <StyledTableCell>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Tooltip title="Detail" placement="top">
                      <DetailButton
                        variant="contained"
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
                        onClick={() => {
                          const date = new Date(loan.borrow_date);
                          const formattedDate =
                            date.getFullYear() +
                            "-" +
                            String(date.getMonth() + 1).padStart(2, "0") +
                            "-" +
                            String(date.getDate()).padStart(2, "0");
                          navigate(
                            `/loan-approval/detail/${formattedDate}?borrower_id=${loan.borrower_id}`
                          );
                        }}
                      >
                        <InfoOutlinedIcon />
                      </DetailButton>
                    </Tooltip>
                    {/* Only show delete button for return/rejected status */}
                    {(loan.status === "return" ||
                      loan.status === "rejected") && (
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
                            }}
                            onClick={() => handleOpenDeleteDialog(loan)}
                          >
                            <DeleteForeverOutlinedIcon />
                          </RemoveButton>
                        </Tooltip>
                      )}
                  </div>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

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
    </Box>
  );
}
