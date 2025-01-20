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
  Autocomplete
} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";
import { styled } from "@mui/system";
import { Search as SearchIcon } from "@mui/icons-material";
import { format } from "date-fns";

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

const months = [
  { label: "Januari", value: "0" },
  { label: "Februari", value: "1" },
  { label: "Maret", value: "2" },
  { label: "April", value: "3" },
  { label: "Mei", value: "4" },
  { label: "Juni", value: "5" },
  { label: "Juli", value: "6" },
  { label: "Agustus", value: "7" },
  { label: "September", value: "8" },
  { label: "Oktober", value: "9" },
  { label: "November", value: "10" },
  { label: "Desember", value: "11" }
];


export default function StockReport() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [report, setReport] = useState([]);
  const [categories, setCategories] = useState([]); // Semua kategori barang
  const [selectedCategory, setSelectedCategory] = useState(""); // Kategori terpilih
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const currentYear = new Date().getFullYear(); // Get current year

  const fetchReport = async () => {
    try {
      // Tambahkan parameter bulan ke URL jika bulan dipilih
      const url = selectedMonth !== ""
        ? `http://localhost:5000/report?month=${parseInt(selectedMonth) + 1}`
        : "http://localhost:5000/report";

      const response = await axios.get(url); // Endpoint backend yang benar

      if (response.data && Array.isArray(response.data.data)) {
        const formattedData = response.data.data.map((item) => ({
          kode: item.item_code, // Properti dari backend
          kategori: item.category_name,
          nama: item.item_name,
          awal: item.stock_awal,
          masuk: item.barang_masuk,
          keluar: item.barang_keluar,
          akhir: item.stock_akhir,
          bulan: item.created_at ? new Date(item.created_at).getMonth() : null,
          tanggal: item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : "-"
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

  useEffect(() => {
    fetchReport();
  }, [selectedMonth]);

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
      const matchesCategory = selectedCategory
        ? item.kategori.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        : true;
      const matchesMonth = selectedMonth !== ""
        ? item.bulan === parseInt(selectedMonth)
        : true;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" ||
        item.nama.toLowerCase().includes(searchLower) ||
        item.kode.toLowerCase().includes(searchLower);

      return matchesCategory && matchesMonth && matchesSearch;
    });
  };

  // Reset halaman ketika filter berubah
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCategory]);

  const getPeriodLabel = () => {
    if (selectedMonth !== "") {
      return `Periode: ${months[parseInt(selectedMonth)]} ${currentYear}`; // Use dynamic year
    }
    return "Periode: Semua Bulan";
  };

  // Dapatkan data yang sudah difilter
  const filteredRows = getFilteredRows();

  // Hitung pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredData = getFilteredRows();

    // Add title and period
    doc.setFontSize(16);
    doc.text("LAPORAN STOCK BARANG", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(getPeriodLabel(), 105, 25, { align: "center" });

    doc.autoTable({
      startY: 35,
      head: [columns.map((col) => col.label)],
      body: filteredData.map((row, index) => [
        index + 1,
        row.kode,
        row.nama,
        row.awal,
        row.masuk,
        row.keluar,
        row.akhir
      ]),
    });

    doc.save(`Laporan_Stok_Barang_${format(new Date(), "dd-MM-yyyy")}.pdf`);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Stok");

    // Add title and period
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = 'LAPORAN STOCK BARANG';
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { bold: true, size: 14 };

    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = getPeriodLabel();
    worksheet.getCell('A2').alignment = { horizontal: 'center' };
    worksheet.getCell('A2').font = { size: 12 };

    // Add headers
    const headerRow = worksheet.addRow(['No', 'Kode Barang', 'Nama Barang', 'Stock Awal', 'Stock Masuk', 'Stock Keluar', 'Stock Akhir']);

    // Style headers
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0C628B' }
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' }
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle'
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Add data
    const filteredData = getFilteredRows();
    filteredData.forEach((row, index) => {
      const dataRow = worksheet.addRow([
        index + 1,
        row.kode,
        row.nama,
        row.awal,
        row.masuk,
        row.keluar,
        row.akhir
      ]);

      // Style data cells
      dataRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Set column widths
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });
    worksheet.getColumn(3).width = 30; // Make the Name column wider

    // Style the title cells border
    worksheet.getCell('A1').border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    worksheet.getCell('G1').border = {
      top: { style: 'thin' },
      right: { style: 'thin' }
    };
    worksheet.getCell('A2').border = {
      left: { style: 'thin' },
      bottom: { style: 'thin' }
    };
    worksheet.getCell('G2').border = {
      right: { style: 'thin' },
      bottom: { style: 'thin' }
    };

    // Draw border for cells between A2 and G2
    for (let i = 2; i <= 6; i++) {
      worksheet.getCell(2, i).border = {
        bottom: { style: 'thin' }
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Stok_Barang_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
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
          LAPORAN STOCK BARANG
        </Typography>
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
      </Box>
      <Box sx={{ width: '100%', p: 2, mb: 2, display: "flex", justifyContent: "center" }}>
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
          <Autocomplete
            sx={{
              width: "250px",
              backgroundColor: "white",
              borderRadius: 1,
              "& .MuiOutlinedInput-root": {
                height: "40px",
              }
            }}
            options={months}
            getOptionLabel={(option) => option.label || ""}
            value={months.find(month => month.value === selectedMonth) || null}
            onChange={(event, newValue) => {
              setSelectedMonth(newValue ? newValue.value : "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Bulan"
                variant="outlined"
              />
            )}
            ListboxProps={{
              style: {
                maxHeight: '200px',
                overflow: 'auto',
              }
            }}
          />

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

          <Button
            onClick={exportToPDF}
            startIcon={<FileDownloadIcon />}
            sx={{
              backgroundColor: '#0C628B',
              color: 'white',
              '&:hover': {
                backgroundColor: '#3691BE',
              },
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2,
              width: "150px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
          >
            Export to PDF
          </Button>

          <Button
            onClick={exportToExcel}
            startIcon={<FileDownloadIcon />}
            sx={{
              backgroundColor: '#3691BE',
              color: 'white',
              '&:hover': {
                backgroundColor: '#0C628B',
              },
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2,
              width: "150px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
              },
            }}
          >
            Export to Excel
          </Button>

        </Stack>
      </Box>

      <Typography variant="h6" align="center" sx={{ mb: 2 }}>
        {getPeriodLabel()}
      </Typography>
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
