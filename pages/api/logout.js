// pages/api/logout.js

import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({ req })

  if (session) {
    res.setHeader('Set-Cookie', [
      `next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
      `next-auth.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly`,
    ]);
    res.status(200).json({ message: 'Logged out successfully.' });
  } else {
    res.status(401).json({ error: 'No active session' });
  }
}