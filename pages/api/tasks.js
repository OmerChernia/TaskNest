import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('API route called with method:', req.method);
  console.log('Request body:', JSON.stringify(req.body));

  if (req.method === 'GET') {
    try {
      const taskIds = await kv.zrange('tasks_by_date', 0, -1);
      const tasks = await Promise.all(
        taskIds.map(async (id) => {
          const task = await kv.hgetall(`task:${id}`);
          return task;
        })
      );
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, tag, dueDate, completed, displayDate } = req.body;
      console.log('Parsed task data:', { title, description, tag, dueDate, completed, displayDate });
      
      if (!title) {
        console.log('Title is missing');
        return res.status(400).json({ error: 'Title is required' });
      }

      const taskId = Date.now().toString();
      const task = {
        id: taskId,
        title,
        description,
        tag: tag ? { 
          id: tag.id ? tag.id.toString() : null, 
          name: tag.name || null, 
          color: tag.color || null 
        } : null,
        dueDate,
        completed: completed || false,
        displayDate,
        createdAt: new Date().toISOString(),
        section: 'new-tasks', // Add this line
      };

      console.log('New task object:', task);

      await kv.hset(`task:${taskId}`, task);
      await kv.zadd('tasks_by_date', { score: Date.now(), member: taskId });

      res.status(201).json(task);
    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ error: 'Failed to add task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      await kv.del(`task:${id}`);
      await kv.zrem('tasks_by_date', id);

      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...updatedFields } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const existingTask = await kv.hgetall(`task:${id}`);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updatedTask = { 
        ...existingTask, 
        ...updatedFields,
        tag: updatedFields.tag ? { 
          id: updatedFields.tag.id.toString(), 
          name: updatedFields.tag.name, 
          color: updatedFields.tag.color 
        } : null,
        section: updatedFields.section || existingTask.section // Ensure section is updated
      };

      await kv.hset(`task:${id}`, updatedTask);

      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PUT']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
