import * as React from "react";
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
  Container,
  Box,
  Divider,
  Typography
} from "@mui/material";

import {
  BorderColorOutlined as BorderColorOutlinedIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";

const columns = [
  { id: "no", label: "No", minWidth: 80 },
  { id: "nama", label: "Nama", minWidth: 100, align: "center" },
  { id: "nik", label: "NIK/NIM", minWidth: 170, align: "center" },
  { id: "namaBarang", label: "Nama Barang", minWidth: 100, align: "center" },
  {
    id: "noInventaris",
    label: "No Inventaris",
    minWidth: 100,
    align: "center",
  },
  { id: "jumlah", label: "Jumlah", minWidth: 100, align: "center" },
  { id: "keperluan", label: "Keperluan", minWidth: 100, align: "center" },
  {
    id: "tanggalPinjam",
    label: "Tanggal Pinjam",
    minWidth: 100,
    align: "center",
  },
  {
    id: "tanggalKembali",
    label: "Tanggal Kembali",
    minWidth: 100,
    align: "center",
  },
  { id: "status", label: "Status", minWidth: 100, align: "center" },
  { id: "aksi", label: "Aksi", minWidth: 100, align: "center" },
];

function createData(
  no,
  nama,
  nik,
  namaBarang,
  noInventaris,
  jumlah,
  keperluan,
  tanggalPinjam,
  tanggalKembali,
  status
) {
  return {
    no,
    nama,
    nik,
    namaBarang,
    noInventaris,
    jumlah,
    keperluan,
    tanggalPinjam,
    tanggalKembali,
    status,
  };
}

const initialRows = [
  createData(
    1,
    "Salma",
    "1001",
    "Laptop",
    "INV-001",
    1,
    "Tugas Akhir",
    "2024-11-20",
    "2024-11-22",
    "Dipinjam"
  ),
  createData(
    2,
    "Andi",
    "1002",
    "Proyektor",
    "INV-002",
    2,
    "Presentasi",
    "2024-11-19",
    "2024-11-21",
    "Dikembalikan"
  ),
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState(initialRows);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleTambahBarang = () => {
    alert("Tambah Barang clicked");
  };

  return (
    <Grid>

      <Container maxWidth="sm" style={{ marginTop: 40 }}>
        <Box display="flex" alignItems="center" justifyContent="center" marginBottom={3}>
          <Divider style={{ width: "20%", backgroundColor: "#0C628B" }} />
          <Typography variant="h6" style={{ margin: "0 10px", color: "#000000", fontWeight: "bold", fontFamily: "Sansita", fontSize: "34px" }}>
            Peminjaman Barang
          </Typography>
          <Divider style={{ width: "20%", backgroundColor: "#0C628B" }} />
        </Box>
      </Container>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        marginBottom={2}
      >
        <Button
          startIcon={<AddCircleIcon />}
          sx={{
          padding: "8px",
          color: "#fff",
          backgroundColor: "#0C628B",
          borderColor: "#fff",
          borderRadius: "8px",
          "&:hover": {
            borderColor: "#0C628B",
            backgroundColor: "#3691BE ",
            color: "#0C628B",
              },
          }}
          onClick={handleTambahBarang}
          >
            Ajukan Peminjaman
          </Button>
      </Box>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          mt: "10px",
          borderRadius: "5px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Grid
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#0C628B",
            padding: "10px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          
        </Grid>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ color: "#333", fontWeight: "bold" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.no}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        if (column.id === "aksi") {
                          return (
                            <TableCell key={column.id} align="center">
                              <Tooltip title="Edit">
                                <IconButton style={{ color: "#0C628B" }}>
                                  <BorderColorOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton style={{ color: "#0C628B" }}>
                                  <DeleteOutlinedIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              padding: "16px",
            },
          }}
        />
      </Paper>
    </Grid>
  );
}
