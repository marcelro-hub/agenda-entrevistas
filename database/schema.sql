-- ============================================================
-- Schema: Agenda de Entrevistas - PostgreSQL
-- Ejecutar UNA sola vez al crear la base de datos en Railway
-- ============================================================

-- Tabla 1: Entrevistadores
-- Reemplaza el objeto INTERVIEWERS hardcodeado en index.html
CREATE TABLE IF NOT EXISTS interviewers (
    id           TEXT        PRIMARY KEY,          -- "julian", "noelia"
    name         TEXT        NOT NULL,             -- "Entrevistador 1"
    email        TEXT        NOT NULL,
    teams_link   TEXT,
    initials     TEXT        NOT NULL,             -- "E1", "E2"
    accent_color TEXT        NOT NULL DEFAULT '#1D4ED8',
    bg_gradient  TEXT,
    active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla 2: Slots de disponibilidad
-- Reemplaza los arrays de horarios hardcodeados por fecha y entrevistador
CREATE TABLE IF NOT EXISTS slots (
    id              SERIAL  PRIMARY KEY,
    interviewer_id  TEXT    NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
    slot_date       DATE    NOT NULL,
    slot_time       TIME    NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE(interviewer_id, slot_date, slot_time)   -- Evita duplicados
);

CREATE INDEX IF NOT EXISTS idx_slots_interviewer ON slots(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_slots_date        ON slots(slot_date);

-- Tabla 3: Reservas
-- Reemplaza los datos de SheetDB (columnas: key, name, email, at)
-- UNIQUE en slot_id garantiza que un slot solo pueda reservarse UNA vez (a nivel DB)
CREATE TABLE IF NOT EXISTS bookings (
    id               SERIAL      PRIMARY KEY,
    interviewer_id   TEXT        NOT NULL REFERENCES interviewers(id),
    slot_id          INTEGER     NOT NULL UNIQUE REFERENCES slots(id),
    candidate_name   TEXT        NOT NULL,
    candidate_email  TEXT        NOT NULL,
    booked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_interviewer ON bookings(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_slot        ON bookings(slot_id);

-- ============================================================
-- Tabla 4: Grupos Focales
-- Cada grupo tiene fecha, horario y capacidad máxima de 9
-- ============================================================
CREATE TABLE IF NOT EXISTS focus_groups (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,             -- "Grupo 1", "Grupo 2"...
    group_date  DATE        NOT NULL,
    start_time  TIME        NOT NULL,             -- 09:30
    end_time    TIME        NOT NULL,             -- 11:00
    max_slots   INTEGER     NOT NULL DEFAULT 9,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla 5: Inscripciones a Grupos Focales
-- UNIQUE(focus_group_id, slot_number) garantiza que un slot solo pueda tomarse UNA vez
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
