#!/bin/bash
set -euo pipefail

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Cloning primary into $PGDATA"
  mkdir -p "$PGDATA"
  until PGPASSWORD="$REPLICATION_PASSWORD" pg_basebackup -h postgres -U replicator -D "$PGDATA" -R -X stream -P; do
    echo "Waiting for primary..."
    sleep 2
  done
  chmod 0700 "$PGDATA"
fi

exec postgres -c hot_standby=on
