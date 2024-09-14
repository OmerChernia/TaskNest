import { kv } from '@vercel/kv';

const initialTasks = [
  {
    id: '1',
    title: 'Welcome to your Todo List!',
    description: 'This is a sample task. You can add, edit, or delete tasks as needed.',
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate: null,
    tag: null,
    displayDate: null,
    section: 'new-tasks' // Add this line
  }
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Delete all existing tasks
      const taskIds = await kv.zrange('tasks_by_date', 0, -1);
      for (const id of taskIds) {
        await kv.del(`task:${id}`);
      }
      await kv.del('tasks_by_date');

      // Add initial tasks
      for (const task of initialTasks) {
        await kv.hset(`task:${task.id}`, task);
        await kv.zadd('tasks_by_date', { score: Date.now(), member: task.id });
      }

      res.status(200).json({ message: 'Tasks reset successfully' });
    } catch (error) {
      console.error('Error resetting tasks:', error);
      res.status(500).json({ error: 'Failed to reset tasks' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
