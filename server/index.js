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

// ─── RUTAS ──────────────────────────────────────────────────────────────────
app.use('/api/interviewers', require('./routes/interviewers'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/focal',        require('./routes/focal'));

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
