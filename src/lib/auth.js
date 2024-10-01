// lib/auth.js

import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const SECRET_KEY = process.env.JWT_SECRET;

export const authenticate = (handler) => async (req, res) => {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies.token;
  
    if (!token) {
      console.error('No token found in cookies.');
      return res.status(401).json({ error: 'Authentication required.' });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log('Decoded token:', decoded);
      req.user = decoded;
      return handler(req, res);
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
  };