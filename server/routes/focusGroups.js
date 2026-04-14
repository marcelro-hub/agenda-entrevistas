const router = require('express').Router();
const pool = require('../db');

/**
 * GET /api/focus-groups
 * Devuelve los 6 grupos focales con los números de slot ocupados.
 * NO devuelve nombres ni emails de participantes (privacidad).
 *
 * Respuesta:
 * [
 *   {
 *     id: 1, name: "Grupo 1", group_date: "2026-04-24",
 *     start_time: "09:30", end_time: "11:00", max_slots: 9,
 *     occupied_slots: [1, 3, 5]
 *   }, ...
 * ]
 */
router.get('/', async (req, res) => {
  try {
    // 1. Traer todos los grupos
    const { rows: groups } = await pool.query(
      `SELECT id, name,
              TO_CHAR(group_date, 'YYYY-MM-DD') AS group_date,
              TO_CHAR(start_time, 'HH24:MI')    AS start_time,
              TO_CHAR(end_time,   'HH24:MI')    AS end_time,
              max_slots
       FROM focus_groups
       ORDER BY group_date, start_time`
    );

    // 2. Traer todas las inscripciones (solo slot_number, NO nombres)
    const { rows: regs } = await pool.query(
      `SELECT focus_group_id, slot_number
       FROM focus_group_registrations
       ORDER BY focus_group_id, slot_number`
    );

    // 3. Mapear slots ocupados a cada grupo
    const regMap = {};
    regs.forEach(({ focus_group_id, slot_number }) => {
      if (!regMap[focus_group_id]) regMap[focus_group_id] = [];
      regMap[focus_group_id].push(slot_number);
    });

    const result = groups.map(g => ({
      ...g,
      occupied_slots: regMap[g.id] || [],
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /api/focus-groups error:', err);
    res.status(500).json({ error: 'Error obteniendo grupos focales' });
  }
});

/**
 * GET /api/focus-groups/:id/registrations
 * (Admin) Devuelve los integrantes de un grupo focal específico.
 */
router.get('/:id/registrations', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT slot_number, participant_name, participant_email, registered_at
       FROM focus_group_registrations
       WHERE focus_group_id = $1
       ORDER BY slot_number`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/focus-groups/:id/registrations error:', err);
    res.status(500).json({ error: 'Error obteniendo inscripciones' });
  }
});

/**
 * POST /api/focus-groups/:id/register
 * Inscribe a un participante en un slot específico de un grupo focal.
 * Body: { slot_number: 1-9, name: "...", email: "..." }
 */
router.post('/:id/register', async (req, res) => {
  const groupId = parseInt(req.params.id);
  const { slot_number, name, email } = req.body;

  // Validaciones
  if (!name || !email || !slot_number) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: slot_number, name, email' });
  }

  const slotNum = parseInt(slot_number);
  if (isNaN(slotNum) || slotNum < 1 || slotNum > 9) {
    return res.status(400).json({ error: 'slot_number debe estar entre 1 y 9' });
  }

  try {
    // 1. Verificar que el grupo existe
    const { rows: groupRows } = await pool.query(
      'SELECT id, max_slots FROM focus_groups WHERE id = $1',
      [groupId]
    );

    if (groupRows.length === 0) {
      return res.status(404).json({ error: 'Grupo focal no encontrado' });
    }

    // 2. Verificar que el slot no está ocupado
    const { rows: existing } = await pool.query(
      'SELECT id FROM focus_group_registrations WHERE focus_group_id = $1 AND slot_number = $2',
      [groupId, slotNum]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Este espacio ya fue tomado por otra persona' });
    }

    // 3. Insertar la inscripción
    await pool.query(
      `INSERT INTO focus_group_registrations (focus_group_id, slot_number, participant_name, participant_email)
       VALUES ($1, $2, $3, $4)`,
      [groupId, slotNum, name.trim(), email.trim()]
    );

    res.status(201).json({ created: 1 });
  } catch (err) {
    console.error('POST /api/focus-groups/:id/register error:', err);
    // Código 23505 = violación de UNIQUE constraint (race condition)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este espacio acaba de ser tomado por otra persona' });
    }
    res.status(500).json({ error: 'Error al registrar inscripción' });
  }
});

module.exports = router;
