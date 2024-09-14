import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Debug KV route called');
  try {
    // Test setting a value
    await kv.set('debug_key', 'debug_value');
    console.log('Set debug_key successfully');

    // Test getting a value
    const value = await kv.get('debug_key');
    console.log('Retrieved debug_key:', value);

    // Test getting tasks
    const tasks = await kv.get('tasks');
    console.log('Current tasks:', tasks);

    res.status(200).json({ 
      message: 'Debug successful', 
      debugValue: value,
      tasks: tasks 
    });
  } catch (error) {
    console.error('Debug KV Error:', error);
    res.status(500).json({ 
      message: 'Debug failed', 
      error: error.message,
      stack: error.stack 
    });
  }
}
