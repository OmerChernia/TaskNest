// pages/api/tags.js

import { kv } from '@vercel/kv';
import { authenticate } from '../../src/lib/auth';

const handler = async (req, res) => {
  try {
    const { email } = req.user;

    switch (req.method) {
      case 'GET':
        try {
          const tags = await kv.get(`tags:${email}`);
          console.log('Raw tags data:', tags); // Add this line for debugging
          if (typeof tags === 'string') {
            try {
              const parsedTags = JSON.parse(tags);
              res.status(200).json(parsedTags);
            } catch (parseError) {
              console.error('Error parsing tags:', parseError);
              res.status(200).json([]); // Return an empty array if parsing fails
            }
          } else if (Array.isArray(tags)) {
            res.status(200).json(tags);
          } else {
            res.status(200).json([]);
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
          res.status(500).json({ error: `Failed to fetch tags: ${error.message}` });
        }
        break;

      case 'POST':
        try {
          const { name, color } = req.body;
          if (!name || !color) {
            return res.status(400).json({ error: 'Name and color are required' });
          }
          const tagsData = await kv.get(`tags:${email}`) || [];
          console.log('Fetched tags data:', tagsData);
          console.log('Type of tags data:', typeof tagsData);          const tags = tagsData ? JSON.parse(tagsData) : [];
          const newTag = { id: Date.now().toString(), name, color };
          tags.push(newTag);
          await kv.set(`tags:${email}`, JSON.stringify(tags));         
          res.status(201).json(newTag);
        } catch (error) {
          console.error('Error adding tag:', error);
          res.status(500).json({ error: 'Failed to add tag' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;
          if (!id) {
            return res.status(400).json({ error: 'Tag ID is required' });
          }
          const tagsData = await kv.get(`tags:${email}`) || '[]';
          let tags = JSON.parse(tagsData);
          tags = tags.filter(tag => tag.id !== id);
          await kv.set(`tags:${email}`, JSON.stringify(tags));
          res.status(200).json({ message: 'Tag deleted successfully' });
        } catch (error) {
          console.error('Error deleting tag:', error);
          res.status(500).json({ error: 'Failed to delete tag' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in tags handler:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export default authenticate(handler);