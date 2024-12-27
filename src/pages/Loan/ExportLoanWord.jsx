import React from 'react';
import { Button } from '@mui/material';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, BorderStyle, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

const ExportLoanWord = ({ loanData }) => {
  const generateWord = async () => {
    // Function to create table header cells
    const createHeaderCell = (text) => {
      return new TableCell({
        children: [new Paragraph({
          text,
          alignment: AlignmentType.CENTER
        })],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      });
    };

    // Function to create table data cells
    const createDataCell = (text) => {
      return new TableCell({
        children: [new Paragraph({
          text: text || '',
          alignment: AlignmentType.LEFT
        })],
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
      });
    };

    // Create header rows
    const headerRow1 = new TableRow({
      children: [
        createHeaderCell('No'),
        createHeaderCell('Nama Pengguna'),
        createHeaderCell('NIK/NIM'),
        createHeaderCell('Nama Barang'),
        createHeaderCell('No. Inventaris'),
        createHeaderCell('Keperluan'),
        createHeaderCell('Pengambilan'),
        createHeaderCell(''),
        createHeaderCell('Pengembalian'),
        createHeaderCell(''),
        createHeaderCell('Status Saat'),
        createHeaderCell(''),
      ],
    });

    const headerRow2 = new TableRow({
      children: [
        createHeaderCell(''),
        createHeaderCell(''),
        createHeaderCell(''),
        createHeaderCell(''),
        createHeaderCell(''),
        createHeaderCell(''),
        createHeaderCell('Tgl.'),
        createHeaderCell('Jam'),
        createHeaderCell('Tgl.'),
        createHeaderCell('Jam'),
        createHeaderCell('Ambil'),
        createHeaderCell('Kembali'),
    
      ],
    });

    // Create data rows
    const dataRows = loanData.map((loan, index) => {
      return new TableRow({
        children: [
          createDataCell((index + 1).toString()),
          createDataCell(loan.full_name),
          createDataCell(loan.nik),
          createDataCell(loan.item_name),
          createDataCell(loan.item_code),
          createDataCell(loan.reason),
          createDataCell(new Date(loan.borrow_date).toLocaleDateString()),
          createDataCell(new Date(loan.borrow_date).toLocaleTimeString()),
          createDataCell(new Date(loan.return_date).toLocaleDateString()),
          createDataCell(new Date(loan.return_date).toLocaleTimeString()),
          createDataCell(loan.initial_condition),
          createDataCell(loan.return_condition),
          createDataCell(''),
          createDataCell(''),
        ],
      });
    });

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              orientation: 'landscape',
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            text: 'No.BO.16.3.1-V0 Borang Penggunaan Barang',
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),
          // Date
          new Paragraph({
            text: new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 200,
            },
          }),
          // Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              headerRow1,
              headerRow2,
              ...dataRows,
            ],
          }),
        ],
      }],
    });

    // Generate and save document
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, 'Borang_Penggunaan_Barang.docx');
    });
  };

  return (
    <Button
      variant="contained"
      startIcon={<FileDownloadIcon />}
      onClick={generateWord}
      sx={{
        backgroundColor: '#0C628B',
        '&:hover': {
          backgroundColor: '#074963',
        },
        borderRadius: '8px',
        textTransform: 'none',
        ml: 2
      }}
    >
      Export Word
    </Button>
  );
};

export default ExportLoanWord;