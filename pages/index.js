// pages/index.js

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import TodoList from '../src/components/ui/TodoList';
import Image from 'next/image';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
    }
  }, [status, router]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center mb-6">
            <Image src="/tasknest-logo.png" alt="TaskNest Logo" width={300} height={100} />
          </div>
          <h2 className="mb-6 text-xl text-center text-gray-600">Please Sign In to Continue</h2>
          <button
            onClick={() => signIn()}
            className="w-full px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <TodoList />;
}