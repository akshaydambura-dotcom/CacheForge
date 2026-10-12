# CacheForge Deployment Guide

This guide outlines end-to-end production deployment for CacheForge on **Render**, including the C++ storage engine backend and the React/Vite developer web interface.

**Repository:** [https://github.com/akshaydambura-dotcom/CacheForge](https://github.com/akshaydambura-dotcom/CacheForge)

---

## 1. Production Architecture Overview

| Component | Technology | Render Host Type | Persistence Requirement |
| :--- | :--- | :--- | :--- |
| **Backend** | Docker, C++17, Node.js/Express | **Render Web Service** (Docker) | Persistent Disk (`/data`) on Starter+ plan, or ephemeral container storage on Free plan |
| **Frontend** | React 18, Vite SPA | **Render Static Site** | None (Global Edge CDN with SPA rewrites) |

---

## 2. Option A: Automated Deployment via Render Blueprint (`render.yaml`)

The repository includes a ready-to-use [`render.yaml`](../render.yaml) blueprint specification that declares both the backend Docker Web Service and frontend Static Site.

1. Navigate to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/akshaydambura-dotcom/CacheForge`.
4. Render detects `render.yaml` and provisions:
   - `cacheforge-backend` (Docker container with compiled C++17 binary & Express REST API).
   - `cacheforge-frontend` (Static Site with SPA rewrite rules and automatic backend connection).
5. Click **Apply**. Render will deploy both services in sequence.

---

## 3. Option B: Manual Deployment via Render Dashboard

If configuring services individually via the Render UI:

### Step 1: Deploy the Backend (Render Web Service)

1. Open [Render Dashboard](https://dashboard.render.com) and click **New +** $\rightarrow$ **Web Service**.
2. Select **Build and deploy from a Git repository** and pick `akshaydambura-dotcom/CacheForge`.
3. Configure service settings:
   - **Name:** `cacheforge-backend`
   - **Region:** Pick the region closest to you (e.g. Oregon, Frankfurt, Singapore).
   - **Branch:** `main`
   - **Root Directory:** Leave blank (defaults to repository root `.`).
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Docker Build Context:** `.` (root of repository, required because `CMakeLists.txt` and `src/` reside in the root).
4. **Plan Selection & Storage Persistence:**
   - **Free Plan:** Supported. Container storage is ephemeral (data resets when the container sleeps after 15 minutes of inactivity or upon restarts).
   - **Starter Plan ($7/mo):** Supports persistent disks. Under **Disks**, click **Add Persistent Disk**:
     - **Name:** `cacheforge-data`
     - **Mount Path:** `/data`
     - **Size:** `1 GB` (minimum)
5. **Health Check Path:**
   - Expand **Advanced** $\rightarrow$ **Health Check Path**: `/api/health`
6. **Environment Variables:**
   Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=8080
   CACHEFORGE_BIN=/app/build/cacheforge
   CACHEFORGE_DATA_DIR=/data/cacheforge
   CORS_ORIGIN=*
   ```
   *(You can restrict `CORS_ORIGIN` to your deployed frontend URL after creating the frontend).*
7. Click **Create Web Service**.
8. Wait for the Docker build to complete. Render compiles the C++17 engine and boots Express on port 8080.
9. Verify the backend URL:
   - `https://<your-backend-name>.onrender.com/api/health`
   - Output should return `{"status":"ok","engineAvailable":true,...}`.

---

### Step 2: Deploy the Frontend (Render Static Site)

1. Return to the [Render Dashboard](https://dashboard.render.com) and click **New +** $\rightarrow$ **Static Site**.
2. Connect `akshaydambura-dotcom/CacheForge`.
3. Configure the static site:
   - **Name:** `cacheforge-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables:**
   Add:
   ```env
   VITE_API_BASE_URL=https://<your-backend-name>.onrender.com
   ```
   *(Use your live backend URL from Step 1, without a trailing slash).*
5. **SPA Rewrites (Crucial for React Router Navigation):**
   Under **Redirects / Rewrites**, click **Add Rule**:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(This ensures direct navigation and refreshing on `/playground`, `/architecture`, `/docs`, and `/status` load properly without 404s).*
6. Click **Create Static Site**.
7. Render will install packages, build the Vite production bundle, and publish the static site on global Edge CDN.

---

## 4. Verification Checklist

After deploying both services, run these checks:

1. **Backend Health Check:**
   Visit `https://<backend-url>/api/health`.
   - Verify `status: "ok"` and `engineAvailable: true`.
2. **Backend Telemetry:**
   Visit `https://<backend-url>/api/info` and `https://<backend-url>/api/stats`.
3. **Frontend Connection:**
   Visit `https://<frontend-url>/playground`.
   - The status pill should display `Connected: Real C++ Engine` (Emerald green).
   - If the backend is spinning up or offline, a clear error banner appears: `BACKEND CONNECTION ERROR — C++ Storage Engine Unreachable` (not silent simulation).
4. **CRUD Execution:**
   - Execute `SET user:101 "Arjun Sharma"`.
   - Execute `GET user:101` $\rightarrow$ returns `"Arjun Sharma"`.
   - Execute `DELETE user:101` $\rightarrow$ removes key.
   - Run `BENCH` $\rightarrow$ evaluates 1,000 operations with live throughput.
5. **SPA Route Navigation:**
   - Visit `https://<frontend-url>/status`, `https://<frontend-url>/architecture`, and `https://<frontend-url>/docs`.
   - Press browser Refresh (`F5`) on each route; verify it reloads cleanly without 404 errors.

---

## 5. Local Development Reference

To run the complete full-stack environment locally:

```bash
# 1. Build C++ engine
mkdir build && cd build
cmake .. -G "MinGW Makefiles"   # or: cmake ..
cmake --build .
cd ..

# 2. Run Backend adapter
cd backend
npm install
node server.js

# 3. Run Frontend UI (in separate terminal)
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
