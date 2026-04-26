#!/bin/sh
set -e

echo "============================================"
echo "   Brew & Co. POS — Starting Up"
echo "============================================"

echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h "${POSTGRES_HOST:-db}" -p 5432 -U "${POSTGRES_USER:-postgres}" -q; do
  sleep 1
done
echo "✅ PostgreSQL is ready!"

echo "📦 Applying database schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "🌱 Seeding database..."
npx prisma db seed

echo "🚀 Starting Next.js on port 3000..."
exec npm start
