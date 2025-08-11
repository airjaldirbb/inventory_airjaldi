import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/authSlice';
import { useRouter } from 'next/router';
Image
import { Box, Card, Typography, CardContent, TextField, CardActions, Button } from '@mui/material';
import Image from 'next/image';
export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };
  useEffect(() => {
    if (user) {
      const role = user.role;

      if (role === 'admin') {
        alert('Admin login successful!');
        router.push('/dashboard');
      } else if (role === 'manager') {
        alert('Manager login successful!');
        // stay on page or navigate if needed
      } else if (role === 'staff') {
        alert('Staff login successful!');
        // stay on page or navigate if needed
      } else {
        alert('Unknown role');
      }
    }
  }, [user]);

  return (
    <div>
 
      <Box 
        sx={{
          position: 'relative',
          height: '100vh', // adjust as needed
          overflow: 'hidden'
        }}
      >
        {/* Background layer */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',

            backgroundImage: 'url(/images/whyairjaldi.jpg)',
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            position: 'absolute',
            filter: 'blur(1px)',
            right: 500,
            top: 40,
            transform: 'rotate(10deg)', // rotate diagonally
          }}
        >
          <Image
            src='/images/bird.png'
            width={500}
            height={1000}
            alt='Bird'
          />
        </Box>
        <Box
          sx={{
            position: 'relative',
            zIndex: 200,
            color: '#fff', flexDirection: 'column',
            p: 4, justifyContent: 'center', alignItems: 'center', textAlign: 'center', display: 'flex', minHeight: '100vh',
          }}
        >
          <Card sx={{ maxWidth: 600, p: 2, bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', boxShadow: 5, minHeight: 400 }}>

            <Box
              sx={{
                width: 200,
                height: 80,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)', // subtle shadow
                borderRadius: '8px', // rounded corners
                overflow: 'hidden', // ensures image follows the border radius
                display: 'inline-block',
              }}
            >
              <Image
                src='/images/airjaldi_logo.png'
                width={150}
                height={60}
                alt='AirJaldi Logo'
                style={{ objectFit: 'cover' }}
              />
            </Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: '#fff', fontWeight: 500, fontSize: '1.5rem', mt: 6, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', }}
            >
              Let’s Jaldify It — Manage Smarter, Not Harder!
            </Typography>
            <CardContent>
              <Box sx={{ maxWidth: 400, mx: 'auto', mt: 10, p: 3, boxShadow: 3 }}>
                <Typography variant="h5" mb={2}>Login</Typography>
                <TextField
                  fullWidth
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                />
              </Box>
            </CardContent>
            <CardActions sx={{ textAlign: 'center', justifyContent: 'center' }}>
              <Button variant='outlined' size="small" sx={{ color: '#fff' }} onClick={handleSubmit} >{loading ? 'Logging in...' : 'Login'}</Button>
              <Button variant='outlined' size="small" sx={{ color: '#fff' }}>Forgot Password</Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

    </div>


  );
}


