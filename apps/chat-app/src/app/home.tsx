import { useLocation, useNavigate } from 'react-router-dom';
import { firebaseConfig } from './config';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Avatar,
  Button,
  Stack,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Messages, UserDetails2 } from './types';
import { useEffect, useRef, useState } from 'react';

export function Home() {
  const navigate = useNavigate();

  const location = useLocation();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [usersList, setUsersList] = useState<UserDetails2[]>([]);
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUser] = useState<string | null>(null);
  const [senderId, setSenderID] = useState<string | null>(null);
  const [messages, setMessages] = useState<Messages[]>([]); // State to store messages
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const senderDetails = {
    uid: location.state.fireBaseData.uid,
    email: location.state.fireBaseData.email,
    displayName: location.state.fireBaseData.displayName,
    photo: String(location.state.fireBaseData.photoURL),
    token: location.state.fireBaseData.token,
  };

  async function signOutUser() {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedUserId || !senderId) return;

    const chatId = [senderDetails.uid, selectedUserId].sort().join('_');

    const messagesRef = collection(db, 'messages', chatId, 'messages');

    const unsubscribe = onSnapshot(
      messagesRef,
      (querySnapshot) => {
        const messages: Messages[] = [];

        querySnapshot.forEach((doc) => {
          messages.push(doc.data() as Messages);
        });

        messages.sort((a, b) => {
          // Ensure both timestamps exist before calling `toDate()`
          if (!a.timestamp || !b.timestamp) return 0;

          return (
            a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
          );
        });

        setMessages(messages);
      },
      (error) => {
        console.error('Error listening to Firestore changes:', error);
      }
    );

    return () => unsubscribe();
  }, [selectedUserId, senderId]);

  useEffect(() => {
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(
      usersRef,
      (querySnapshot) => {
        const users: UserDetails2[] = [];

        querySnapshot.forEach((doc) => {
          users.push(doc.data() as UserDetails2);
        });

        setUsersList(users);
      },
      (error) => {
        console.error('Error listening to Firestore changes:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  function changeState(userId: any) {
    setSelectedUser(userId);
    setSenderID(senderDetails.uid);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }

  async function sendMessage(id: string) {
    const userDocRef = doc(db, 'users', id);
    const docs = await getDoc(userDocRef);
    const recepientData = docs.data();

    const receiver = recepientData?.uid;
    const sender = senderDetails.uid;

    const chatId = [sender, receiver].sort().join('_');

    const chatRef = doc(db, 'messages', chatId);

    const firstMessageObject = {
      email: senderDetails.email,
      displayName: senderDetails.displayName,
      photo: senderDetails.photo,
      token: senderDetails.token,
      text: message,
      timestamp: serverTimestamp(),
      uid: senderDetails.uid,
    };

    await addDoc(collection(chatRef, 'messages'), firstMessageObject);
    setMessage('');
  }

  return (
    <>
      <h1>
        Welcome to chat app {senderDetails.email}
        <Button
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
          }}
          variant="outlined"
          color="error"
          onClick={signOutUser}
        >
          Sign out
        </Button>
      </h1>
      <Box
        sx={{
          display: 'flex',
          height: '500px',
        }}
      >
        <Box
          sx={{
            width: '25%',
            borderRight: '1px solid #ccc',
            padding: 2,
            overflowY: 'auto',
          }}
        >
          <h2>Users List</h2>
          {usersList.length > 0 ? (
            usersList.map((user) => (
              <div
                style={{ cursor: 'pointer', marginBottom: '10px' }}
                onClick={() => changeState(user.uid)}
                key={user.uid}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={user.photo} />
                  <p>{user.displayName}</p>
                </Stack>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </Box>
        {/* right component */}

        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 2,
            borderRadius: 2,
          }}
        >
          {selectedUserId ? (
            <>
              <h2>Chat with {selectedUserId}</h2>
              <Box
                sx={{
                  overflowY: 'auto',
                  flexGrow: 1,
                  marginBottom: 2,
                  display: 'flex',
                  flexDirection: 'column', // Ensure messages are stacked top to bottom
                }}
              >
                {messages.length > 0 ? (
                  [...messages].map((message, index) => (
                    <Stack
                      key={`${message.uid}_${index}`}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        justifyContent:
                          message.uid === senderDetails.uid
                            ? 'flex-end'
                            : 'flex-start',
                        textAlign:
                          message.uid === senderDetails.uid ? 'right' : 'left',
                      }}
                    >
                      {message.uid !== senderDetails.uid && (
                        <Avatar src={message.photo} />
                      )}
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor:
                            message.uid === senderDetails.uid
                              ? 'primary.main'
                              : 'grey.300',
                          color:
                            message.uid === senderDetails.uid
                              ? 'white'
                              : 'black',
                          maxWidth: '60%',
                        }}
                      >
                        <p>{message.text}</p>
                      </Box>
                      {message.uid === senderDetails.uid && (
                        <Avatar src={message.photo} />
                      )}
                    </Stack>
                  ))
                ) : (
                  <p>No data found.</p>
                )}
                <div ref={messagesEndRef} />{' '}
                {/* Invisible element to scroll into view */}
              </Box>
              {/* ###### */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  value={message}
                  fullWidth
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  placeholder="Type a message..."
                />
                <IconButton
                  color="primary"
                  onClick={() => sendMessage(selectedUserId)}
                  sx={{
                    width: '80px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <SendIcon sx={{ fontSize: 24, color: 'white' }} />{' '}
                </IconButton>
              </Stack>
            </>
          ) : (
            <p></p>
          )}
        </Box>
      </Box>
    </>
  );
}
