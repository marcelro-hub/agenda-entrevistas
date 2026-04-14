-- ============================================================
-- Seed: Insertar los 6 Grupos Focales
-- Ejecutar UNA sola vez después de crear las tablas
-- Todos los horarios en hora de Bolivia (UTC-4)
-- ============================================================

INSERT INTO focus_groups (name, group_date, start_time, end_time, max_slots) VALUES
  ('Grupo 1', '2026-04-24', '09:30', '11:00', 9),
  ('Grupo 2', '2026-04-24', '14:00', '15:30', 9),
  ('Grupo 3', '2026-04-27', '09:00', '10:30', 9),
  ('Grupo 4', '2026-04-27', '14:00', '15:30', 9),
  ('Grupo 5', '2026-04-28', '09:00', '10:30', 9),
  ('Grupo 6', '2026-04-29', '09:00', '10:30', 9);
