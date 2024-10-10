import React from 'react';
import { Button, TextField, Typography, Box, Container, Paper, Select, MenuItem, InputLabel, FormControl} from '@mui/material';
import polibatam from './polibatam.png';
import backgroundImage from './tekno.png';



function Login() {

    return (
        <Container 
            component="main" 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                width: '100vw',
                minHeight: '100vh',
                minWidth: '100vw',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                overflow: 'hidden',
                position: 'relative',
            }}

        >

            <Paper elevation={3} sx={{ p: 3, maxWidth: '400px', width: '100%', bgcolor: 'white', zIndex: 1, position: 'absolute' }}>
                <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                    <img src={polibatam} alt="polibatam" style={{ width: '80px', height: '80px' }} />
                </Box>
                <Typography display="flex" justifyContent="center" component="h1" variant="h5" color='grey'>
                    Sub Bagian Umum Polibatam
                </Typography>
                <Box component="form" sx={{ mt: 1 }}>

                    {/*dropdown jenis user */}
                    <Box display="flex" justifyContent="center" sx={{ mb: 1 }}>
                        <FormControl fullWidth margin="normal" required sx={{ width: 200 }}>
                            <InputLabel id="jenis-user-label">Jenis User</InputLabel>
                            <Select
                                labelId="jenis-user-label"
                                id="jenis-user"
                                label="Jenis User"
                                sx={{
                                    '& .MuiSelect-select': {
                                        padding: '7px', // atur padding dalam
                                        fontSize: '0.875rem', // atur warna teks dropdown
                                    },
                                }}
                            >
                                <MenuItem value="staf">Staf</MenuItem>
                                <MenuItem value="kepalaunit">Kepala Unit</MenuItem>
                                <MenuItem value="unit">Unit</MenuItem>
                                <MenuItem value="mahasiswa">Mahasiswa</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    
                    {/*field username & passwowrd */}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, backgroundColor: '#3691BE', '&:hover': { backgroundColor: '#2c7ba8', }  }}
                    >
                        Login
                    </Button>
                </Box>
            </Paper> 
        </Container>
    );
}
export default Login;