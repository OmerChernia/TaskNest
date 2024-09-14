import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const tags = await kv.get('tags') || [];
      res.status(200).json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, color } = req.body;
      if (!name || !color) {
        return res.status(400).json({ error: 'Name and color are required' });
      }
      const tags = await kv.get('tags') || [];
      const newTag = { id: Date.now().toString(), name, color };
      tags.push(newTag);
      await kv.set('tags', tags);
      res.status(201).json(newTag);
    } catch (error) {
      console.error('Error adding tag:', error);
      res.status(500).json({ error: 'Failed to add tag' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Tag ID is required' });
      }
      let tags = await kv.get('tags') || [];
      tags = tags.filter(tag => tag.id !== id);
      await kv.set('tags', tags);
      res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
      console.error('Error deleting tag:', error);
      res.status(500).json({ error: 'Failed to delete tag' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
