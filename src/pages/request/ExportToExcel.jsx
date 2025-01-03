import React from "react";
import * as XLSX from "xlsx";
import { Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const ExportToExcel = ({ data }) => {
  const exportToExcel = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const header = [
      ["No.BO.25.2.1-V5 Borang Permintaan Barang"],
      [currentDate],
      [],
      ["No", "Nama", "Divisi", "Nama Barang", "Jumlah", "Alasan", "Tanggal Permintaan"]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(header);

     // Define a reusable border style
     const borderStyle = {
      style: 'thin',
      color: { auto: 1 }
    };

    const fullBorder = {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle
    };


   // Style for title cell
   worksheet["A1"] = {
    v: "No.BO.25.2.1-V5 Borang Permintaan Barang",
    s: {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center' }
    }
  };

  // Style for date cell
  worksheet["A2"] = {
    v: currentDate,
    s: {
      font: { bold: true },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  };

    // Add borders to the header row (A4:G4)
    const headerRange = XLSX.utils.decode_range('A4:G4');
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 3, c: C });
      if (!worksheet[address]) worksheet[address] = {};
      worksheet[address].s = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "CCCCCC" } },
        border: fullBorder,
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
      };
    }

    // Format the data with proper date formatting
    const formattedData = data.map((item, index) => [
      index + 1,
      item.full_name,
      item.division_name,
      item.item_name,
      item.quantity,
      item.reason,
      new Date(item.created_at).toLocaleDateString('id-ID'),
    ]);
    
    // Add the formatted data starting from row 5 (after the header)
    XLSX.utils.sheet_add_aoa(worksheet, formattedData, { origin: "A5" });

    // Add borders to all data cells
    const dataRange = XLSX.utils.decode_range('A5:G' + (4 + formattedData.length));
    for (let R = dataRange.s.r; R <= dataRange.e.r; ++R) {
      for (let C = dataRange.s.c; C <= dataRange.e.c; ++C) {
        const address = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[address]) worksheet[address] = {};
        worksheet[address].s = {
          border: fullBorder,
          alignment: { vertical: 'center', wrapText: true }
        };
      }
    }


    // Set column widths
    const columnWidths = [
      { wch: 5 },  // No
      { wch: 20 }, // Nama
      { wch: 15 }, // Divisi
      { wch: 25 }, // Nama Barang
      { wch: 10 }, // Jumlah
      { wch: 30 }, // Alasan
      { wch: 20 }  // Tanggal Permintaan
    ];
    worksheet['!cols'] = columnWidths;

    // Set row heights
    worksheet['!rows'] = [
      { hpt: 30 },  // Title row height
      { hpt: 25 },  // Date row height
      { hpt: 20 },  // Empty row height
      { hpt: 25 },  // Header row height
    ];

    
    // Merge cells for title
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }  // Merge A1:G1 for title
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Permintaan Barang");

    XLSX.writeFile(workbook, `permintaan_barang_${currentDate}.xlsx`);
  };

  return (
    <Button
      variant="contained"
      startIcon={<FileDownloadIcon />}
      onClick={exportToExcel}
      sx={{
        bgcolor: '#0C628B',
        '&:hover': { bgcolor: '#45a049' },
        height: '40px'
      }}
    >
      Export to Excel
    </Button>
  );
};

export default ExportToExcel;