import { useLocation } from 'react-router-dom';

export function Home() {
  const location = useLocation();
  const user = location.state.fireBaseData;

  //   const fireBaseData = {
  //     uid: result.user.uid,
  //     email: result.user.email,
  //     displayName: result.user.displayName,
  //     token: await result.user.getIdToken(),
  //   };

  return (
    <>
      <h1>Welcome Home{user.displayName}</h1>
    </>
  );
}
