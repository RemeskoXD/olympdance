FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy application source
COPY . .

# Build Vite static assets
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose default port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
