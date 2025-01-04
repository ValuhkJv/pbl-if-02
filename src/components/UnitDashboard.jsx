import React from "react";
import { Box, Typography, Container, Divider } from "@mui/material";

// Komponen untuk Video YouTube
const YouTubeEmbed = ({ videoId, aspectRatio = "16:9" }) => {
    // Fungsi untuk menghitung padding bottom berdasarkan aspect ratio
    const calculatePaddingBottom = (ratio) => {
      const [width, height] = ratio.split(":").map(Number);
      return `${(height / width) * 100}%`;
    };
  return (
    <div
      style={{
        position: "relative",
        paddingBottom: calculatePaddingBottom(aspectRatio),
        height: 0,
        overflow: "hidden",
        marginTop: "10px",
        maxWidth: "100%", // Memastikan video tidak melebihi lebar container
      }}
    >
      <iframe
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
        src={`https://www.youtube.com/embed/${videoId}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
};

function Dashboard() {
  return (
    <Container maxWidth="lg" style={{ marginTop: 30 }}>
      {/* Header Dashboard */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginBottom={3}
      >
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
        <Typography
          style={{
            margin: "0 10px",
            fontFamily: "Sansita",
            fontSize: "26px",
          }}
        >
          Dashboard
        </Typography>
        <Divider
          style={{
            width: "3%",
            backgroundColor: "black",
            height: "10%",
          }}
        />
      </Box>

      {/* Panduan 1 */}
      <Box marginBottom={3}>
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{ fontWeight: "bold" }}
        >
         1. Panduan Peminjaman Barang
        </Typography>

        <YouTubeEmbed videoId="YRR3v6hFWAI" aspectRatio="16:9"/>
      </Box>

      {/* Panduan 2 */}
      <Box>
        <Typography
          variant="subtitle1"
          gutterBottom
          style={{ fontWeight: "bold" }}
        >
          2. Panduan Permintaan Barang
        </Typography>
       
        <YouTubeEmbed videoId="YRR3v6hFWAI" aspectRatio="16:9"/>
      </Box>
    </Container>
  );
}

export default Dashboard;
