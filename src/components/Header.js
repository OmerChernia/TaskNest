// components/Header.js

import { signOut, useSession } from "next-auth/react"
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header>
      {session && (
        <button onClick={handleLogout}>Logout</button>
      )}
    </header>
  );
};

export default Header;