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
} from "@mui/material";

import {
  BorderColorOutlined as BorderColorOutlinedIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";

const columns = [
  { id: "no", label: "No", minWidth: 80 },
  {
    id: "nama",
    label: "Nama",
    minWidth: 100,
    align: "center",
  },
  {
    id: "nik",
    label: "NIK/NIM",
    minWidth: 100,
    align: "center",
  },
  {
    id: "nama_barang",
    label: "Nama Barang",
    minWidth: 100,
    align: "center",
  },
  {
    id: "no_inventaris",
    label: "No Inventaris",
    minWidth: 100,
    align: "center",
  },
  {
    id: "jumlah",
    label: "Jumlah",
    minWidth: 100,
    align: "center",
  },
  {
    id: "keperluan",
    label: "Keperluan",
    minWidth: 100,
    align: "center",
  },
  {
    id: "tanggal_pinjam",
    label: "Tanggal Pinjam",
    minWidth: 100,
    align: "center",
  },
  {
    id: "tanggal_kembali",
    label: "Tanggal Kembali",
    minWidth: 100,
    align: "center",
  },
  {
    id: "status",
    label: "Status",
    minWidth: 100,
    align: "center",
  },
  {
    id: "aksi",
    label: "Aksi",
    minWidth: 120,
    align: "center",
  },
];

function createData(no,  nama, nik, nama_barang, no_inventaris, jumlah, keperluan, tanggal_pinjam, tanggal_kembali, status, aksi) {
  return { no, nama, nik, nama_barang, no_inventaris, jumlah, keperluan, tanggal_pinjam, tanggal_kembali, status, aksi };
}

const initialRows = [
  createData(
    1,
    "lala melala",
    "123456",
    "Desk Set Joyko",
    "g12",
    2,
    "Kegiatan kuliah",
    "10/09/2024",
    "17/09/2024",
    "Menunggu Persetujuan",
    null
  ),
  createData(2, "lili", "123457", "Kotak Tisu", "g13", 9, "Pelengkap", "10/09/2024", "16/09/2024", "Menunggu Persetujuan", null),
  createData(3, "lulu", "123458", "Bendera", "g14", 4, "Pelengkap", "10/09/2024", "15/09/2024", "Menunggu Persetujuan", null),
  createData(4, "lele", "123459", "HVS", "g15", 12, "Pelengkap", "11/10/2024", "20/10/2024", "Menunggu Persetujuan", null),

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
      <h2>Permintaan Barang</h2>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          mt: "10px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Grid
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "#0C628B",
            padding: "24px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Button
            startIcon={<AddCircleIcon />}
            sx={{
              padding: "8px",
              color: "#0C628B",
              borderColor: "#0C628B",
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#242D34",
                borderColor: "#fff",
                color: "#fff",
              },
            }}
            onClick={handleTambahBarang}
          >
            Tambah Barang
          </Button>
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
                              {/* Adjusted alignment of icons */}
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
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
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
          component="Grid"
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
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                margin: 0,
              },
          }}
        />
      </Paper>
    </Grid>
  );
}
