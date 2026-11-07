require('dotenv').config();

// Set up the server middleware and routes.
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');

const app = express();
const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Keep a simple route to check that the server is running.
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Return a clear response when no route matches.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// Start the server on the configured port.
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});