# syntax=docker/dockerfile:1
FROM rust:1.99-slim-trixie AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential python3 zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/app/target \
    cargo build --release && cp target/release/bulk-processor /bulk-processor

FROM debian:trixie-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates zlib1g \
    && rm -rf /var/lib/apt/lists/* && useradd --system --uid 10001 app
COPY --from=build /bulk-processor /usr/local/bin/bulk-processor
USER app
ENTRYPOINT ["bulk-processor"]
