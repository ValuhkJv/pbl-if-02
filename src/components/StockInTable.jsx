import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const StockInTable = ({ data, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>No</TableCell>
            <TableCell>Nama Barang</TableCell>
            <TableCell>Jumlah</TableCell>
            <TableCell>Catatan</TableCell>
            <TableCell>Diterima Oleh</TableCell>
            <TableCell>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.stock_in_id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.item_name}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.notes}</TableCell>
              <TableCell>{row.received_by_name}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => onEdit(row)}>
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => onDelete(row.stock_in_id)}
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockInTable;
