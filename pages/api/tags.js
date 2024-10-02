// pages/api/tags.js

import { kv } from '@vercel/kv';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user?.email) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const email = session.user.email;
  const tagsKey = `tags:${email}`;

  try {
    switch (req.method) {
      case 'GET':
        try {
          const tags = await kv.get(tagsKey);
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

          let userTags = await kv.get(tagsKey);
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

          // Store the array directly without stringifying
          await kv.set(tagsKey, tagsArray);
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

          let tagsData = await kv.get(tagsKey) || [];

          // Handle if tagsData is a string
          if (typeof tagsData === 'string') {
            try {
              tagsData = JSON.parse(tagsData);
            } catch (error) {
              console.error('Error parsing tagsData:', error);
              tagsData = [];
            }
          }

          // Ensure tagsData is an array
          if (!Array.isArray(tagsData)) {
            tagsData = [];
          }

          // Filter out the tag with the specified ID
          const updatedTags = tagsData.filter(tag => tag.id !== id);

          // Update the KV store with the new tags array
          await kv.set(tagsKey, updatedTags);
          console.log('Tag deleted successfully');

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
}