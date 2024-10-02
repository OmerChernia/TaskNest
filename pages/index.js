// pages/index.js

import { useSession, signIn } from 'next-auth/react';
import TodoList from '../src/components/ui/TodoList';

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return null; // Or a loading spinner
  }

  if (!session) {
    // Redirect to login or display a message
    return (
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-2xl mb-4">Please Sign In</h1>
        <button
          onClick={() => signIn()}
          className="bg-blue-500 text-white p-2 w-full"
        >
          Sign in
        </button>
      </div>
    );
  }

  return <TodoList />;
}