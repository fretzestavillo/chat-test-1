import { useLocation, useNavigate } from 'react-router-dom';
import { firebaseConfig } from './config';
import { initializeApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  onSnapshot,
} from 'firebase/firestore';
import { Avatar, Button, Stack, TextField, Box, Grid2 } from '@mui/material';

import { Message, UserDetails, UserDetails2 } from './types';
import { useEffect, useState } from 'react';

export function Home() {
  const navigate = useNavigate();

  const location = useLocation();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [usersList, setUsersList] = useState<UserDetails2[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isHidden, setHidden] = useState(true);

  const userDetails = {
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
    // Reference to the "users" collection
    const usersRef = collection(db, 'users');

    // Listen to changes in the "users" collection
    const unsubscribe = onSnapshot(
      usersRef,
      (querySnapshot) => {
        const users: UserDetails2[] = [];

        querySnapshot.forEach((doc) => {
          // Push each user's data into the users array
          users.push(doc.data() as UserDetails2);
        });

        // Update state with the real-time users data
        setUsersList(users);
      },
      (error) => {
        console.error('Error listening to Firestore changes:', error);
      }
    );

    // Cleanup on component unmount to stop listening
    return () => unsubscribe();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser) {
      const newMsg: Message = {
        sender: 'You', // Replace with dynamic user info if needed
        content: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  function changeState(user: any) {
    setSelectedUser(user);
    setHidden(false);
  }

  return (
    <>
      <h1>
        Welcome to chat app {userDetails.email}
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
        {/* Users List on the left */}
        <Box
          sx={{
            width: '25%', // 3/12 of the container
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
                onClick={() => changeState(user.email)}
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

        {/* Messenger UI on the right */}
        <Box
          sx={{
            flexGrow: 1, // Takes up the remaining space (9/12 of the container)
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 2,
            borderRadius: 2,
          }}
        >
          {selectedUser ? (
            <>
              <h2>Chat with {selectedUser}</h2>
              {/* Messages list */}
              <Box sx={{ overflowY: 'auto', flexGrow: 1, marginBottom: 2 }}>
                {messages.map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: 1,
                      padding: 1,
                      borderRadius: 1,
                      backgroundColor:
                        msg.sender === 'You' ? '#f0f0f0' : '#e0f7fa',
                    }}
                  >
                    <Avatar sx={{ marginRight: 1 }} />
                    <Stack>
                      <span style={{ fontWeight: 'bold' }}>{msg.sender}</span>
                      <span>{msg.content}</span>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>
                        {msg.timestamp}
                      </span>
                    </Stack>
                  </Box>
                ))}
              </Box>

              {/* Input text field and send button */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
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
