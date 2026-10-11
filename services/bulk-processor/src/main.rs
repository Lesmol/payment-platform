mod config;
mod inbox;
mod outbox;

use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::from_filename(".env.local").ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = config::Config::from_env()?;
    tracing::info!(group_id = %config.kafka_group_id, "bulk-processor starting");

    // TODO: connect to Postgres, run migrations, start the bulk-topic consumer and the outbox relay.

    tokio::signal::ctrl_c().await?;
    tracing::info!("bulk-processor stopping");
    Ok(())
}
