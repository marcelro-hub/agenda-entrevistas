require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ──────────────────────────────────────────────────────────────────
// Frontend y backend viven en el mismo dominio de Vercel, así que CORS ya no
// es estrictamente necesario, pero se deja para permitir desarrollo local.
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests same-origin (sin header Origin) y desarrollo local
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

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz de cortesía (solo se ve al correr localmente; en Vercel "/" sirve index.html)
app.get('/', (_req, res) => {
  res.json({ message: 'Agenda Entrevistas API — OK' });
});

// ─── ERROR HANDLER ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no manejado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── INICIO ─────────────────────────────────────────────────────────────────
// En Vercel el archivo se importa como función serverless (no se llama .listen()).
// Local/Railway sí necesitan un servidor HTTP real escuchando un puerto.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
