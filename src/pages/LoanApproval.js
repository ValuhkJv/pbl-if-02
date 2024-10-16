import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button
} from '@mui/material';
import { NightShelter } from '@mui/icons-material';

export default function LoanApproval () {
    const loanReaquest = [
        {
            id: 1,
            name: "lala",
            nik: "2343546",
            itemName: "infocus",
            inventoryNo: "234567",
            quantity: 2,
            purpose: "untuk kegiatan kuliah",
            borrowDate: "10/09/2024",
            returnDate: "10/15/2024",
            status: "Menunggu persetujuan"
        }
    ];

    return (
        <div>
            <h2>Persetujuan Peminjaman</h2>
            <TableContainer component={Paper}>
                <Table aria-label="loan approbal table">
                    <TableHead>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>NIK/NIM</TableCell>
                            <TableCell>Nama Barang</TableCell>
                            <TableCell>No Inventaris</TableCell>
                            <TableCell>Jumlah</TableCell>
                            <TableCell>Keperluan</TableCell>
                            <TableCell>Tanggal Pinjam</TableCell>
                            <TableCell>Tanggal Kembali</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Aksi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loanReaquest.map((request, index) => (
                            <TableRow key={request.id}>
                                
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}