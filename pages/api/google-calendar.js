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

  console.log('Received request body:', req.body); // Add this line

  const { event } = req.body;

  console.log('Extracted event object:', event); // Add this line

  if (!event || !event.start) {
    return res.status(400).json({ error: 'Invalid event data: Missing start information' });
  }

  try {
    let calendarEvent;

    if (event.start.dateTime && event.end.dateTime) {
      // Timed event
      calendarEvent = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone,
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone,
        },
      };
    } else if (event.start.date && event.end.date) {
      // All-day event
      calendarEvent = {
        summary: event.summary,
        description: event.description,
        start: {
          date: event.start.date,
        },
        end: {
          date: event.end.date,
        },
      };
    } else {
      throw new Error('Invalid event data: Missing start or end time/date');
    }

    console.log('Calendar event to be created:', calendarEvent); // Add this line

    switch (req.method) {
      case 'POST':
        // Create a new event in Google Calendar
        const createResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.error('Google Calendar API error:', errorData);
          throw new Error(errorData.error.message || 'Failed to create event');
        }

        const createdEvent = await createResponse.json();

        // Return the eventId to the frontend
        res.status(201).json({ eventId: createdEvent.id });
        break;

      case 'PUT':
        // Update an existing event in Google Calendar
        if (!eventId) {
          return res.status(400).json({ error: 'Event ID is required for updating an event' });
        }

        const updateResponse = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(calendarEvent),
        });

        if (updateResponse.ok) {
          const updatedEvent = await updateResponse.json();
          res.status(200).json({ eventId: updatedEvent.id });
        } else if (updateResponse.status === 404) {
          // Event not found, create a new one
          const recreateResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(calendarEvent),
          });

          if (!recreateResponse.ok) {
            const errorData = await recreateResponse.json();
            console.error('Google Calendar API error on recreation:', errorData);
            throw new Error(errorData.error.message || 'Failed to recreate event');
          }

          const recreatedEvent = await recreateResponse.json();

          // Return the new eventId to the frontend
          res.status(200).json({ eventId: recreatedEvent.id });
        } else {
          const errorData = await updateResponse.json();
          console.error('Google Calendar API error on update:', errorData);
          throw new Error(errorData.error.message || 'Failed to update event');
        }

        break;

      default:
        res.setHeader('Allow', ['POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error interacting with Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
}
