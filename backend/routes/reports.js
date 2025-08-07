const express = require('express');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

// Get upcoming appointments report
router.get('/upcoming-appointments', auth, adminOnly, async (req, res) => {
  try {
    const appointments = await knex('appointments')
      .join('users as patients', 'appointments.patient_id', 'patients.id')
      .join('doctors', 'appointments.doctor_id', 'doctors.id')
      .join('users as doctor_users', 'doctors.user_id', 'doctor_users.id')
      .where('appointments.status', 'scheduled')
      .where('appointments.appointment_date', '>=', new Date())
      .select(
        'appointments.*',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name',
        'doctor_users.first_name as doctor_first_name',
        'doctor_users.last_name as doctor_last_name',
        'doctors.specialization'
      )
      .orderBy('appointment_date');

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock report
router.get('/low-stock', auth, adminOnly, async (req, res) => {
  try {
    const supplies = await knex('supplies')
      .whereRaw('current_stock <= minimum_stock')
      .orderBy('current_stock');
    
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment cancellations report
router.get('/cancellations', auth, adminOnly, async (req, res) => {
  try {
    const cancellations = await knex('appointments')
      .join('users as patients', 'appointments.patient_id', 'patients.id')
      .join('doctors', 'appointments.doctor_id', 'doctors.id')
      .join('users as doctor_users', 'doctors.user_id', 'doctor_users.id')
      .where('appointments.status', 'cancelled')
      .select(
        'appointments.*',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name',
        'doctor_users.first_name as doctor_first_name',
        'doctor_users.last_name as doctor_last_name'
      )
      .orderBy('updated_at', 'desc');

    res.json(cancellations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get supply usage analytics
router.get('/supply-usage', auth, adminOnly, async (req, res) => {
  try {
    const supplyUsage = await knex('appointments')
      .join('supplies', knex.raw('JSON_EXTRACT(appointments.required_supplies, "$[*]") = supplies.id'))
      .select('supplies.name', 'supplies.id')
      .count('appointments.id as usage_count')
      .where('appointments.status', 'completed')
      .groupBy('supplies.id', 'supplies.name')
      .orderBy('usage_count', 'desc');

    res.json(supplyUsage);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment statistics
router.get('/appointment-stats', auth, adminOnly, async (req, res) => {
  try {
    const stats = await knex('appointments')
      .select('status')
      .count('* as count')
      .groupBy('status');

    const monthlyStats = await knex('appointments')
      .select(knex.raw('strftime("%Y-%m", appointment_date) as month'))
      .count('* as count')
      .where('appointment_date', '>=', knex.raw('date("now", "-12 months")'))
      .groupBy(knex.raw('strftime("%Y-%m", appointment_date)'))
      .orderBy('month');

    res.json({ statusStats: stats, monthlyStats });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
