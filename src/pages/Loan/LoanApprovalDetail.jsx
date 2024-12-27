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
    Alert,
    Snackbar,
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

const StyledTableCell = styled(TableCell)({
    padding: "12px",
    border: "1px solid #ddd",
    textAlign: "left",
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

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

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
            setSnackbar({
                open: true,
                message: 'Failed to fetch loan details',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    // Move filtering logic after null check
    const getFilteredRows = () => {
        if (!loanDetails?.items) return [];
        return loanDetails.items.filter(
            (item) =>
                (!searchTerm ||
                    (item.item_name &&
                        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
                (filterStatus === "Semua" || item.status === filterStatus)
        );
    };

    const getDisplayedRows = () => {
        const filteredRows = getFilteredRows();
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredRows.slice(startIndex, endIndex);
    };

    useEffect(() => {
        setPage(0); // Reset to the first page whenever the search term changes
    }, [searchTerm]);

    const filteredRows = getFilteredRows();
    const displayedRows = getDisplayedRows();

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

        const decisions = loanDetails.items.map(item => {
            const isApproved = itemApprovals[item.borrowing_id];
            const rejectionReason = rejectionReasons[item.borrowing_id]?.trim();

            console.log("Validating item:", {
                borrowing_id: item.borrowing_id,
                isApproved,
                rejectionReason
            });

            return isApproved || (!isApproved && rejectionReason);
        });

        const hasAnyDecision = decisions.some(decision => decision);
        console.log("Validation result:", {
            decisions,
            hasAnyDecision
        });

        if (!hasAnyDecision) {
            setSnackbar({
                open: true,
                message: 'Please make a decision (approve/reject) for at least one item',
                severity: 'error'
            });
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
            const itemsToProcess = loanDetails.items.filter(item => item.status === 'pending');

            for (const item of itemsToProcess) {
                const borrowing_id = item.borrowing_id;
                const isApproved = itemApprovals[borrowing_id];
                const rejectionReason = rejectionReasons[borrowing_id];

                const response = await fetch(`http://localhost:5000/peminjaman/${borrowing_id}/approval`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        // Jika tidak diapprove dan ada rejection reason, maka ini adalah rejection
                        status: isApproved ? 'approved' : 'rejected',
                        rejection_reason: !isApproved ? rejectionReason : null,
                    }),
                });

                // Log response untuk debugging
                const responseData = await response.json();
                console.log("Server response:", responseData);

                if (!response.ok) {
                    throw new Error(responseData.message || 'Failed to process approval');
                }
            }

            await fetchDetails();
            setSnackbar({
                open: true,
                message: 'Successfully updated loan approvals',
                severity: 'success'
            });

            setItemApprovals({});
            setRejectionReasons({});

        } catch (error) {
            console.error('Error:', error);
            setSnackbar({
                open: true,
                message: error.message || 'Failed to update loan approvals',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (!loanDetails) return <Alert severity="info">No loan details found</Alert>;

    return (
        <Box className="p-6">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                            <strong>Tanggal Pinjam:</strong> {new Date(loanDetails.borrow_date).toLocaleDateString()}
                        </Typography>
                        <Typography className="mb-2">
                            <strong>Tanggal Kembali:</strong> {loanDetails.return_date ? new Date(loanDetails.return_date).toLocaleDateString() : '-'}
                        </Typography>
                    </CardContent>

                    <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: 2 }}>
                        <FormControl variant="outlined" sx={{ marginRight: 2, minWidth: 120, width: '100%' }}>
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
                            sx={{ width: '100%', minWidth: 200 }}
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
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                >
                    Submit
                </Button>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
           
        </Box>
    );
};

export default LoanApprovalDetail;