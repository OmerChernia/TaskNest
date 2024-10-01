// pages/api/auth-check.js

import { authenticate } from '../../src/lib/auth';

const handler = async (req, res) => {
  res.status(200).json({ authenticated: true });
};

export default authenticate(handler);