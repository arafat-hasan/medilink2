const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).when('$isUpdate', {
    is: true,
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().allow(''),
  role: Joi.string().valid('admin', 'doctor', 'patient').required()
});

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await knex('users')
      .select('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'created_at')
      .orderBy('first_name');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await knex('users')
      .where({ id: req.user.userId })
      .select('id', 'email', 'first_name', 'last_name', 'phone', 'role')
      .first();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, first_name, last_name, phone, role } = req.body;
    
    const existingUser = await knex('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [userId] = await knex('users').insert({
      email,
      password: hashedPassword,
      first_name,
      last_name,
      phone,
      role
    });

    // If creating a doctor, also create doctor record
    if (role === 'doctor') {
      await knex('doctors').insert({
        user_id: userId,
        specialization: '',
        license_number: '',
        bio: '',
        availability: JSON.stringify({})
      });
    }

    res.status(201).json({ 
      id: userId, 
      message: 'User created successfully',
      user: { id: userId, email, first_name, last_name, role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin or self)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = userSchema.validate(req.body, { context: { isUpdate: true } });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password, first_name, last_name, phone, role } = req.body;
    
    // Check if email is already taken by another user
    const existingUser = await knex('users')
      .where({ email })
      .whereNot({ id })
      .first();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    const updateData = {
      email,
      first_name,
      last_name,
      phone,
      role
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await knex('users').where({ id }).update(updateData);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const user = await knex('users').where({ id }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete related records first
    if (user.role === 'doctor') {
      await knex('doctors').where({ user_id: id }).del();
    }
    
    // Delete appointments
    await knex('appointments').where({ patient_id: id }).del();
    await knex('appointments').where({ doctor_id: id }).del();
    
    // Delete user
    await knex('users').where({ id }).del();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
