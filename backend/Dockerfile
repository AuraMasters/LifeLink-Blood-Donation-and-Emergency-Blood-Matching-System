FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose default backend port
EXPOSE 8000

ENV PORT=8000
ENV NODE_ENV=production

# Start the Express server
CMD ["node", "server.js"]
