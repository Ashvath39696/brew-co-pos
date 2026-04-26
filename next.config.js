/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do not use standalone here so Prisma's native binaries stay accessible at runtime

  // Suppress Prisma "DATABASE_URL not found" errors during Next.js static page generation.
  // All API routes are dynamic (λ) so this is safe — they only run at request time.
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
