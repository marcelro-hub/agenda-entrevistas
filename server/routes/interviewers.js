const router = require('express').Router();
const pool = require('../db');

/**
 * GET /api/interviewers
 * Devuelve todos los entrevistadores activos con sus slots de disponibilidad.
 * El formato de respuesta es compatible con el objeto INTERVIEWERS del index.html.
 *
 * Respuesta: { [id]: { id, name, email, teamsLink, initials, accentColor, bgGradient, slots: { "YYYY-MM-DD": ["HH:MM", ...] } } }
 */
router.get('/', async (req, res) => {
  try {
    const { rows: ivRows } = await pool.query(
      `SELECT id, name, email, teams_link, initials, accent_color, bg_gradient
       FROM interviewers
       WHERE active = TRUE
       ORDER BY created_at`
    );

    const { rows: slotRows } = await pool.query(
      `SELECT
         s.interviewer_id,
         TO_CHAR(s.slot_date, 'YYYY-MM-DD') AS slot_date,
         TO_CHAR(s.slot_time, 'HH24:MI')    AS slot_time
       FROM slots s
       WHERE s.enabled = TRUE
       ORDER BY s.slot_date, s.slot_time`
    );

    // Construir objeto indexado por id (mismo formato que el INTERVIEWERS hardcodeado)
    const result = {};
    ivRows.forEach(iv => {
      result[iv.id] = {
        id:          iv.id,
        name:        iv.name,
        email:       iv.email,
        teamsLink:   iv.teams_link,
        initials:    iv.initials,
        accentColor: iv.accent_color,
        bgGradient:  iv.bg_gradient,
        slots: {},
      };
    });

    slotRows.forEach(({ interviewer_id, slot_date, slot_time }) => {
      if (!result[interviewer_id]) return;
      if (!result[interviewer_id].slots[slot_date]) {
        result[interviewer_id].slots[slot_date] = [];
      }
      result[interviewer_id].slots[slot_date].push(slot_time);
    });

    res.json(result);
  } catch (err) {
    console.error('GET /api/interviewers error:', err);
    res.status(500).json({ error: 'Error obteniendo entrevistadores' });
  }
});

module.exports = router;
