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

};

export default Header;