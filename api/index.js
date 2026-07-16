// Vercel invoca este archivo como función serverless. Reexporta la app
// de Express ya existente en server/index.js (sin duplicar lógica).
module.exports = require('../server/index.js');
