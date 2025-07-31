# ---- Stage 1: runtime (Bun has built-in TypeScript support)
FROM oven/bun:1.2 AS base

# Set working directory
WORKDIR /app

# Copy dependency descriptors first for cached install
COPY package.json bun.lock* tsconfig.json drizzle.config.ts ./

# Install dependencies (production only)
# RUN bun install --production

RUN bun install

# Copy source code
COPY src ./src

# Expose app port
EXPOSE 3031

# Default command
CMD ["bun", "run", "src/app.ts"] 