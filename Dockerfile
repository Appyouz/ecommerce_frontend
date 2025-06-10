# -------- STAGE 1: Build the app --------
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml first
COPY package.json pnpm-lock.yaml ./

# Install dependencies (including devDependencies for build step)
RUN pnpm install --frozen-lockfile

# Copy rest of the code
COPY . .

# Build the Next.js app
RUN pnpm run build

# -------- STAGE 2: Production image --------
FROM node:18-alpine AS runner

# Install pnpm
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy only the necessary files from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start the Next.js app in production mode
CMD ["pnpm", "run", "start"]
