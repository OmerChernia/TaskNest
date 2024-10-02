// pages/login.js

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          className="border p-2 w-full mb-2 text-gray-700"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="border p-2 w-full mb-4 text-gray-700"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button className="bg-blue-500 text-white p-2 w-full mb-4" type="submit">
          Login
        </button>
      </form>

      <button
        onClick={() => signIn('google')}
        className="bg-red-500 text-white p-2 w-full mb-4"
      >
        Sign in with Google
      </button>

      <p className="mt-4 text-center">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-500 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}