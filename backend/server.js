const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cron = require('node-cron');
require('dotenv').config();

const knexConfig = require('./knexfile')[process.env.NODE_ENV || 'development'];
const knex = require('knex')(knexConfig);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const supplyRoutes = require('./routes/supplies');
const reportRoutes = require('./routes/reports');
const healthRoutes = require('./routes/health'); // Added health check route
const settingsRoutes = require('./routes/settings');
const notificationService = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
// Parse CORS origins from environment variable
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health', healthRoutes); // Added health check route
app.use('/api/settings', settingsRoutes);

// Scheduled tasks
cron.schedule('0 7 * * *', () => {
  console.log('Checking upcoming appointments for supply issues...');
  notificationService.checkUpcomingAppointmentSupplies();
});

cron.schedule('0 8 * * *', () => {
  console.log('Running daily notification tasks...');
  notificationService.sendDailyReminders();
});

cron.schedule('0 9 * * *', () => {
  console.log('Checking low stock alerts...');
  notificationService.checkLowStockAlerts();
});

// Checking expiring supplies
cron.schedule('0 10 * * *', () => {
  console.log('Checking expiring supplies...');
  notificationService.checkExpiringSupplies();
});

// Ensure database is set up in production
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
