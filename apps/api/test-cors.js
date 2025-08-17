const { Hono } = require('hono');
const cors = require('./src/middlewares/cors');

const app = new Hono();

// Apply CORS middleware
app.use(cors);

// Test endpoint
app.get('/test', (c) => {
  return c.json({ message: 'CORS test successful' });
});

// Handle preflight OPTIONS requests
app.options('*', (c) => {
  return c.text('', 204);
});

const port = 3001;
app.fire = () => {
  console.log(`CORS test server running on port ${port}`);
  console.log('Test with: curl -H "Origin: http://localhost:4783" http://localhost:3001/test');
};

app.listen(port);
