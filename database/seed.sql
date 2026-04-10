-- ============================================================
-- Seed: Datos iniciales - Entrevistadores y Slots
-- Ejecutar después de schema.sql
-- ON CONFLICT DO NOTHING = seguro de correr más de una vez
-- ============================================================

-- ─── ENTREVISTADORES ────────────────────────────────────────
INSERT INTO interviewers (id, name, email, teams_link, initials, accent_color, bg_gradient, active) VALUES
(
  'julian',
  'Entrevistador 1',
  'julian@ingouvillenelson.com',
  'El enlace se va a enviar por Teams',
  'E1',
  '#1D4ED8',
  'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
  TRUE
),
(
  'noelia',
  'Entrevistador 2',
  'noelia@ingouvillenelson.com',
  'El enlace se va a enviar por Teams',
  'E2',
  '#C2410C',
  'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ─── SLOTS: JULIAN ─────────────────────────────────────────
-- Lunes 13: 1pm a 5pm (Max 3)
INSERT INTO slots (interviewer_id, slot_date, slot_time) VALUES
('julian', '2026-04-13', '13:00'),
('julian', '2026-04-13', '14:30'),
('julian', '2026-04-13', '16:00'),
-- Martes 14: 8am a 1pm (Max 3)
('julian', '2026-04-14', '08:30'),
('julian', '2026-04-14', '10:00'),
('julian', '2026-04-14', '11:30'),
-- Miércoles 15: 11am a 4pm (Max 4 — solo 1 disponible actualmente)
('julian', '2026-04-15', '11:00'),
-- Jueves 16: 8am a 10:30am (Max 2)
('julian', '2026-04-16', '08:00'),
('julian', '2026-04-16', '09:15'),
-- Viernes 17: 8:30 a 11:30 (Max 2)
('julian', '2026-04-17', '08:30'),
('julian', '2026-04-17', '10:00')
ON CONFLICT (interviewer_id, slot_date, slot_time) DO NOTHING;

-- ─── SLOTS: NOELIA ─────────────────────────────────────────
-- Martes 7: 8:30am a 11am (Max 2)
INSERT INTO slots (interviewer_id, slot_date, slot_time) VALUES
('noelia', '2026-04-07', '08:30'),
('noelia', '2026-04-07', '09:45'),
-- Miércoles 8: 9am a 4pm (Max 4)
('noelia', '2026-04-08', '09:00'),
('noelia', '2026-04-08', '11:00'),
('noelia', '2026-04-08', '13:30'),
('noelia', '2026-04-08', '15:00'),
-- Jueves 9: 11am a 4pm (Max 3)
('noelia', '2026-04-09', '11:00'),
('noelia', '2026-04-09', '13:00'),
('noelia', '2026-04-09', '14:30'),
-- Viernes 10: 8:30am a 11:30am (Max 2)
('noelia', '2026-04-10', '08:30'),
('noelia', '2026-04-10', '10:00'),
-- Lunes 13: 1pm a 5pm (Max 3)
('noelia', '2026-04-13', '13:00'),
('noelia', '2026-04-13', '14:30'),
('noelia', '2026-04-13', '16:00'),
-- Martes 14: 1pm a 5pm (Max 3)
('noelia', '2026-04-14', '13:00'),
('noelia', '2026-04-14', '14:30'),
('noelia', '2026-04-14', '16:00'),
-- Miércoles 15: 11am a 5pm (Max 4)
('noelia', '2026-04-15', '11:00'),
('noelia', '2026-04-15', '12:30'),
('noelia', '2026-04-15', '14:00'),
('noelia', '2026-04-15', '15:30'),
-- Jueves 16: 11am a 4pm (Max 3)
('noelia', '2026-04-16', '11:00'),
('noelia', '2026-04-16', '13:30'),
('noelia', '2026-04-16', '15:00'),
-- Viernes 17: 8:30 a 11:30 (Max 2)
('noelia', '2026-04-17', '08:30'),
('noelia', '2026-04-17', '10:00')
ON CONFLICT (interviewer_id, slot_date, slot_time) DO NOTHING;

-- ─── VERIFICACIÓN ────────────────────────────────────────────
-- Correr esto para confirmar que todo quedó bien:
-- SELECT interviewer_id, COUNT(*) FROM slots GROUP BY interviewer_id;
-- Debería mostrar: julian=11, noelia=26
