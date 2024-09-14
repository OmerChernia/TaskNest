import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sections = await kv.get('sections') || [];
      res.status(200).json(sections);
    } catch (error) {
      console.error('Error fetching sections:', error);
      res.status(500).json({ error: 'Failed to fetch sections' });
    }
  } else if (req.method === 'POST') {
    try {
      const { sections } = req.body;
      if (!sections || !Array.isArray(sections)) {
        return res.status(400).json({ error: 'Sections array is required' });
      }
      await kv.set('sections', sections);
      res.status(200).json({ message: 'Sections updated successfully' });
    } catch (error) {
      console.error('Error updating sections:', error);
      res.status(500).json({ error: 'Failed to update sections' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
