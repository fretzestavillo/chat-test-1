export type UserDetails = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photo: string | null;
  token: string;
};

export type UserDetails2 = {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  photo: string | undefined;
  token: string;
};

export type Message = {
  sender: string;
  content: string;
  timestamp: string;
};
