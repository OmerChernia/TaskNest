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
          console.log('Raw tags data:', tags);
          console.log('Type of tags data:', typeof tags);

          let tagsArray = [];
          if (Array.isArray(tags)) {
            tagsArray = tags;
          } else if (typeof tags === 'string') {
            try {
              tagsArray = JSON.parse(tags);
            } catch (parseError) {
              console.error('Error parsing tags:', parseError);
            }
          } else if (tags === null || tags === undefined) {
            console.log('No tags found, returning empty array');
          } else {
            console.error('Unexpected type for tags:', typeof tags);
          }

          console.log('Tags array to be sent:', tagsArray);
          res.status(200).json(tagsArray);
        } catch (error) {
          console.error('Error fetching tags:', error);
          res.status(500).json({ error: `Failed to fetch tags: ${error.message}` });
        }
        break;

      case 'POST':
        try {
          const newTag = { ...req.body, id: Date.now().toString() };
          console.log('New tag to be added:', newTag);

          const userTags = await kv.get(`tags:${email}`);
          console.log('Current tags from KV:', userTags);
          console.log('Type of userTags:', typeof userTags);

          let tagsArray = [];
          if (Array.isArray(userTags)) {
            tagsArray = userTags;
          } else if (typeof userTags === 'string') {
            try {
              tagsArray = JSON.parse(userTags);
            } catch (parseError) {
              console.error('Error parsing existing tags:', parseError);
              tagsArray = [];
            }
          } else if (userTags === null || userTags === undefined) {
            console.log('No existing tags found, initializing empty array');
          } else {
            console.error('Unexpected type for userTags:', typeof userTags);
          }

          console.log('Tags array before adding new tag:', tagsArray);

          tagsArray.push(newTag);

          console.log('Tags array after adding new tag:', tagsArray);

          await kv.set(`tags:${email}`, JSON.stringify(tagsArray));
          console.log('Tags saved to KV store');

          res.status(201).json(newTag);
        } catch (error) {
          console.error('Error adding tag:', error);
          res.status(500).json({ error: `Failed to add tag: ${error.message}` });
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