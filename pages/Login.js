import { useDispatch, useSelector } from 'react-redux';
import { loadUserFromStorage } from '@/store/authSlice';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Button,
  formControlClasses
} from '@mui/material';
import Image from 'next/image';

const LoginPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const credentials = {
      email: e.target.email.value.trim(),
      password: e.target.password.value,
    };

    const result = await dispatch(loadUserFromStorage(credentials));
    form.reset();

    if (loadUserFromStorage.fulfilled.match(result)) {
      console.log('User role:', result.payload.user.role);
      router.push('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/whyairjaldi.jpg)',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />

      {/* Bird */}
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
          src="/images/bird.png"
          width={500}
          height={1000}
          alt="Bird"
        />
      </Box>

      {/* Login Form */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 200,
          color: '#fff',
          flexDirection: 'column',
          p: 4,
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: '#fff',
            fontWeight: 500,
            fontSize: '1.5rem',
            mt: 6,
            textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          Let’s Jaldify It — Manage Smarter, Not Harder!
        </Typography>

        <Box key={router.asPath}
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
            backgroundColor: 'background.paper',
          }}
        >
          <TextField
            name="email"
            type="email"
            label="Email"
            autoComplete='off'
            fullWidth
            required
          />

          <TextField
            name="password"
            type="password"
            label="Password"
            fullWidth
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ backgroundColor: '#0086c7' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {error && (
            <Typography
              variant="body2"
              color="error"
              textAlign="center"
            >
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;