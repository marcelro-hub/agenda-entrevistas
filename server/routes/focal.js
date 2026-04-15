const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/focal — devuelve todas las reservas como { "G|S": true }
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT group_number, slot_number FROM focal_bookings'
    );
    const result = {};
    rows.forEach(r => { result[`${r.group_number}|${r.slot_number}`] = true; });
    res.json(result);
  } catch (err) {
    console.error('Error focal GET:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// POST /api/focal — registra un cupo
router.post('/', async (req, res) => {
  const { group_number, slot_number, name, email } = req.body;
  if (!group_number || !slot_number || !name || !email) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    await db.query(
      `INSERT INTO focal_bookings (group_number, slot_number, candidate_name, candidate_email)
       VALUES ($1, $2, $3, $4)`,
      [group_number, slot_number, name.trim(), email.trim()]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este cupo ya fue tomado' });
    }
    console.error('Error focal POST:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
