// pages/api/register.js

import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Check if user already exists
  const existingUser = await kv.hgetall(`user:${email}`);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists.' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Store user in Vercel KV
  await kv.hmset(`user:${email}`, { email, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully.' });
}