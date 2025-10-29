# frontend/Dockerfile

# Use node image for build
FROM node:18-alpine as build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Copy all app files
COPY . .

# Build static assets
RUN npm run build

# Use nginx for serving static files
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
