# backend/Dockerfile

# Use official Node.js 18 image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Copy the rest of your backend code
COPY . .

# Expose backend port (make sure it matches .env/BACKEND_PORT)
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
