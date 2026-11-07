// Set up the server middleware and routes.
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Keep a simple route to check that the server is running.
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);

// Start the server on port 5000.
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});