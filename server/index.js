require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ──────────────────────────────────────────────────────────────────
// Permite llamadas desde GitHub Pages y desde localhost (para desarrollo)
const ALLOWED_ORIGINS = [
  'https://marcelro-hub.github.io',   // GitHub Pages (producción)
  'http://localhost:3000',             // Desarrollo local
  'http://127.0.0.1:5500',            // VS Code Live Server
  'http://localhost:5500',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(express.json());

// Log de requests en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use('/api/interviewers',  require('./routes/interviewers'));
app.use('/api/bookings',      require('./routes/bookings'));
app.use('/api/focus-groups',  require('./routes/focusGroups'));

// ─── RUTA TEMPORAL PARA CREAR TABLAS ─────────────────────────────────────────
app.get('/api/setup-focus-groups', async (req, res) => {
  const pool = require('./db');
  try {
    // 1. Crear las tablas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS focus_groups (
          id          SERIAL      PRIMARY KEY,
          name        TEXT        NOT NULL,
          group_date  DATE        NOT NULL,
          start_time  TIME        NOT NULL,
          end_time    TIME        NOT NULL,
          max_slots   INTEGER     NOT NULL DEFAULT 9,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS focus_group_registrations (
          id                SERIAL      PRIMARY KEY,
          focus_group_id    INTEGER     NOT NULL REFERENCES focus_groups(id) ON DELETE CASCADE,
          slot_number       INTEGER     NOT NULL CHECK (slot_number BETWEEN 1 AND 9),
          participant_name  TEXT        NOT NULL,
          participant_email TEXT        NOT NULL,
          registered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(focus_group_id, slot_number)
      );

      CREATE INDEX IF NOT EXISTS idx_fg_reg_group ON focus_group_registrations(focus_group_id);
    `);

    // 2. Insertar los grupos si la tabla está vacía
    const check = await pool.query('SELECT COUNT(*) FROM focus_groups');
    if (parseInt(check.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO focus_groups (name, group_date, start_time, end_time, max_slots) VALUES
          ('Grupo 1', '2026-04-24', '09:30', '11:00', 9),
          ('Grupo 2', '2026-04-24', '14:00', '15:30', 9),
          ('Grupo 3', '2026-04-27', '09:00', '10:30', 9),
          ('Grupo 4', '2026-04-27', '14:00', '15:30', 9),
          ('Grupo 5', '2026-04-28', '09:00', '10:30', 9),
          ('Grupo 6', '2026-04-29', '09:00', '10:30', 9);
      `);
      res.send('✅ Tablas creadas y 6 grupos focales insertados correctamente en la base de datos.');
    } else {
      res.send('✅ Las tablas ya existían y ya tienen grupos registrados (no se sobrescribieron).');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error al configurar la base de datos: ' + err.message);
  }
});

// Health check — Railway lo usa para saber si el servicio está vivo
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz de cortesía
app.get('/', (_req, res) => {
  res.json({ message: 'Agenda Entrevistas API — OK' });
});

// ─── ERROR HANDLER ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── INICIO ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
});
