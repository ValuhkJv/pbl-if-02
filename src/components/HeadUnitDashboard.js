import React from "react";
import { Box, Typography, Container, Paper, Divider } from "@mui/material";

function Dashboard() {
  return (
    <Container maxWidth="sm" style={{ marginTop: 40 }}>
      {/* Header Dashboard */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom={3}
      >
        <Divider style={{ width: "20%", backgroundColor: "#b0bec5" }} />
        <Typography
          variant="h6"
          style={{ margin: "0 10px", color: "#607d8b", fontWeight: "bold" }}
        >
          Dashboard
        </Typography>
        <Divider style={{ width: "20%", backgroundColor: "#b0bec5" }} />
      </Box>

      {/* Panduan 1 */}
      <Box marginBottom={3}>
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{ fontWeight: "bold" }}
        >
          Panduan 1
        </Typography>
        <Paper
          style={{ height: 150, backgroundColor: "#e0e0e0" }}
          elevation={0}
        />
      </Box>

      {/* Panduan 2 */}
      <Box>
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{ fontWeight: "bold" }}
        >
          Panduan 2
        </Typography>
        <Paper
          style={{ height: 150, backgroundColor: "#e0e0e0" }}
          elevation={0}
        />
      </Box>
    </Container>
  );
}

export default Dashboard;
