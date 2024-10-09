import React, {useState} from 'react';
import { Button, TextField, Typography, Box, Container, Paper, Select, MenuItem, InputLabel, FormControl} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import polibatam from './polibatam.png';
import backgroundImage from './tekno.png';


function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [jenisUser, setJenisUSer] = useState(''); //state untuk menyimpan pilihan dropdown jenis user
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e. preventDefault();
    if (username === 'admin' && password === '123' && jenisUser === 'admin') {
        localStorage.setItem('username', username);
        navigate('/dashboard');
    } else {
        setError("Invalid username or password");
    }
};

return (
    <Container 
        component="main" 
        maxWidth="xs"
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            overflow: 'hidden',
        }}

    >

        <Paper elevation={3} sx={{ p: 4, mt: 8, bgcolor: 'white', zIndex: 1 }}>
            <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <img src={polibatam} alt="polibatam" style={{ width: '100px', height: '100px' }} />
            </Box>
            <Typography display="flex" justifyContent="center" component="h1" variant="h5" color='grey'>
                Sub Bagian Umum Polibatam
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>

                {/*dropdown jenis user */}
                <Box display="flex" justifyContent="center" sx={{ mb: 1 }}>
                    <FormControl fullWidth margin="normal" required sx={{ width: 200 }}>
                        <InputLabel id="jenis-user-label">Jenis User</InputLabel>
                        <Select
                            labelId="jenis-user-label"
                            id="jenis-user"
                            value={jenisUser}
                            label="Jenis User"
                            onChange={(e) => setJenisUSer(e.target.value)} 
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

                <TextField
                    variant="outlined"
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocusvalue={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <Typography color="error">{error}</Typography>}
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