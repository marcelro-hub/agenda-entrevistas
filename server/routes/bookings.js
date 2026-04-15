const router = require('express').Router();
const pool = require('../db');

/**
 * GET /api/bookings
 * Devuelve todas las reservas en formato compatible con SheetDB.
 * El index.html espera: [{ key: "ivId|YYYY-MM-DD|HH:MM", name, email, at }]
 */
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        b.interviewer_id
          || '|' || TO_CHAR(s.slot_date, 'YYYY-MM-DD')
          || '|' || TO_CHAR(s.slot_time, 'HH24:MI')   AS key,
        b.candidate_name                               AS name,
        b.candidate_email                              AS email,
        b.booked_at                                    AS at
      FROM bookings b
      JOIN slots s ON s.id = b.slot_id
      ORDER BY s.slot_date, s.slot_time
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/bookings error:', err);
    res.status(500).json({ error: 'Error obteniendo reservas' });
  }
});

/**
 * POST /api/bookings
 * Crea una reserva nueva. Acepta el mismo body que se enviaba a SheetDB:
 * { key: "ivId|YYYY-MM-DD|HH:MM", name, email, at }
 *
 * El UNIQUE constraint en bookings.slot_id garantiza que no se dupliquen.
 */
router.post('/', async (req, res) => {
  const { key, name, email, at } = req.body;

  // Validaciones básicas
  if (!key || !name || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: key, name, email' });
  }

  const parts = key.split('|');
  if (parts.length !== 3) {
    return res.status(400).json({ error: 'El campo key debe tener formato: interviewer_id|YYYY-MM-DD|HH:MM' });
  }

  const [interviewer_id, slot_date, slot_time] = parts;

  try {
    // 1. Buscar el slot en la tabla
    const { rows: slotRows } = await pool.query(
      `SELECT id FROM slots
       WHERE interviewer_id = $1
         AND slot_date = $2
         AND TO_CHAR(slot_time, 'HH24:MI') = $3
         AND enabled = TRUE`,
      [interviewer_id, slot_date, slot_time]
    );

    if (slotRows.length === 0) {
      return res.status(404).json({ error: 'Slot no encontrado o no disponible' });
    }

    const slot_id = slotRows[0].id;

    // 2. Verificar que no esté ya reservado
    const { rows: existing } = await pool.query(
      'SELECT id FROM bookings WHERE slot_id = $1',
      [slot_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este horario ya fue reservado' });
    }

    // 3. Insertar la reserva
    await pool.query(
      `INSERT INTO bookings (interviewer_id, slot_id, candidate_name, candidate_email, booked_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        interviewer_id,
        slot_id,
        name.trim(),
        email.trim(),
        at ? new Date(at) : new Date(),
      ]
    );

    res.status(201).json({ created: 1 });
  } catch (err) {
    console.error('POST /api/bookings error:', err);
    // Código 23505 = violación de UNIQUE constraint (race condition)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este horario acaba de ser reservado por otro usuario' });
    }
    res.status(500).json({ error: 'Error al guardar la reserva' });
  }
});

module.exports = router;
