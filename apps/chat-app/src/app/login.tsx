import { initializeApp } from 'firebase/app';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { firebaseConfig } from './config';

export function Login() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const fireBaseData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        token: await result.user.getIdToken(),
      };

      navigate('/Home', { state: { fireBaseData } });
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <Typography variant="h5">Login with Google</Typography>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ marginTop: 2 }}
        >
          Login with Google
        </Button>
      </Box>
    </Container>
  );
}
