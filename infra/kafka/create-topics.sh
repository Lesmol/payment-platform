#!/bin/bash
set -euo pipefail

BOOTSTRAP="${KAFKA_BOOTSTRAP_SERVERS:-kafka:9092}"
KT=/opt/kafka/bin/kafka-topics.sh

create() {
  $KT --bootstrap-server "$BOOTSTRAP" --create --if-not-exists --topic "$1" --partitions "${2:-3}" --replication-factor 1
}

create user.events
create payments.received

# TODO: topic names still to be decided:
#   - payment made / confirmed / failed (payment-processor-service)
#   - bulk topic (payment-service -> bulk-processor), keyed by batch id
#   - bulk outcomes (bulk-processor)
#   - fraud verdicts (fraud-service, optional)

$KT --bootstrap-server "$BOOTSTRAP" --list
