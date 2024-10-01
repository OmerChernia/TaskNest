// pages/api/login.js

import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Retrieve user from Vercel KV
  const user = await kv.hgetall(`user:${email}`);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  // Compare passwords
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  // Create JWT token
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expiration time
  });

  // Set token in HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax`
  );


  res.status(200).json({ message: 'Login successful.' });
}