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
} from "@mui/material";

import {
  BorderColorOutlined as BorderColorOutlinedIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";

const columns = [
  { id: "no", label: "No", minWidth: 80 },
  {
    id: "kode",
    label: (
      <>
        Kode/No <br />
        Inventaris Barang
      </>
    ),
    minWidth: 100,
    align: "center",
    wrap: true,
  },
  {
    id: "nama",
    label: "Nama Barang",
    minWidth: 170,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "stock",
    label: "Stock",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "satuan",
    label: "Satuan",
    minWidth: 100,
    align: "center",
    format: (value) => value.toFixed(2),
  },
  {
    id: "kategori",
    label: "Kategori",
    minWidth: 100,
    align: "center",
    format: (value) => value.toFixed(2),
  },
  {
    id: "opsi",
    label: "Opsi",
    minWidth: 100,
    align: "center",
    format: (value) => value.toFixed(2),
  },
];

function createData(no, kode, nama, stock, satuan, kategori, opsi) {
  return { no, kode, nama, stock, satuan, kategori, opsi };
}

const initialRows = [
  createData(
    1,
    "001",
    "Desk Set Joyko",
    100,
    "Set",
    "Persediaan Barang Konsumsi"
  ),
  createData(2, "002", "Kotak Tisu", 200, "Pcs", "Barang Rumah Tangga"),
  createData(3, "003", "Bendera", 4, "Pcs", "Peminjaman"),
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
    <div>
      <h2>Barang</h2>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          mt: "10px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
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
        </div>
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
                        if (column.id === "opsi") {
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
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                margin: 0,
              },
          }}
        />
      </Paper>
    </div>
  );
}
