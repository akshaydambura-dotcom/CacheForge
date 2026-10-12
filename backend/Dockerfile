# -------------------------------------------------------------
# CacheForge Backend & C++ Storage Engine Container
# Multi-stage image compiling C++17 engine and running Express adapter
# -------------------------------------------------------------
FROM node:20-bookworm-slim AS base

# Install C++17 build prerequisites
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy C++ source files and CMake configuration
COPY CMakeLists.txt ./
COPY src/ ./src/

# Compile the C++ storage engine binary
RUN mkdir -p build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    cmake --build . --config Release

# Setup backend Node.js application
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./

# Create persistent storage directory mount point
RUN mkdir -p /data/cacheforge

# Configuration environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV CACHEFORGE_BIN=/app/build/cacheforge
ENV CACHEFORGE_DATA_DIR=/data/cacheforge

EXPOSE 8080

# Run Express API server
CMD ["node", "server.js"]
