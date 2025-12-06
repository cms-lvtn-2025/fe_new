# FE_main Dockerfile - Next.js
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Builder stage
FROM node:20-alpine AS builder

WORKDIR /app

# Use placeholders for runtime replacement
ENV NEXT_PUBLIC_GRAPHQL_ENDPOINT=__NEXT_PUBLIC_GRAPHQL_ENDPOINT__
ENV NEXT_PUBLIC_BACKEND_URL=__NEXT_PUBLIC_BACKEND_URL__
ENV NEXT_PUBLIC_TINYMCE_API_KEY=__NEXT_PUBLIC_TINYMCE_API_KEY__
ENV NEXT_TELEMETRY_DISABLED=1

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set ownership
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["/app/entrypoint.sh"]
