FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm install

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
