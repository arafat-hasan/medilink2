const express = require('express');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

// Get all doctors
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await knex('doctors')
      .join('users', 'doctors.user_id', 'users.id')
      .select(
        'doctors.*',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone'
      )
      .orderBy('users.first_name');
    
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get doctor availability
router.get('/:id/availability', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await knex('doctors').where({ id }).first();
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get existing appointments for the next 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const appointments = await knex('appointments')
      .where('doctor_id', id)
      .where('status', 'scheduled')
      .where('appointment_date', '>=', new Date())
      .where('appointment_date', '<=', thirtyDaysFromNow)
      .select('appointment_date');

    res.json({
      availability: JSON.parse(doctor.availability || '{}'),
      booked_slots: appointments.map(apt => apt.appointment_date)
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create doctor (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      password, 
      specialization, 
      license_number, 
      bio 
    } = req.body;
    
    // Check if user already exists
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user first
    const [userId] = await knex('users').insert({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role: 'doctor'
    });

    // Create doctor record
    const [doctorId] = await knex('doctors').insert({
      user_id: userId,
      specialization,
      license_number,
      bio,
      availability: JSON.stringify({})
    });

    res.status(201).json({ 
      id: doctorId, 
      message: 'Doctor created successfully',
      user_id: userId
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update doctor information
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      specialization, 
      license_number, 
      bio 
    } = req.body;
    
    // Check if user is the doctor or admin
    const doctor = await knex('doctors').where({ id }).first();
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    if (req.user.role !== 'admin' && doctor.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update user information
    await knex('users').where({ id: doctor.user_id }).update({
      first_name,
      last_name,
      email,
      phone
    });

    // Update doctor information
    await knex('doctors').where({ id }).update({
      specialization,
      license_number,
      bio
    });

    res.json({ message: 'Doctor information updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete doctor (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const doctor = await knex('doctors').where({ id }).first();
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Delete related appointments
    await knex('appointments').where({ doctor_id: id }).del();
    
    // Delete doctor record
    await knex('doctors').where({ id }).del();

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
