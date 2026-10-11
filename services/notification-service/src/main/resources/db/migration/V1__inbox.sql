CREATE TABLE inbox (
  event_id    UUID PRIMARY KEY,
  topic       TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
