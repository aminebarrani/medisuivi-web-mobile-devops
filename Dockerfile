# ─── MediSuivi Patient Mobile (React Native / Expo) Dockerfile ───────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source and assets
COPY . .

# Expo Metro bundler & web ports
EXPOSE 8081 19000 19001 19002

# Start Expo with web support
CMD ["npx", "expo", "start", "--web"]
