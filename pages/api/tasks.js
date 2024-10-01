// pages/api/tasks.js

import { kv } from '@vercel/kv';
import { authenticate } from '../../src/lib/auth';

const handler = async (req, res) => {
  try {
    const { email } = req.user;

    switch (req.method) {
      case 'GET':
        try {
          const tasks = await kv.get(`tasks:${email}`);
          console.log('Raw tasks data:', tasks); // Add this line for debugging
          if (typeof tasks === 'string') {
            try {
              const parsedTasks = JSON.parse(tasks);
              res.status(200).json(parsedTasks);
            } catch (parseError) {
              console.error('Error parsing tasks:', parseError);
              res.status(200).json([]); // Return an empty array if parsing fails
            }
          } else if (Array.isArray(tasks)) {
            res.status(200).json(tasks);
          } else {
            res.status(200).json([]);
          }
        } catch (error) {
          console.error('Error fetching tasks:', error);
          res.status(500).json({ error: `Failed to fetch tasks: ${error.message}` });
        }
        break;

      case 'POST':
        try {
          const newTask = { ...req.body, id: Date.now().toString() };
          const userTasks = (await kv.get(`tasks:${email}`)) || '[]';
          const tasksArray = JSON.parse(userTasks);
          tasksArray.push(newTask);
          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));
          res.status(201).json(newTask);
        } catch (error) {
          console.error('Error adding task:', error);
          res.status(500).json({ error: 'Failed to add task' });
        }
        break;

      case 'PUT':
        try {
          const { id } = req.body;
          if (!id) {
            return res.status(400).json({ error: 'Task ID is required' });
          }

          const userTasks = (await kv.get(`tasks:${email}`)) || '[]';
          let tasksArray = JSON.parse(userTasks);
          const taskIndex = tasksArray.findIndex(task => task.id === id);

          if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
          }

          tasksArray[taskIndex] = { ...tasksArray[taskIndex], ...req.body };
          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));
          res.status(200).json(tasksArray[taskIndex]);
        } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ error: 'Failed to update task' });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;
          if (!id) {
            return res.status(400).json({ error: 'Task ID is required' });
          }

          const userTasks = (await kv.get(`tasks:${email}`)) || '[]';
          let tasksArray = JSON.parse(userTasks);
          tasksArray = tasksArray.filter(task => task.id !== id);

          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));
          res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
          console.error('Error deleting task:', error);
          res.status(500).json({ error: 'Failed to delete task' });
        }
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in tasks handler:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export default authenticate(handler);