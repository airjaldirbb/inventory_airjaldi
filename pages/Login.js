import { jwtDecode } from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/store/authSlice';
import { useRouter } from 'next/router';
import { Box, Card, Typography, CardContent, TextField, CardActions, Button, Alert } from '@mui/material';
import Image from 'next/image';

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    const credentials = {
      email: e.target.email.value,
      password: e.target.password.value,
    };
    const result = await dispatch(loginUser(credentials));
    if (loginUser.fulfilled.match(result)) {
      const token = result.payload.token;
      const decoded = jwtDecode(token);
      console.log('User role:', decoded.role);
      router.push('/dashboard');
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          height: '100vh', 
          overflow: 'hidden'
        }}
      >
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
            transform: 'rotate(10deg)',
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
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: '#fff', fontWeight: 500, fontSize: '1.5rem', mt: 6, textAlign: 'center', fontFamily: 'Montserrat, sans-serif', }}
          >
            Let’s Jaldify It — Manage Smarter, Not Harder!
          </Typography>
          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              width: '100%',
              maxWidth: 400,
              mx: 'auto',
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              boxShadow: 3,
              borderRadius: 2,
              backgroundColor: 'background.paper'
            }}
          >


            <TextField
              name="email"
              type="email"
              label="Email"
              fullWidth
              required
            />

            <TextField
              name="password"
              type="password"
              label="Password"
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading} sx={{ backgroundColor: '#0086c7' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            {error && (
              <Typography variant="body2" color="error" textAlign="center">
                {error}
              </Typography>
            )}
          </Box>
        </Box>

      </Box>



    </>

  );
};

export default LoginPage;
