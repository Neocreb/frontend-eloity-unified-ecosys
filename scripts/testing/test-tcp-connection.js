import { createConnection } from 'net';

console.log('Testing TCP connection to hjebzdekquczudhrygns.supabase.co:5432');

const client = createConnection({ 
  host: 'hjebzdekquczudhrygns.supabase.co',
  port: 5432
}, () => {
  console.log('Connected to server!');
  client.end();
});

client.on('error', (err) => {
  console.error('Connection error:', err);
  console.error('Error code:', err.code);
});

client.on('timeout', () => {
  console.error('Connection timeout');
  client.destroy();
});

// Set timeout to 10 seconds
client.setTimeout(10000);