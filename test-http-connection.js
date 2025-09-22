import { createConnection } from 'net';

console.log('Testing HTTP connection to hjebzdekquczudhrygns.supabase.co:443');

const client = createConnection({ 
  host: 'hjebzdekquczudhrygns.supabase.co',
  port: 443
}, () => {
  console.log('Connected to HTTPS port!');
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