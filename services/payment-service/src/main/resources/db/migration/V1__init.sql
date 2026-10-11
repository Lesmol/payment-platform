CREATE TABLE outbox
(
  id           BIGSERIAL PRIMARY KEY,
  event_id     UUID        NOT NULL UNIQUE,
  topic        TEXT        NOT NULL,
  message_key  TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,
  payload      JSONB       NOT NULL,
  headers      JSONB,
  status       TEXT        NOT NULL DEFAULT 'PENDING', -- PENDING / PROCESSED (FAILED proposed)
  retry_count  INT         NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX outbox_pending_idx ON outbox (id) WHERE status = 'PENDING';

CREATE TABLE inbox
(
  event_id    UUID PRIMARY KEY,
  topic       TEXT        NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bulk_payments
(
  id                  UUID PRIMARY KEY,
  batch_id            UUID        NOT NULL,
  payment_type        TEXT        NOT NULL,
  to_account_number   INTEGER     NOT NULL,
  from_account_number INTEGER     NOT NULL,
  amount              INTEGER     NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
)
CREATE INDEX bulk_payments_batch_idx ON bulk_payments (batch_id);

CREATE TABLE bulk_payment_batch
(
  id          UUID PRIMARY KEY,
  user_id     UUID        NOT NULL,
  batch_count INTEGER     NOT NULL,
  batch_value INTEGER     NOT NULL,
  status      TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
)
CREATE INDEX bulk_payments_user_idx ON bulk_payment_batch (user_id);
