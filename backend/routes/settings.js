const express = require('express');
const Joi = require('joi');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

const settingsSchema = Joi.object({
  systemName: Joi.string().required(),
  defaultAppointmentDuration: Joi.number().min(15).max(120).required(),
  lowStockThreshold: Joi.number().min(1).max(50).required(),
  emailNotifications: Joi.boolean().required(),
  lowStockAlerts: Joi.boolean().required(),
  appointmentReminders: Joi.boolean().required()
});

// Get system settings
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, return default settings
    // In a real application, you'd store these in a database
    const settings = {
      systemName: 'MediLink Healthcare',
      defaultAppointmentDuration: 30,
      lowStockThreshold: 20,
      emailNotifications: true,
      lowStockAlerts: true,
      appointmentReminders: true
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update system settings
router.put('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = settingsSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // In a real application, you'd save these to a database
    // For now, we'll just validate and return success
    const settings = req.body;

    res.json({ 
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 