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
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import idLocale from "date-fns/locale/id";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ExcelJS from "exceljs";

const columns = [
  {
    id: "kode",
    label: "Kode Barang",
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
    id: "awal",
    label: "Stock Awal",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "masuk",
    label: "Barang masuk",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "keluar",
    label: "Barang Keluar",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
  {
    id: "akhir",
    label: "Stock Akhir",
    minWidth: 100,
    align: "center",
    format: (value) => value.toLocaleString("en-US"),
  },
];

function createData(kode, nama, awal, masuk, keluar, akhir) {
  return { kode, nama, awal, masuk, keluar, akhir };
}

const initialRows = [
  createData("'1010301001000057", "Gantungan ID Card", 0, 0, 0, 0),
  createData("'1010301001000058", "ID Card B2", 0, 0, 0, 0),
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows] = React.useState(initialRows);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [selectedMonth, setSelectedMonth] = React.useState("");

  const filteredRows = rows.filter((row) => {
    const rowDate = new Date(); // Anda bisa menambahkan logika untuk mendapatkan tanggal dari data Anda
    const rowMonth = rowDate.getMonth(); // Ganti dengan bulan dari data jika ada

    if (selectedMonth && rowMonth !== parseInt(selectedMonth)) return false;

    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = "Laporan Stok Barang";
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.width;
    const textWidth = doc.getTextWidth(title);
    const xPos = (pageWidth - textWidth) / 2;
    doc.text(title, xPos, 22);

    // Format periode
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const selectedMonthName =
      selectedMonth !== "" ? monthNames[selectedMonth] : "Semua";
    const year = selectedDate
      ? selectedDate.getFullYear()
      : new Date().getFullYear(); // Ambil tahun dari tanggal atau tahun saat ini
    const periodText = `Periode: ${selectedMonthName} ${year}`; // Hanya tampilkan tahun jika ada

    // Set ukuran font untuk periode lebih kecil
    doc.setFontSize(12); // Ukuran font untuk periode
    const periodTextWidth = doc.getTextWidth(periodText);
    const periodXPos = (pageWidth - periodTextWidth) / 2; // Menghitung posisi untuk periode
    doc.text(periodText, periodXPos, 30); // Menambahkan periode di PDF

    const tableColumns = columns.map((col) => col.label);
    const tableRows = rows.map((row) => columns.map((col) => row[col.id]));

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 40, // Menggeser posisi tabel
      styles: { fontSize: 10 },
      headStyles: { fillColor: [12, 98, 139] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 30 },
    });

    doc.setFontSize(10);
    doc.text(
      `Dibuat pada: ${new Date().toLocaleDateString()}`,
      14,
      doc.internal.pageSize.height - 10
    );

    doc.save("report.pdf");
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Stok Barang");

    // Format periode
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const selectedMonthName =
      selectedMonth !== "" ? monthNames[selectedMonth] : "Semua";
    const year = selectedDate
      ? selectedDate.getFullYear()
      : new Date().getFullYear(); // Ambil tahun dari tanggal atau tahun saat ini
    const periodText = `Periode: ${selectedMonthName} ${year}`;

    // Tambahkan judul dan periode
    worksheet.mergeCells("B1:G1");
    worksheet.mergeCells("B2:G2");
    const titleCell = worksheet.getCell("B1");
    const periodCell = worksheet.getCell("B2");
    titleCell.value = "LAPORAN STOK BARANG";
    periodCell.value = periodText;

    titleCell.font = { size: 16, bold: true };
    periodCell.font = { size: 12, bold: true };
    titleCell.alignment = periodCell.alignment = { horizontal: "center" };

    // Header tabel
    const headers = [
      "Kode Barang",
      "Nama Barang",
      "Stok Awal",
      "Barang Masuk",
      "Barang Keluar",
      "Stok Akhir",
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Data tabel
    rows.forEach((row) => {
      worksheet.addRow([
        row.kode,
        row.nama,
        row.awal,
        row.masuk,
        row.keluar,
        row.akhir,
      ]);
    });

    // Styling untuk seluruh data
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });

    // Atur lebar kolom
    worksheet.columns = [
      { width: 20 },
      { width: 30 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    // Generate dan unduh file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Laporan_Stok_Barang.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
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
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#0C628B",
          padding: "20px",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ fontWeight: "bold", color: "#fff" }}
        >
          Stock Barang
        </Typography>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start", // Align items to the left
            gap: "16px", // Adjust the space between elements
            backgroundColor: "#3691BE",
            padding: "20px",
            borderRadius: "12px",
            borderBottom: "4px solid #e0e0e0",
          }}
        >
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="month-label">Bulan</InputLabel>
            <Select
              labelId="month-label"
              id="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            >
              <MenuItem value={""}>Semua</MenuItem>
              <MenuItem value={0}>Januari</MenuItem>
              <MenuItem value={1}>Februari</MenuItem>
              <MenuItem value={2}>Maret</MenuItem>
              <MenuItem value={3}>April</MenuItem>
              <MenuItem value={4}>Mei</MenuItem>
              <MenuItem value={5}>Juni</MenuItem>
              <MenuItem value={6}>Juli</MenuItem>
              <MenuItem value={7}>Agustus</MenuItem>
              <MenuItem value={8}>September</MenuItem>
              <MenuItem value={9}>Oktober</MenuItem>
              <MenuItem value={10}>November</MenuItem>
              <MenuItem value={11}>Desember</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              locale={idLocale}
            >
              <DatePicker
                label="Tanggal"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      "& .MuiInputBase-root": {
                        backgroundColor: "#e3f2fd", // Latar belakang biru muda
                        color: "#0d47a1", // Teks biru tua
                        borderColor: "#1976D2", // Border biru sedang
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976D2", // Border biru sedang
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#0d47a1", // Border biru tua saat hover
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#0d47a1", // Border biru tua saat fokus
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportToPDF}
            sx={{
              padding: "8px",
              color: "#0C628B",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#242D34",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                color: "#fff",
              },
              textTransform: "none",
            }}
          >
            Export to PDF
          </Button>

          <Button
            startIcon={<FileDownloadIcon />}
            onClick={exportToExcel}
            sx={{
              padding: "8px",
              backgroundColor: "#242D34",
              borderColor: "#fff",
              color: "#fff",
              borderRadius: "8px",
              "&:hover": {
                color: "#0C628B",
                borderColor: "#0C628B",
                backgroundColor: "#fff",
              },
              textTransform: "none",
            }}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      <TableContainer sx={{ maxHeight: 440 }} id="table-to-export">
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
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.kode}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {value}
                      </TableCell>
                    );
                  })}
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
        sx={{
          borderTop: "1px solid #e0e0e0",
          "& .MuiTablePagination-toolbar": {
            padding: "16px",
          },
        }}
      />
    </Paper>
  );
}
