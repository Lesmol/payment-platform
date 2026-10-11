#!/bin/bash
set -euo pipefail

SERVICE_DBS="user_management account payment payment_processor notification fraud bulk_processor"

for db in $SERVICE_DBS; do
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
    CREATE ROLE $db LOGIN PASSWORD '${SERVICE_DB_PASSWORD}';
    CREATE DATABASE $db OWNER $db;
    REVOKE ALL ON DATABASE $db FROM PUBLIC;
SQL
done

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
  CREATE ROLE keycloak LOGIN PASSWORD '${KEYCLOAK_DB_PASSWORD}';
  CREATE DATABASE keycloak OWNER keycloak;
  REVOKE ALL ON DATABASE keycloak FROM PUBLIC;
SQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-SQL
  CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD '${REPLICATION_PASSWORD}';
SQL
echo "host replication replicator all scram-sha-256" >> "$PGDATA/pg_hba.conf"
