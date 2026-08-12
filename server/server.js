// server/server.js
const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();
const pool = require('./config/db'); 

const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const emailRoutes = require('./routes/emailRoutes');
const callRoutes = require('./routes/callRoutes');
const chatRoutes = require('./routes/chatRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const orgRoutes = require('./routes/orgRoutes');

const app = express();
const server = http.createServer(app); 

// Initialize Socket.io with dynamic CORS configuration
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
const allowedOrigins = [
  'https://crm-orpin-eight.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

// Attach `io` to request object so controllers can access it via req.app.get('io')
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/org', orgRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('CRM API is running...');
});

// Socket.io Connection Handler (Multi-Tenant Isolated)
io.on('connection', (socket) => {
  console.log('⚡ A user connected via WebSocket:', socket.id);

  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('join_org_room', (orgId) => {
    socket.join(`org_${orgId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      await pool.query(
        'INSERT INTO messages (sender_id, message, org_id) VALUES ($1, $2, $3)',
        [data.sender_id, data.message, data.org_id]
      );
      
      io.to(`org_${data.org_id}`).emit('receive_message', {
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        message: data.message,
        sent_at: new Date()
      });
    } catch (err) {
      console.error('Error saving chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from WebSocket');
  });
});

// Export app module for Vercel Serverless Function handling (if needed)
module.exports = app;

// Always start the server on Render / Local (using Render's dynamic PORT)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});