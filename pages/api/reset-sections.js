import { kv } from '@vercel/kv';

const initialSections = [
  { id: 'new-tasks', name: 'New Tasks', children: [], type: 'section' },
  { id: 'sunday', name: 'Sunday', children: [], type: 'section' },
  { id: 'monday', name: 'Monday', children: [], type: 'section' },
  { id: 'tuesday', name: 'Tuesday', children: [], type: 'section' },
  { id: 'wednesday', name: 'Wednesday', children: [], type: 'section' },
  { id: 'thursday', name: 'Thursday', children: [], type: 'section' },
  { id: 'friday', name: 'Friday', children: [], type: 'section' },
  { id: 'saturday', name: 'Saturday', children: [], type: 'section' },
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Delete the existing sections
      await kv.del('sections');
      
      // Set the sections to the initial state
      await kv.set('sections', initialSections);
      
      res.status(200).json({ message: 'Sections reset successfully' });
    } catch (error) {
      console.error('Error resetting sections:', error);
      res.status(500).json({ error: 'Failed to reset sections' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
