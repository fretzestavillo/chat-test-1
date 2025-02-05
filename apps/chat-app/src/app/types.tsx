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

export type Messages = {
  displayName: string;
  email: string;
  photo: string;
  text: string;
  timestamp: any; // You can replace `any` with `Timestamp` if using Firebase's timestamp type
  token: string;
  uid: string;
};
