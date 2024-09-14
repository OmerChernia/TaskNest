import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  console.log('Test KV route called');
  try {
    await kv.set('test_key', 'test_value');
    const value = await kv.get('test_key');
    console.log('KV Test Result:', value);
    res.status(200).json({ message: 'KV Test Successful', value });
  } catch (error) {
    console.error('KV Test Error:', error);
    res.status(500).json({ message: 'KV Test Failed', error: error.message });
  }
}
