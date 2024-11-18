import React from "react";
import { Card, CardContent, Typography, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";

function DashboardStaf() {
  const items = [
    { id: 1, count: 3, title: "Permintaan Barang" },
    { id: 2, count: 5, title: "Peminjaman Barang" },
    { id: 3, count: 54, title: "Daftar Barang" },
  ];

  const permintaanBarang = [
    { nama: "Degirol", total: 30, terakhir: "12-08-2024" },
    { nama: "Kotak Tisu", total: 50, terakhir: "22-10-2024" },
    { nama: "Blood Lancet", total: 27, terakhir: "27-09-2024" },
    { nama: "The Prendjak 25", total: 64, terakhir: "22-10-2024" },
  ];

  const peminjamanBarang = [
    { nama: "Infocus", total: 26, terakhir: "09-10-2024" },
    { nama: "Laptop", total: 50, terakhir: "28-09-2024" },
    { nama: "Bendera Poltek", total: 27, terakhir: "27-09-2024" },
    { nama: "P3K", total: 15, terakhir: "17-10-2024" },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Grid container spacing={2} justifyContent="center">
        {items.map((item) => (
          <Grid item xs={12} sm={4} key={item.id}>
            <Card style={{ backgroundColor: "#69D2FF" }}>
              <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box textAlign="center" flexGrow={1}>
                  <Typography variant="h5" style={{ fontWeight: "bold" }}>{item.count}</Typography>
                  <Typography>{item.title}</Typography>
                </Box>
                <DescriptionIcon style={{ fontSize: 70, marginRight: 16 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bagian Tabel */}
      <Grid container spacing={4} style={{ marginTop: 20 }}>
        <Grid item xs={12} sm={6}>
          <Card style={{ backgroundColor: "white" }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: 10 }}>
                Permintaan Barang Paling Banyak
              </Typography>
              <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold", color: "#808080" }}>Nama Barang</TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold", color: "#808080" }}>Total Permintaan</TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold", color: "#808080" }}>Terakhir Permintaan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permintaanBarang.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontWeight: "bold" }}>{row.nama}</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>{row.total}</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>{row.terakhir}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card style={{ backgroundColor: "white" }}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: 10 }}>
                Peminjaman Barang Paling Banyak
              </Typography>
              <TableContainer component={Paper} style={{ boxShadow: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ fontWeight: "bold", color: "#808080" }}>Nama Barang</TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold", color: "#808080" }}>Total Peminjaman</TableCell>
                      <TableCell align="center" style={{ fontWeight: "bold", color: "#808080" }}>Terakhir Peminjaman</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {peminjamanBarang.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell style={{ fontWeight: "bold" }}>{row.nama}</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>{row.total}</TableCell>
                        <TableCell align="center" style={{ fontWeight: "bold" }}>{row.terakhir}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}

export default DashboardStaf;
