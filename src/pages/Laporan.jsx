import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

const columns = [
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    const filteredData = report.filter((item) =>
      selectedCategory ? item.kategori === selectedCategory : true
    ); // Filter berdasarkan kategori

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

    const filteredData = report.filter((item) =>
      selectedCategory ? item.kategori === selectedCategory : true
    ); // Filter berdasarkan kategori

    worksheet.addRow(columns.map((col) => col.label)); // Header
    filteredData.forEach((row) =>
      worksheet.addRow(columns.map((col) => row[col.id]))
    );

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Laporan_Stok_Barang${
      selectedCategory ? `_${selectedCategory}` : ""
    }.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredReport = report.filter((item) =>
    selectedCategory ? item.kategori === selectedCategory : true
  );

  return (
    <Paper>
      <Typography variant="h4">Stock Barang</Typography>
      <Button onClick={exportToPDF} startIcon={<FileDownloadIcon />}>
        Export to PDF
      </Button>
      <Button onClick={exportToExcel} startIcon={<FileDownloadIcon />}>
        Export to Excel
      </Button>
      <FormControl style={{ marginBottom: 16, minWidth: 200 }}>
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
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredReport
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.kode}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={report.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
