// pages/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TodoList from '../src/components/ui/TodoList.js';



export default function HomePage() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await fetch('/api/auth-check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setAuthenticated(true);
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (!authenticated) {
    return null; // Or a loading spinner
  }

  return <TodoList />;
}
