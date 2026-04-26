#!/bin/sh
set -e

echo "============================================"
echo "   Brew & Co. POS — Starting Up"
echo "============================================"

# pg_isready wait is only needed in Docker Compose mode where POSTGRES_HOST
# is explicitly set to the service name 'db'.
# On Render, the DB is a managed external service (accessed via DATABASE_URL)
# and is always reachable before the web service starts — no wait needed.
if [ -n "$POSTGRES_HOST" ] && command -v pg_isready > /dev/null 2>&1; then
  echo "⏳ Waiting for PostgreSQL at ${POSTGRES_HOST}..."
  until pg_isready -h "${POSTGRES_HOST}" -p 5432 -U "${POSTGRES_USER:-postgres}" -q; do
    sleep 1
  done
  echo "✅ PostgreSQL is ready!"
else
  echo "✅ Using external PostgreSQL via DATABASE_URL"
fi

echo "📦 Applying database schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding database..."
npx prisma db seed

# Respect PORT env var — Render injects this (typically 10000).
# Docker Compose sets no PORT so it falls back to 3000.
echo "🚀 Starting Next.js on port ${PORT:-3000}..."
exec node_modules/.bin/next start -p "${PORT:-3000}"
