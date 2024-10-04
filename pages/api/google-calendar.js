import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.accessToken) {
    console.error('No access token available:', token);
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (token.error === 'RefreshAccessTokenError') {
    return res.status(401).json({ error: 'Authentication error. Please sign in again.' });
  }

  const accessToken = token.accessToken;

  try {
    switch (req.method) {
      case 'POST':
        // Create a new event in Google Calendar
        const event = req.body;

        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Calendar API error:', errorData);
            throw new Error(errorData.error.message || 'Failed to create event');
          }

        const data = await response.json();
        res.status(201).json(data);
        break;

      default:
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error interacting with Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
}