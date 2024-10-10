// pages/login.js

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/');
    } else if (router.query.error) {
      setError(router.query.error);
    }
  }, [session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Image src="/tasknest-logo.png" alt="TaskNest Logo" width={300} height={100} />
        </div>
        
        <h1 className="text-2xl mb-6 text-center text-gray-600">Login to TaskNest</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            className="border p-2 w-full mb-4 text-gray-700 rounded"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <input
            className="border p-2 w-full mb-4 text-gray-700 rounded"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button 
            className="w-full px-4 py-2 text-white bg-orange-500 rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 mb-4" 
            type="submit"
          >
            Login
          </button>
        </form>

        <button
          onClick={() => signIn('google')}
          className="w-full px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 mb-4"
        >
          Sign in with Google
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-orange-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}