# -------------------------------------------------------------
# CacheForge Frontend Build & Nginx Production Container
# -------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . ./
RUN npm run build

# Production web server stage
FROM nginx:alpine

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Provide SPA routing configuration
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
