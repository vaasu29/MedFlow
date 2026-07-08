require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PrismaClient } = require('@prisma/client');

const intakeRoutes = require('./routes/intake');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const agentLogRoutes = require('./routes/agentLogs');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Make prisma available on req
app.use((req, _res, next) => {
  req.prisma = prisma;
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/intake', intakeRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/agent-logs', agentLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'MedFlow API' });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏥 MedFlow API running on http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
