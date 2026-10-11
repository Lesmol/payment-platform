CREATE TABLE outbox
(
  id           BIGSERIAL PRIMARY KEY,
  event_id     UUID        NOT NULL UNIQUE,
  topic        TEXT        NOT NULL,
  message_key  TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,
  payload      JSONB       NOT NULL,
  headers      JSONB,
  status       TEXT        NOT NULL DEFAULT 'PENDING',
  retry_count  INT         NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX outbox_pending_idx ON outbox (id) WHERE status = 'PENDING';

CREATE TABLE users
(
  id         UUID PRIMARY KEY,
  role       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
