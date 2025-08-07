const express = require('express');
const Joi = require('joi');
const knex = require('knex')(require('../knexfile').development);
const auth = require('../middleware/auth');

const router = express.Router();

const supplySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  current_stock: Joi.number().min(0).required(),
  minimum_stock: Joi.number().min(0).required(),
  expiry_date: Joi.date().allow(null),
  unit_price: Joi.number().min(0),
  supplier: Joi.string().allow('')
});

// Get all supplies
router.get('/', auth, async (req, res) => {
  try {
    const supplies = await knex('supplies').orderBy('name');
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get low stock supplies
router.get('/low-stock', auth, async (req, res) => {
  try {
    const supplies = await knex('supplies')
      .whereRaw('current_stock <= minimum_stock')
      .orderBy('current_stock');
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single supply
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const supply = await knex('supplies').where({ id }).first();
    
    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' });
    }
    
    res.json(supply);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create supply (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = supplySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const [supplyId] = await knex('supplies').insert(req.body);
    res.status(201).json({ id: supplyId, message: 'Supply created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update supply (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const supply = await knex('supplies').where({ id }).first();
    
    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    await knex('supplies').where({ id }).update(req.body);
    res.json({ message: 'Supply updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete supply (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    await knex('supplies').where({ id }).del();
    res.json({ message: 'Supply deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add supply reorder functionality for manual reordering

// Add reorder endpoint
router.post('/:id/reorder', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const supply = await knex('supplies').where({ id }).first();
    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    // Update stock
    await knex('supplies')
      .where({ id })
      .increment('current_stock', quantity);

    // Log the reorder (in a real system, you'd have an orders table)
    console.log(`Reordered ${quantity} units of ${supply.name}`);

    res.json({ 
      message: `Successfully reordered ${quantity} units of ${supply.name}`,
      new_stock: supply.current_stock + quantity
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
