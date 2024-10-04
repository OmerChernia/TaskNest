// pages/api/tasks.js
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

  try {
    switch (req.method) {
      case 'GET':
        try {
          let tasks = await kv.get(`tasks:${email}`);
          console.log('Raw tasks data:', tasks);

          let tasksArray = [];
          if (typeof tasks === 'string') {
            try {
              tasksArray = JSON.parse(tasks);
            } catch (parseError) {
              console.error('Error parsing tasks:', parseError);
            }
          } else if (Array.isArray(tasks)) {
            tasksArray = tasks;
          }

          if (!Array.isArray(tasksArray)) {
            console.warn('Tasks is not an array, returning empty array');
            tasksArray = [];
          }

          console.log('Tasks array to be sent:', tasksArray);
          res.status(200).json(tasksArray);
        } catch (error) {
          console.error('Error fetching tasks:', error);
          res.status(500).json({ error: `Failed to fetch tasks: ${error.message}` });
        }
        break;

      case 'POST':
        try {
          console.log('Received task data:', req.body);

          let newTasks = Array.isArray(req.body) ? req.body : [req.body];
          
          newTasks = newTasks.map(task => ({
            id: task.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title: task.title || 'Untitled Task',
            text: task.text || '',
            dueDate: task.dueDate || null,
            tag: task.tag || null,
            duration: task.duration || null,
            completed: task.completed || false,
            createdAt: task.createdAt || new Date().toISOString(),
          }));

          console.log('Processed new tasks:', newTasks);

          // Fetch existing tasks
          let existingTasks = await kv.get(`tasks:${email}`);
          console.log('Existing tasks:', existingTasks);

          let tasksArray = [];
          if (typeof existingTasks === 'string') {
            try {
              tasksArray = JSON.parse(existingTasks);
            } catch (parseError) {
              console.error('Error parsing existing tasks:', parseError);
            }
          } else if (Array.isArray(existingTasks)) {
            tasksArray = existingTasks;
          }

          if (!Array.isArray(tasksArray)) {
            console.warn('Existing tasks is not an array, initializing empty array');
            tasksArray = [];
          }

          // Add new tasks
          tasksArray = [...tasksArray, ...newTasks];

          console.log('Final tasks array before saving:', tasksArray);

          // Save updated tasks
          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));

          // Verify saved data
          const savedTasks = await kv.get(`tasks:${email}`);
          console.log('Saved tasks after update:', savedTasks);

          res.status(201).json(newTasks);
        } catch (error) {
          console.error('Error adding task(s):', error);
          res.status(500).json({ error: `Failed to add task(s): ${error.message}` });
        }
        break;

      case 'PUT':
        try {
          const { id } = req.body;
          if (!id) {
            return res.status(400).json({ error: 'Task ID is required' });
          }
          
          const userTasks = await kv.get(`tasks:${email}`) || [];
          let tasksArray = Array.isArray(userTasks) ? userTasks : JSON.parse(userTasks || '[]');
          
          const taskIndex = tasksArray.findIndex(task => task.id === id);
          
          if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
          }
          
          tasksArray[taskIndex] = { ...tasksArray[taskIndex], ...req.body };
          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));
          res.status(200).json(tasksArray[taskIndex]);
        } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ error: `Failed to update task: ${error.message}` });
        }
        break;

        case 'DELETE':
          try {
            let idsToDelete = [];
        
            if (req.query.id) {
              // For single task deletion using query parameter
              idsToDelete = [req.query.id];
            } else if (req.body && req.body.ids) {
              // For multiple task deletion using request body
              idsToDelete = req.body.ids;
            } else {
              return res.status(400).json({ error: 'Task ID(s) are required' });
            }
        
            console.log('Attempting to delete tasks with ids:', idsToDelete);
        
            // Fetch existing tasks
            const userTasks = await kv.get(`tasks:${email}`) || [];
            let tasksArray = Array.isArray(userTasks) ? userTasks : JSON.parse(userTasks || '[]');
        
            // Filter out tasks to delete
            const updatedTasks = tasksArray.filter(task => !idsToDelete.includes(task.id));
        
            if (updatedTasks.length === tasksArray.length) {
              return res.status(404).json({ error: 'Task(s) not found' });
            }
        
            // Save updated tasks
            await kv.set(`tasks:${email}`, JSON.stringify(updatedTasks));
            console.log('Updated tasks saved to KV store');
        
            res.status(200).json({ message: 'Tasks deleted successfully' });
          } catch (error) {
            console.error('Error deleting tasks:', error);
            res.status(500).json({ error: `Failed to delete tasks: ${error.message}` });
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
