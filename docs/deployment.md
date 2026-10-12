# CacheForge Deployment Guide

This guide outlines deployment procedures for both the CacheForge React frontend and the C++ engine backend adapter.

---

## 1. Architecture Split

| Component | Technology | Recommended Host | Persistence Requirement |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite SPA | **Vercel** / **Netlify** / **Cloudflare Pages** | None (Static Edge CDN) |
| **Backend** | Docker, C++17, Express | **Render** / **Fly.io** / **Railway** | Persistent Disk Mount (`/data/cacheforge`) |

---

## 2. Deploying the Backend (Render / Docker)

Because CacheForge contains a compiled C++17 engine that persists data to disk files (`*.db`, `*.dat`, `*.log`), the backend must run on a platform that supports Docker containers and persistent disk storage.

### Option A: Render (Web Service + Persistent Disk)
1. Fork or push the CacheForge repository to your GitHub account:
   `https://github.com/akshaydambura-dotcom/CacheForge`
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repository.
4. Set the following build options:
   - **Environment:** Docker
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Context:** `.` (root of the repository)
5. Under **Disks**, add a Persistent Disk:
   - **Name:** `cacheforge-data`
   - **Mount Path:** `/data/cacheforge`
   - **Size:** 1 GB (or as needed)
6. Under **Environment Variables**, configure:
   ```env
   NODE_ENV=production
   PORT=8080
   CACHEFORGE_BIN=/app/build/cacheforge
   CACHEFORGE_DATA_DIR=/data/cacheforge
   CORS_ORIGIN=*
   ```
7. Click **Create Web Service**. Render will:
   - Build the C++ engine via `cmake` and `g++`.
   - Install backend dependencies.
   - Start the Express server on port 8080.
8. Copy your backend service URL: `https://cacheforge-backend.onrender.com`.

### Option B: Docker Compose (Self-Hosted / VPS)
To deploy on any Linux VPS (Ubuntu, Debian, AWS EC2, DigitalOcean):
```bash
git clone https://github.com/akshaydambura-dotcom/CacheForge.git
cd CacheForge

# Start all containers in detached mode
docker compose up -d --build

# Verify running services
docker compose ps
docker compose logs -f
```

---

## 3. Deploying the Frontend (Vercel / Netlify)

### Option A: Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your repository.
3. Configure the Project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. In **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://cacheforge-backend.onrender.com
   ```
   *(Replace with your live Render backend URL)*
5. Click **Deploy**.

### Option B: Netlify
1. Log in to [Netlify](https://netlify.com) and click **Add new site** > **Import an existing project**.
2. Select your GitHub repository.
3. Configure Build Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. Under **Site configuration** > **Environment variables**, add:
   ```env
   VITE_API_BASE_URL=https://cacheforge-backend.onrender.com
   ```
5. Click **Deploy Site**.

---

## 4. Local Development

To run the complete stack locally:

### Step 1: Build C++ Storage Engine
```bash
mkdir build
cd build
cmake .. -G "MinGW Makefiles"   # On Windows
# or: cmake ..                  # On Linux / macOS
cmake --build .
cd ..
```

### Step 2: Start Backend API Adapter
```bash
cd backend
npm install
node server.js
```
The backend starts listening on `http://localhost:8080`.

### Step 3: Start Frontend Dev Server
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. Vite automatically proxies `/api` requests to `http://localhost:8080`.
