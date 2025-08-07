const express = require('express');
const Joi = require('joi');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

const appointmentSchema = Joi.object({
  doctor_id: Joi.number().required(),
  appointment_date: Joi.date().required(),
  appointment_type: Joi.string().required(),
  notes: Joi.string().allow(''),
  required_supplies: Joi.array().items(Joi.number())
});

// Get appointments
router.get('/', auth, async (req, res) => {
  try {
    let query = knex('appointments')
      .join('users as patients', 'appointments.patient_id', 'patients.id')
      .join('doctors', 'appointments.doctor_id', 'doctors.id')
      .join('users as doctor_users', 'doctors.user_id', 'doctor_users.id')
      .select(
        'appointments.*',
        'patients.first_name as patient_first_name',
        'patients.last_name as patient_last_name',
        'doctor_users.first_name as doctor_first_name',
        'doctor_users.last_name as doctor_last_name',
        'doctors.specialization'
      );

    if (req.user.role === 'patient') {
      query = query.where('appointments.patient_id', req.user.userId);
    } else if (req.user.role === 'doctor') {
      const doctor = await knex('doctors').where('user_id', req.user.userId).first();
      query = query.where('appointments.doctor_id', doctor.id);
    }

    const appointments = await query.orderBy('appointment_date', 'asc');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create appointment
router.post('/', auth, async (req, res) => {
  try {
    const { error } = appointmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { doctor_id, appointment_date, appointment_type, notes, required_supplies } = req.body;

    // Enhanced supply availability check
    if (required_supplies && required_supplies.length > 0) {
      const supplies = await knex('supplies').whereIn('id', required_supplies);
      
      // Check for completely unavailable supplies
      const unavailableSupplies = supplies.filter(supply => supply.current_stock <= 0);
      
      if (unavailableSupplies.length > 0) {
        return res.status(400).json({ 
          error: 'Appointment cannot be booked due to unavailable supplies',
          unavailable_supplies: unavailableSupplies.map(s => ({ id: s.id, name: s.name, current_stock: s.current_stock })),
          message: 'Critical supplies are out of stock. Please contact administration.'
        });
      }

      // Check for low stock supplies (warnings)
      const lowStockSupplies = supplies.filter(supply => 
        supply.current_stock > 0 && supply.current_stock <= supply.minimum_stock
      );

      // Reserve supplies for the appointment
      for (const supplyId of required_supplies) {
        await knex('supplies')
          .where('id', supplyId)
          .decrement('current_stock', 1);
      }

      // Send alerts for low stock supplies
      if (lowStockSupplies.length > 0) {
        const notificationService = require('../services/notificationService');
        await notificationService.sendSupplyShortageAlert(
          { doctor_id, appointment_type, appointment_date },
          lowStockSupplies.map(s => s.name)
        );
      }
    }

    const [appointmentId] = await knex('appointments').insert({
      patient_id: req.user.userId,
      doctor_id,
      appointment_date,
      appointment_type,
      notes,
      required_supplies: JSON.stringify(required_supplies || [])
    });

    res.status(201).json({ 
      id: appointmentId, 
      message: 'Appointment created successfully',
      warnings: lowStockSupplies ? lowStockSupplies.map(s => `${s.name} is running low`) : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await knex('appointments').where({ id }).first();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await knex('appointments').where({ id }).update(req.body);
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get doctor availability for calendar view
router.get('/doctor/:id/availability', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Format: YYYY-MM-DD
    
    const doctor = await knex('doctors').where({ id }).first();
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const availability = JSON.parse(doctor.availability || '{}');
    const selectedDate = date ? new Date(date) : new Date();
    
    // Get day of week
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = availability[dayOfWeek] || [];
    
    // Get booked slots for the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedSlots = await knex('appointments')
      .where('doctor_id', id)
      .where('status', 'scheduled')
      .where('appointment_date', '>=', startOfDay)
      .where('appointment_date', '<=', endOfDay)
      .select('appointment_date');

    res.json({
      availability: dayAvailability,
      booked_slots: bookedSlots.map(slot => slot.appointment_date),
      date: selectedDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await knex('appointments').where({ id }).first();
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    if (req.user.role === 'patient' && appointment.patient_id !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Return supplies if appointment is cancelled
    if (appointment.required_supplies) {
      const supplyIds = JSON.parse(appointment.required_supplies);
      for (const supplyId of supplyIds) {
        await knex('supplies')
          .where('id', supplyId)
          .increment('current_stock', 1);
      }
    }

    await knex('appointments').where({ id }).update({ status: 'cancelled' });
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get appointment types with required supplies
router.get('/types', auth, async (req, res) => {
  try {
    const appointmentTypes = {
      'Consultation': [1, 2], // Stethoscope, Blood Pressure Monitor
      'Vaccination': [3, 4], // Syringes, Gloves
      'Surgery': [3, 4], // Syringes, Gloves
      'Check-up': [1, 2], // Stethoscope, Blood Pressure Monitor
      'Emergency': [1, 2, 3, 4], // All supplies
      'Follow-up': [1], // Stethoscope
      'Therapy': [],
      'Diagnostic': [1, 2]
    };
    
    res.json(appointmentTypes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check supply availability for appointment type
router.get('/check-supply-availability', auth, async (req, res) => {
  try {
    const { appointment_type } = req.query;
    
    if (!appointment_type) {
      return res.status(400).json({ error: 'Appointment type is required' });
    }

    const appointmentTypes = {
      'Consultation': [1, 2],
      'Vaccination': [3, 4],
      'Surgery': [3, 4],
      'Check-up': [1, 2],
      'Emergency': [1, 2, 3, 4],
      'Follow-up': [1],
      'Therapy': [],
      'Diagnostic': [1, 2]
    };

    const requiredSupplyIds = appointmentTypes[appointment_type] || [];
    
    if (requiredSupplyIds.length === 0) {
      return res.json({
        available: true,
        message: 'No supplies required for this appointment type',
        supplies: []
      });
    }

    const supplies = await knex('supplies').whereIn('id', requiredSupplyIds);
    
    const unavailableSupplies = supplies.filter(supply => supply.current_stock <= 0);
    const lowStockSupplies = supplies.filter(supply => 
      supply.current_stock > 0 && supply.current_stock <= supply.minimum_stock
    );
    const availableSupplies = supplies.filter(supply => supply.current_stock > supply.minimum_stock);

    const isAvailable = unavailableSupplies.length === 0;
    
    res.json({
      available: isAvailable,
      message: isAvailable ? 'All required supplies are available' : 'Some supplies are unavailable',
      supplies: supplies.map(supply => ({
        id: supply.id,
        name: supply.name,
        current_stock: supply.current_stock,
        minimum_stock: supply.minimum_stock,
        status: supply.current_stock <= 0 ? 'unavailable' : 
                supply.current_stock <= supply.minimum_stock ? 'low_stock' : 'available'
      })),
      unavailable_count: unavailableSupplies.length,
      low_stock_count: lowStockSupplies.length,
      available_count: availableSupplies.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
