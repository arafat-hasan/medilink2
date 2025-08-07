const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config();

const knexConfig = require('./knexfile')[process.env.NODE_ENV || 'development'];
const knex = require('knex')(knexConfig);

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const supplyRoutes = require('./routes/supplies');
const reportRoutes = require('./routes/reports');
const healthRoutes = require('./routes/health'); // Health check
const settingsRoutes = require('./routes/settings');

const notificationService = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------
// Middleware
// ---------------------

app.use(helmet());
app.use(express.json());

// Parse allowed CORS origins from env var
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8080'];

console.log('[CORS] Allowed origins:', corsOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));

// ---------------------
// Routes
// ---------------------

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health', healthRoutes); // Health check
app.use('/api/settings', settingsRoutes);

// ---------------------
// Cron Tasks
// ---------------------

cron.schedule('0 7 * * *', () => {
  console.log('[CRON] 07:00 - Check upcoming appointments for supply issues...');
  notificationService.checkUpcomingAppointmentSupplies();
});

cron.schedule('0 8 * * *', () => {
  console.log('[CRON] 08:00 - Send daily reminders...');
  notificationService.sendDailyReminders();
});

cron.schedule('0 9 * * *', () => {
  console.log('[CRON] 09:00 - Check low stock alerts...');
  notificationService.checkLowStockAlerts();
});

cron.schedule('0 10 * * *', () => {
  console.log('[CRON] 10:00 - Check expiring supplies...');
  notificationService.checkExpiringSupplies();
});

// ---------------------
// Production DB Setup
// ---------------------

if (process.env.NODE_ENV === 'production') {
  knex.migrate.latest()
    .then(() => {
      console.log('✅ Database migrations completed');
      return knex.seed.run();
    })
    .then(() => {
      console.log('✅ Database seeded successfully');
    })
    .catch(err => {
      console.error('❌ Database setup failed:', err);
    });
}

// ---------------------
// Start Server
// ---------------------

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (env: ${process.env.NODE_ENV})`);
});
