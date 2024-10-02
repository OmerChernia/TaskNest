// pages/api/sections.js

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


  try{
    switch (req.method) {
      case 'GET':
        try {
          const sectionsData = await kv.get(`sections:${email}`);
          console.log('Raw sections data:', sectionsData); // Add this line for debugging
          if (typeof sectionsData === 'string') {
            try {
              const parsedSections = JSON.parse(sectionsData);
              res.status(200).json(parsedSections);
            } catch (parseError) {
              console.error('Error parsing sections:', parseError);
              res.status(200).json([]); // Return an empty array if parsing fails
            }
          } else if (Array.isArray(sectionsData)) {
            res.status(200).json(sectionsData);
          } else {
            res.status(200).json([]);
          }
        } catch (error) {
          console.error('Error fetching sections:', error);
          res.status(500).json({ error: `Failed to fetch sections: ${error.message}` });
        }
        break;

      case 'POST':
        try {
          const { sections } = req.body;
          if (!sections || !Array.isArray(sections)) {
            return res.status(400).json({ error: 'Sections array is required' });
          }
          await kv.set(`sections:${email}`, JSON.stringify(sections));
          res.status(200).json({ message: 'Sections updated successfully' });
        } catch (error) {
          console.error('Error updating sections:', error);
          res.status(500).json({ error: 'Failed to update sections' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in sections handler:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
