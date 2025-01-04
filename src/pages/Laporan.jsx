import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Divider,
  Stack,
  Paper,
  TextField,
  InputAdornment,

} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { styled } from "@mui/system";
import { Search as SearchIcon } from "@mui/icons-material";


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

const columns = [
  { id: "no", label: "No", minWidth: 50, align: "center" },
  { id: "kode", label: "Kode Barang", minWidth: 100, align: "center" },
  { id: "nama", label: "Nama Barang", minWidth: 170, align: "center" },
  { id: "awal", label: "Stock Awal", minWidth: 100, align: "center" },
  { id: "masuk", label: "Stock masuk", minWidth: 100, align: "center" },
  { id: "keluar", label: "Stock keluar", minWidth: 100, align: "center" },
  { id: "akhir", label: "Stock Akhir", minWidth: 100, align: "center" },
];

export default function StockReport() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [report, setReport] = useState([]);
  const [categories, setCategories] = useState([]); // Semua kategori barang
  const [selectedCategory, setSelectedCategory] = useState(""); // Kategori terpilih
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await axios.get("http://localhost:5000/report"); // Endpoint backend yang benar
      if (response.data && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item) => ({
          kode: item.item_code, // Properti dari backend
          kategori: item.category_name,
          nama: item.item_name,
          awal: item.stock_awal,
          masuk: item.barang_masuk,
          keluar: item.barang_keluar,
          akhir: item.stock_akhir,
        }));
        // Ekstrak kategori unik
        const uniqueCategories = [
          ...new Set(
            response.data.data
              .map((item) => item.category_name)
              .filter((category) => category) // Hanya ambil kategori yang tidak kosong
          ),
        ];

        setReport(formattedData);
        setCategories(uniqueCategories); // Simpan kategori
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching stock report:", error.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Fungsi filter yang dikombinasikan
  const getFilteredRows = () => {
    return report.filter((item) => {
      const matchesCategory = selectedCategory ? item.kategori === selectedCategory : true;
      const matchesSearch = !searchTerm
        ? true
        : Object.values(item)
          .some(value =>
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
      return matchesCategory && matchesSearch;
    });
  };

  // Reset halaman ketika filter berubah
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCategory]);

  // Dapatkan data yang sudah difilter
  const filteredRows = getFilteredRows();

  // Hitung pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredData = getFilteredRows();


    doc.autoTable({
      head: [columns.map((col) => col.label)],
      body: filteredData.map((row) => columns.map((col) => row[col.id])),
    });
    doc.save(
      `Laporan_Stok_Barang${selectedCategory ? `_${selectedCategory}` : ""}.pdf`
    );
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      `Laporan Stok ${selectedCategory || "Semua"}`
    );

    const filteredData = getFilteredRows();

    worksheet.addRow(columns.map((col) => col.label)); // Header
    filteredData.forEach((row) =>
      worksheet.addRow(columns.map((col) => row[col.id]))
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Stok_Barang${selectedCategory ? `_${selectedCategory}` : ""
      }.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };



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
          mb: 2,
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
          STOCK BARANG
        </Typography>
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
      </Box>
      <Box sx={{
        width: '100%', p: 2, mb: 2,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
      }}>
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
            <Button onClick={exportToPDF} startIcon={<FileDownloadIcon />}
              sx={{
                padding: "8px",
                color: "#fff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#0C628B",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#242D34",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: "#fff",
                },
                textTransform: "none",
              }}>
              Export to PDF
            </Button>
            <Button onClick={exportToExcel} startIcon={<FileDownloadIcon />}
              sx={{
                padding: "8px",
                color: "#fff",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#3691BE",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#242D34",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  color: "#fff",
                },
                textTransform: "none",
              }}>
              Export to Excel
            </Button>
            <FormControl sx={{
              width: "250px",
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={selectedCategory}

                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="">Semua Kategori</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      </Box>
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

      <TableContainer component={Paper}
        sx={{
          borderRadius: "12px",
          overflow: "hidden",
        }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell key={column.id} align={column.align}>
                  {column.label}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <StyledTableRow key={row.kode}>
                <StyledTableCell>{page * rowsPerPage + index + 1}</StyledTableCell>
                <StyledTableCell>{row.kode}</StyledTableCell>
                <StyledTableCell>{row.nama}</StyledTableCell>
                <StyledTableCell>{row.awal}</StyledTableCell>
                <StyledTableCell>{row.masuk}</StyledTableCell>
                <StyledTableCell>{row.keluar}</StyledTableCell>
                <StyledTableCell>{row.akhir}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

    </Box>
  );
}
