import { initializeApp } from 'firebase/app';
import { Box, Button, Container, Typography } from '@mui/material';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { firebaseConfig } from './config';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { UserDetails } from './types';

export function Login() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const fireBaseData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photo: result.user.photoURL,
        token: await result.user.getIdToken(),
      };
      //     navigate('/Home', { state: { fireBaseData } });

      saveUserIfNotExist(fireBaseData);
    } catch (error) {
      console.error('Login Error:', error);
    }
  };

  async function saveUserIfNotExist(fireBaseData: UserDetails) {
    const userDocRef = doc(db, 'users', fireBaseData.uid);
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      console.log('User already exists');
      navigate('/Home', { state: { fireBaseData } });
    } else {
      try {
        await setDoc(userDocRef, {
          uid: fireBaseData.uid,
          email: fireBaseData.email,
          displayName: fireBaseData.displayName,
          photo: fireBaseData.photo,
          token: fireBaseData.token,
        });
        navigate('/Home', { state: { fireBaseData } });
        console.log('New user added successfully');
      } catch (error) {
        console.error('Error adding user to Firestore:', error);
      }
    }
  }

  return (
    <>
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
    </>
  );
}
