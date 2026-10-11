use std::env;

use anyhow::Context;

#[allow(dead_code)]
pub struct Config {
    pub database_url: String,
    pub kafka_bootstrap_servers: String,
    pub kafka_group_id: String,
    pub outbox_relay_enabled: bool,
}

impl Config {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            database_url: required("DATABASE_URL")?,
            kafka_bootstrap_servers: required("KAFKA_BOOTSTRAP_SERVERS")?,
            kafka_group_id: env::var("KAFKA_GROUP_ID").unwrap_or_else(|_| "bulk-processor".into()),
            outbox_relay_enabled: env::var("OUTBOX_RELAY_ENABLED")
                .map(|v| v != "false")
                .unwrap_or(true),
        })
    }
}

fn required(key: &str) -> anyhow::Result<String> {
    env::var(key).with_context(|| format!("{key} must be set"))
}
