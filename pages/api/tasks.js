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


  try{
    switch (req.method) {
      case 'GET':
        try {
          const tasks = await kv.get(`tasks:${email}`);
          console.log('Raw tasks data:', tasks);
          console.log('Type of tasks data:', typeof tasks);

          let tasksArray = [];
          if (typeof tasks === 'string') {
            try {
              tasksArray = JSON.parse(tasks);
            } catch (parseError) {
              console.error('Error parsing tasks:', parseError);
            }
          } else if (Array.isArray(tasks)) {
            tasksArray = tasks;
          } else if (tasks === null || tasks === undefined) {
            console.log('No tasks found, returning empty array');
          } else {
            console.error('Unexpected type for tasks:', typeof tasks);
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
          const newTask = { ...req.body, id: Date.now().toString() };
          console.log('New task to be added:', newTask);

          const userTasks = await kv.get(`tasks:${email}`);
          console.log('Current tasks from KV:', userTasks);
          console.log('Type of userTasks:', typeof userTasks);

          let tasksArray = [];
          if (Array.isArray(userTasks)) {
            tasksArray = userTasks;
          } else if (typeof userTasks === 'string') {
            try {
              tasksArray = JSON.parse(userTasks);
            } catch (parseError) {
              console.error('Error parsing existing tasks:', parseError);
              tasksArray = [];
            }
          } else if (userTasks === null || userTasks === undefined) {
            console.log('No existing tasks found, initializing empty array');
          } else {
            console.error('Unexpected type for userTasks:', typeof userTasks);
          }

          console.log('Tasks array before adding new task:', tasksArray);

          tasksArray.push(newTask);

          console.log('Tasks array after adding new task:', tasksArray);

          await kv.set(`tasks:${email}`, JSON.stringify(tasksArray));
          console.log('Tasks saved to KV store');

          res.status(201).json(newTask);
        } catch (error) {
          console.error('Error adding task:', error);
          res.status(500).json({ error: `Failed to add task: ${error.message}` });
        }
        break;

      case 'PUT':
        try {
          const { id } = req.body;
          if (!id) {
            return res.status(400).json({ error: 'Task ID is required' });
          }

          const userTasks = await kv.get(`tasks:${email}`);
          console.log('Current tasks for update:', userTasks); // Add this line for debugging
          let tasksArray = [];
          if (Array.isArray(userTasks)) {
            tasksArray = userTasks;
          } else if (typeof userTasks === 'string') {
            try {
              tasksArray = JSON.parse(userTasks);
            } catch (parseError) {
              console.error('Error parsing existing tasks for update:', parseError);
            }
          }

          const taskIndex = tasksArray.findIndex(task => task.id === id);

          if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
          }

          tasksArray[taskIndex] = { ...tasksArray[taskIndex], ...req.body };
          await kv.set(`tasks:${email}`, tasksArray);
          res.status(200).json(tasksArray[taskIndex]);
        } catch (error) {
          console.error('Error updating task:', error);
          res.status(500).json({ error: `Failed to update task: ${error.message}` });
        }
        break;

      case 'DELETE':
        try {
          const { id } = req.query;
          console.log('Attempting to delete task with id:', id);

          const userTasks = await kv.get(`tasks:${email}`);
          console.log('Current tasks from KV:', userTasks);
          console.log('Type of userTasks:', typeof userTasks);

          let tasksArray = [];
          if (Array.isArray(userTasks)) {
            tasksArray = userTasks;
          } else if (typeof userTasks === 'string') {
            try {
              tasksArray = JSON.parse(userTasks);
            } catch (parseError) {
              console.error('Error parsing existing tasks:', parseError);
              tasksArray = [];
            }
          } else if (userTasks === null || userTasks === undefined) {
            console.log('No existing tasks found');
            return res.status(404).json({ error: 'Task not found' });
          } else {
            console.error('Unexpected type for userTasks:', typeof userTasks);
            return res.status(500).json({ error: 'Unexpected data format' });
          }

          const updatedTasks = tasksArray.filter(task => task.id !== id);

          if (tasksArray.length === updatedTasks.length) {
            return res.status(404).json({ error: 'Task not found' });
          }

          await kv.set(`tasks:${email}`, JSON.stringify(updatedTasks));
          console.log('Updated tasks saved to KV store');

          res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
          console.error('Error deleting task:', error);
          res.status(500).json({ error: `Failed to delete task: ${error.message}` });
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
