import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    TextField,
    Button,
    Paper,
    CircularProgress,
    TablePagination,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
} from '@mui/material';
import { useParams, useSearchParams } from 'react-router-dom';
import {
    Search as SearchIcon,
} from "@mui/icons-material";
import { styled } from "@mui/system";
import sweetAlert from "../../components/SweetAlert";

const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "center",
});

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.selected,
    },
}));

const LoanApprovalDetail = () => {
    const { date } = useParams();
    const [searchParams] = useSearchParams();
    const borrower_id = searchParams.get('borrower_id');
    const [loanDetails, setLoanDetails] = useState(null);
    const [itemApprovals, setItemApprovals] = useState({});
    const [rejectionReasons, setRejectionReasons] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Semua");

    useEffect(() => {

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/peminjaman/detail/${date}?borrower_id=${borrower_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch details');

            const data = await response.json();
            if (data.length > 0) {
                const borrowerInfo = {
                    full_name: data[0].full_name,
                    nik: data[0].nik,
                    borrow_date: date,
                    return_date: date,
                    items: data.map(item => ({
                        borrowing_id: item.borrowing_id,
                        item_name: item.item_name,
                        item_code: item.item_code,
                        quantity: item.quantity,
                        reason: item.reason,
                        status: item.status,
                        rejection_reason: item.rejection_reason
                    }))
                };
                setLoanDetails(borrowerInfo);
            }
        } catch (error) {
            console.error('Error:', error);
            sweetAlert.error("Error", "Failed to fetch details");

        } finally {
            setLoading(false);
        }
    };

    fetchDetails();
}, [date, borrower_id]);

    const handleFilterChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const getFilteredRows = () => {
        if (!loanDetails?.items) {
            return [];
        }

        return loanDetails.items.filter((item) => {
            const matchesSearch =
                !searchTerm ||
                Object.values(item)
                    .join(" ")
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === "Semua" ||
                (filterStatus === "return" &&
                    (item.status === "return" ||
                        item.status.startsWith("return: terlambat"))) ||
                (filterStatus !== "return" && item.status === filterStatus);

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const statusPriority = {
                pending: 0,
                approved: 1,
                rejected: 2,
                return: 3
            };

            const aPriority = statusPriority[a.status] ?? 999;
            const bPriority = statusPriority[b.status] ?? 999;

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            return new Date(b.borrow_date) - new Date(a.borrow_date);
        });
    };

    // Gunakan fungsi filter gabungan untuk mendapatkan data yang akan ditampilkan
    const filteredRows = getFilteredRows();
    const displayedRows = filteredRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        setPage(0); // Reset to the first page whenever the search term changes
    }, [searchTerm]);

    const isItemPending = (status) => {
        return status.toLowerCase() === 'pending';
    };

    const handleApprovalChange = (borrowing_id, checked) => {
        console.log("Status diubah:", borrowing_id, checked);

        // Update approval state
        setItemApprovals(prev => {
            const newApprovals = {
                ...prev,
                [borrowing_id]: checked
            };
            console.log("New approval state:", newApprovals);
            return newApprovals;
        });

        // Handle rejection reason state
        setRejectionReasons(prev => {
            const newRejectionReasons = { ...prev };

            // Jika item diapprove (checked), hapus rejection reason
            if (checked) {
                delete newRejectionReasons[borrowing_id];
            } else {
                // Jika item ditolak (unchecked), inisialisasi rejection reason kosong
                // hanya jika belum ada
                if (!newRejectionReasons[borrowing_id]) {
                    newRejectionReasons[borrowing_id] = '';
                }
            }

            console.log("New rejection reasons:", newRejectionReasons);
            return newRejectionReasons;
        });

        // Log final state untuk debugging
        console.log("Final states after change:", {
            borrowing_id,
            isApproved: checked,
            currentApprovals: itemApprovals,
            currentRejectionReasons: rejectionReasons
        });
    };

    const validateSubmission = () => {
        console.log("Current state:", {
            itemApprovals,
            rejectionReasons
        });

        // Get only items that have been explicitly approved or rejected
        const decidedItems = loanDetails.items
            .filter(item => item.status === 'pending')
            .filter(item => {
                const isApproved = itemApprovals[item.borrowing_id];
                const hasRejectionReason = rejectionReasons[item.borrowing_id]?.trim();
                return isApproved !== undefined || hasRejectionReason;
            });

        // Check if any decisions have been made
        if (decidedItems.length === 0) {
            sweetAlert.warning("Warning", "Please make a decision for at least one item");
            return false;
        }

        // Validate rejection reasons for rejected items
        const invalidRejections = decidedItems.filter(item => {
            const isApproved = itemApprovals[item.borrowing_id];
            const rejectionReason = rejectionReasons[item.borrowing_id]?.trim();
            return isApproved === false && !rejectionReason;
        });

        if (invalidRejections.length > 0) {
            sweetAlert.error("Error", "Please provide rejection reasons for all rejected items")
            return false;
        }

        return true;
    };

    const handleRejectionReasonChange = (borrowing_id, reason) => {
        setRejectionReasons(prev => ({
            ...prev,
            [borrowing_id]: reason
        }));
    };

    const handleSubmit = async () => {
        if (!validateSubmission()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const pendingItems = loanDetails.items.filter(item => item.status === 'pending');
            const itemsToProcess = pendingItems.filter(item => {
                return itemApprovals[item.borrowing_id] !== undefined ||
                    rejectionReasons[item.borrowing_id]?.trim();
            });

            for (const item of itemsToProcess) {
                const borrowing_id = item.borrowing_id;
                const isApproved = itemApprovals[borrowing_id];
                const rejectionReason = rejectionReasons[borrowing_id];

                if (isApproved !== undefined || rejectionReason) {
                    const response = await fetch(`http://localhost:5000/peminjaman/${borrowing_id}/approval`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            status: isApproved ? 'approved' : 'rejected',
                            rejection_reason: !isApproved ? rejectionReason : null,
                        }),
                    });

                    const responseData = await response.json();
                    if (!response.ok) {
                        throw new Error(responseData.message || 'Failed to process approval');
                    }
                }
            }

            // Instead of calling fetchDetails directly, trigger the useEffect by updating date or borrower_id
            // This ensures we're using the same fetching logic
            setLoading(true); // Set loading before fetch
            const response = await fetch(
                `http://localhost:5000/peminjaman/detail/${date}?borrower_id=${borrower_id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch details');

            const data = await response.json();
            if (data.length > 0) {
                const borrowerInfo = {
                    full_name: data[0].full_name,
                    nik: data[0].nik,
                    borrow_date: date,
                    return_date: date,
                    items: data.map(item => ({
                        borrowing_id: item.borrowing_id,
                        item_name: item.item_name,
                        item_code: item.item_code,
                        quantity: item.quantity,
                        reason: item.reason,
                        status: item.status,
                        rejection_reason: item.rejection_reason
                    }))
                };
                setLoanDetails(borrowerInfo);
            }

            sweetAlert.success(
                `Berhasil memperbarui peminjaman`
            );

            // Clear only the processed decisions
            const newApprovals = { ...itemApprovals };
            const newRejections = { ...rejectionReasons };
            itemsToProcess.forEach(item => {
                delete newApprovals[item.borrowing_id];
                delete newRejections[item.borrowing_id];
            });
            setItemApprovals(newApprovals);
            setRejectionReasons(newRejections);

        } catch (error) {
            console.error('Error:', error);
            sweetAlert.error(
                "Gagal",
                "Gagal memperbarui peminjaman: " + (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box className="p-6">
            <Box
                sx={{
                    width: "100%",
                    margin: "0 auto", // Pusatkan di layar
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    borderRadius: 2,
                    px: 2,
                    py: 4,
                    bgcolor: "background.paper",
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, boxShadow: "inherit" }}>
                    <Card sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <CardContent>
                            <Typography variant="h5" className="mb-6">
                                Detail Peminjaman
                            </Typography>

                            <Typography className="mb-2">
                                <strong>Peminjaman:</strong> {loanDetails.full_name}
                            </Typography>
                            <Typography className="mb-2">
                                <strong>NIK/NIM:</strong> {loanDetails.nik}
                            </Typography>
                            <Typography className="mb-2">
                                <strong>Tanggal Pengambilan:</strong> {new Date(loanDetails.borrow_date).toLocaleDateString()}
                            </Typography>
                            <Typography className="mb-2">
                                <strong>Tanggal Pengembalian:</strong> {loanDetails.return_date ? new Date(loanDetails.return_date).toLocaleDateString() : '-'}
                            </Typography>
                        </CardContent>

                        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: 2, marginBottom: 8 }}>
                            <FormControl variant="outlined" sx={{
                                marginRight: 2, width: "250px",
                                backgroundColor: "white",
                                borderRadius: 1,
                                "& .MuiOutlinedInput-root": {
                                    height: "40px",
                                },
                            }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filterStatus}
                                    onChange={handleFilterChange}
                                    label="Status"
                                >
                                    <MenuItem value="Semua">Semua</MenuItem>
                                    <MenuItem value="approved">Disetujui</MenuItem>
                                    <MenuItem value="pending">Menunggu persetujuan</MenuItem>
                                    <MenuItem value="rejected">Ditolak</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                variant="outlined"
                                placeholder="Search..."
                                sx={{
                                    width: "250px",
                                    backgroundColor: "white",
                                    borderRadius: 1,
                                    "& .MuiOutlinedInput-root": {
                                        height: "40px",
                                    },
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}

                            />
                        </Box>
                    </Card>
                </Box>
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}
                />
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
                <TableContainer component={Paper} sx={{
                    borderRadius: "12px", // Border-radius untuk tabel
                    borderTopLeftRadius: 0, // Menghilangkan border-radius di sudut kiri atas
                    borderTopRightRadius: 0, // Menghilangkan border-radius di sudut kanan atas
                    overflow: "hidden", // Agar isi tabel tidak keluar dari border-radius
                }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>No</StyledTableCell>
                                <StyledTableCell>Nama Barang</StyledTableCell>
                                <StyledTableCell>Jumlah</StyledTableCell>
                                <StyledTableCell>No Inventaris</StyledTableCell>
                                <StyledTableCell>Keperluan</StyledTableCell>
                                <StyledTableCell>Status</StyledTableCell>
                                <StyledTableCell>Approve</StyledTableCell>
                                <StyledTableCell>Alasan Penolakan</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedRows.map((item, index) => (
                                <StyledTableRow key={item.item_code}>
                                    <StyledTableCell>
                                        {index + 1 + page * rowsPerPage}
                                    </StyledTableCell>
                                    <StyledTableCell>{item.item_name}</StyledTableCell>
                                    <StyledTableCell>{item.quantity}</StyledTableCell>
                                    <StyledTableCell>{item.item_code}</StyledTableCell>
                                    <StyledTableCell>{item.reason}</StyledTableCell>
                                    <StyledTableCell> {item.status.startsWith('return: terlambat') ? (
                                        <Typography color="error">
                                            {item.status}
                                        </Typography>
                                    ) : (
                                        item.status
                                    )}</StyledTableCell>
                                    <StyledTableCell>
                                        {isItemPending(item.status) ? (
                                            <Checkbox
                                                checked={itemApprovals[item.borrowing_id] || false}
                                                onChange={(e) => handleApprovalChange(item.borrowing_id, e.target.checked)}
                                            />
                                        ) : (
                                            item.status === 'approved' ? '✓' : '-'
                                        )}
                                    </StyledTableCell>
                                    <StyledTableCell>
                                        {isItemPending(item.status) && !itemApprovals[item.borrowing_id] ? (
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={rejectionReasons[item.borrowing_id] || ''}
                                                onChange={(e) => handleRejectionReasonChange(item.borrowing_id, e.target.value)}
                                                placeholder="Enter reason for rejection"
                                            />
                                        ) : (
                                            item.rejection_reason || '-'
                                        )}
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>

                <Box className="mt-8 flex justify-end">
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            mt: 2, backgroundColor: "#0C628B",
                            color: "white",
                        }}
                    >
                        Submit
                    </Button>
                </Box>
            </Box>


        </Box>
    );
};

export default LoanApprovalDetail;