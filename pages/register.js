// pages/register.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Simple client-side validation
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      alert('Registration successful. Please log in.');
      router.push('/login');
    } else {
      const data = await response.json();
      alert(data.error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleRegister}>
        <input
          className="border p-2 w-full mb-2 text-gray-700"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-2 text-gray-700"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="border p-2 w-full mb-4 text-gray-700"
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button className="bg-green-500 text-white p-2 w-full" type="submit">
          Register
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{' '}
        <Link href="/login">
          <span className="text-blue-500 hover:underline cursor-pointer">Login here</span>
        </Link>
      </p>
    </div>
  );
}