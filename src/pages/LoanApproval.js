import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { styled } from '@mui/system';

const StyledTabeCell = styled(TableCell) ({
    border: '1px solid black',
});

export default function LoanApproval () {

    // state untuk menyimpan status filter
    const [filterStatus, setFilterStatus] = useState("Semua");

    // data dummy
    const loanRequests = [
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
        },
        {
            id: 2,
            name: "budi",
            nik: "12345678",
            itemName: "laptop",
            inventoryNo: "09876",
            quantity: 1,
            purpose: "untuk kegiatan kuliah",
            borrowDate: "10/10/2024",
            returnDate: "10/18/2024",
            status: "Disetujui"
        }
    ];

    // handle perubahan dropdown
    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };

    return (
        <div>
            <h2>Persetujuan Peminjaman</h2>

            {/* droppdown untuk filter status */}
            <FormControl 
            variant="outlined" 
            sx={{ 
                minWidth: 200, 
                marginBottom: 2 
            }}>
                <InputLabel>Status</InputLabel>
                <Select 
                    value={filterStatus} 
                    onChange={handleFilterChange} 
                    label="Status">
                        <MenuItem value="Semua">Semua</MenuItem>
                        <MenuItem value="Disetujui">Disetujui</MenuItem>
                        <MenuItem value="MEnunggu persetujuan">Menunggu persetujuan</MenuItem>
                        <MenuItem value="Ditolak">Ditolak</MenuItem>
                </Select>
            </FormControl>

            {/* tabel data peminjaman */}
            <TableContainer component={Paper}>
                <Table 
                    aria-label="loan approbal table"
                    sx={{ 
                        borderCollapse: "collapse"
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>No</TableCell>
                            <TableCell>Nama</TableCell>
                            <TableCell>NIK</TableCell>
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
                        {loanRequests
                            .filter((request) => 
                                filterStatus === 'Semua' || request.status === filterStatus
                            )
                            .map((request, index) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{request.name}</TableCell>
                                        <TableCell>{request.nik}</TableCell>
                                        <TableCell>{request.itemName}</TableCell>
                                        <TableCell>{request.inventoryNo}</TableCell>
                                        <TableCell>{request.quantity}</TableCell>
                                        <TableCell>{request.purpose}</TableCell>
                                        <TableCell>{request.borrowDate}</TableCell>
                                        <TableCell>{request.returnDate}</TableCell>
                                        <TableCell>{request.status}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="primary">
                                                Approve
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}