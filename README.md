# CacheForge

> **"Storage, engineered from within."**

[![Repository](https://img.shields.io/badge/GitHub-akshaydambura--dotcom%2FCacheForge-10b981?logo=github)](https://github.com/akshaydambura-dotcom/CacheForge)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![C++17](https://img.shields.io/badge/C%2B%2B-17-00599C?logo=c%2B%2B)](https://en.cppreference.com/w/cpp/17)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org)

**Repository:** [https://github.com/akshaydambura-dotcom/CacheForge](https://github.com/akshaydambura-dotcom/CacheForge)<br />
**Maintainer:** [Akshay Dambura](https://github.com/akshaydambura-dotcom)<br />
**Original Author:** [Sai Yashaswith Gunda](https://github.com/saiyashaswithgunda-code/CacheForge)

---

## Overview

CacheForge is an educational, high-performance persistent key-value storage engine engineered from scratch in **C++17** without external library dependencies, paired with a modern **Node.js/Express** backend adapter and an interactive **React/Vite** developer web dashboard and REPL playground.

The project explores low-level database systems internals by implementing:
- **Binary Page Storage** (4096-byte slot framing).
- **Write-Ahead Logging (WAL)** for crash recovery and ACID durability.
- **LRU Buffer Pool** with dirty-page writeback eviction.
- **Persistent Hash Indexing** with 16-bucket separate chaining.
- **Offline Log Compaction** to reclaim orphaned pages and minimize disk footprint.

---

## System Architecture

```text
+--------------------------------------------------------------+
|                 CLIENT LAYER / WEB PLAYGROUND                |
|           React 18 SPA + Terminal REPL Interface             |
+--------------------------------------------------------------+
                               |
                               | HTTP (JSON REST API)
                               v
+--------------------------------------------------------------+
|                    BACKEND ADAPTER LAYER                     |
|         Node.js / Express — Safe CLI Argument Bridge         |
+--------------------------------------------------------------+
                               |
                               | Safe Process Execution (execFile)
                               v
+--------------------------------------------------------------+
|                   C++17 STORAGE ENGINE CORE                  |
+--------------------------------------------------------------+
               |                               |
               | (ACID Durability)             | (O(1) Lookups)
               v                               v
    +--------------------+           +--------------------+
    | Write-Ahead Log    |           | Hash Index         |
    | (PENDING/DONE WAL) |           | (16-bucket Chains) |
    +--------------------+           +--------------------+
               |                               |
               \                               /
                \                             /
                 v                           v
              +---------------------------------+
              |         LRU Buffer Pool         |
              |   3-page cache with dirty bits  |
              +---------------------------------+
                               |
                               | (4096-byte slot writes)
                               v
              +---------------------------------+
              |           DiskManager           |
              |     Binary Page File Layout     |
              +---------------------------------+
                               |
                               v
                  [ data/cacheforge.db ]
                  [ data/index.dat     ]
                  [ data/wal.log       ]
```

### Core Subsystems

1. **C++17 Storage Engine Core (`src/`):**
   - **`DiskManager`:** Manages fixed 4096-byte binary page files with direct file offset calculations (`offset = page_id * 4096`).
   - **`Page`:** Handles binary byte serialization and deserialization of key-value payloads.
   - **`HashIndex`:** Persistent hash table with 16 buckets and separate chaining linked lists for $O(1)$ key-to-page resolution, snapshotting to `index.dat`.
   - **`WAL` (Write-Ahead Log):** Appends `PENDING` and `DONE` log entries to `wal.log` prior to mutating in-memory structures or writing to disk. Replays incomplete transactions automatically upon boot.
   - **`BufferPool`:** In-memory LRU cache holding 3 frames with dirty-bit eviction writeback to protect disk throughput.
   - **`StorageEngine`:** Orchestrates query routing, checkpoints, and offline database compaction.

2. **Backend Adapter Layer (`backend/`):**
   - Express server providing a safe JSON REST bridge (`POST /api/command`, `GET /api/stats`, `GET /api/health`, `GET /api/info`).
   - Executes engine commands safely via `execFile` without raw shell expansion.
   - Inspects binary file sizes, page counts, and indexed keys for real-time telemetry.

3. **Frontend Developer UI (`frontend/`):**
   - Modern React 18 single-page application bundled with Vite.
   - Interactive terminal REPL playground simulating engine commands with real-time feedback.
   - System architecture visualizer, live engine health telemetry, and documentation viewer.

---

## Supported Commands

| Command | Syntax | Description |
| :--- | :--- | :--- |
| **`SET`** | `SET <key> <value>` | Persists key-value pair through WAL, writes 4KB page, pins in LRU cache, and updates index. |
| **`GET`** | `GET <key>` | Resolves `page_id` via HashIndex; returns value from LRU cache (or reads from disk on cache miss). |
| **`DELETE`** | `DELETE <key>` | Logs transaction to WAL, purges entry from HashIndex, and unpins/evicts page from BufferPool. |
| **`BENCH`** | `BENCH` | Runs 1,000 operation benchmark measuring throughput for SETs, cache misses, and cache hits. |
| **`COMPACT`** | `COMPACT` | Scans `index.dat`, garbage-collects orphaned pages, and rewrites the database heap to active data only. |
| **`HELP`** | `HELP` | Prints the complete list of supported commands and argument syntax. |
| **`EXIT`** | `EXIT` | Closes REPL shell, performs dirty page flush, commits index snapshot, and exits safely. |

---

## Performance Characteristics

Benchmarked on 1,000 sequential operations:

| Operation | Throughput | Latency | Architecture Subsystem |
| :--- | :--- | :--- | :--- |
| **SET** | ~220 ops/sec | ~4.5 ms | WAL append + buffer pool pin |
| **GET (Cache Miss)** | ~200,000 ops/sec | 0.005 ms | HashIndex lookup + 4KB disk seek |
| **GET (Cache Hit)** | **~1,000,000 ops/sec** | < 0.001 ms | LRU Buffer Pool memory lookup |

> Cache hits are **~2,000x faster** than disk writes, demonstrating the power of LRU memory caching.

---

## Project Structure

```text
CacheForge/
├── src/                          # C++17 Storage Engine Core
│   ├── page.h / page.cpp         # 4KB binary page framing
│   ├── disk_manager.h / .cpp     # Binary file seek and slot I/O
│   ├── hash_index.h / .cpp       # 16-bucket separate chaining index
│   ├── wal.h / .cpp              # Write-ahead logging & crash recovery
│   ├── buffer_pool.h / .cpp      # LRU cache with dirty page writeback
│   ├── storage_engine.h / .cpp   # Engine orchestrator & compaction
│   └── main.cpp                  # CLI REPL & argument dispatcher
├── backend/                      # HTTP API Adapter
│   ├── server.js                 # Express server with execFile bridge
│   ├── package.json              # Node.js dependencies & test scripts
│   ├── Dockerfile                # Production Docker image (C++ build + Node)
│   └── test_runner.js            # Automated integration test suite
├── frontend/                     # Modern React Developer Web UI
│   ├── src/
│   │   ├── components/           # Navbar, Footer
│   │   ├── pages/                # Landing, Playground, Architecture, Docs, Status
│   │   ├── services/api.js       # Live API client with simulation fallback
│   │   ├── App.jsx               # Client-side router
│   │   ├── main.jsx              # React 18 DOM mount
│   │   └── index.css             # Dark charcoal theme styling
│   ├── package.json              # Vite & React dependencies
│   ├── vite.config.js            # Build config & local API proxy
│   └── Dockerfile                # Nginx production image
├── docs/                         # Detailed Technical Documentation
│   ├── architecture.md           # Engineering deep-dive & algorithms
│   └── deployment.md             # Vercel, Netlify, Render & Docker guide
├── data/                         # Persistent Database Directory (Git-ignored)
│   ├── cacheforge.db             # Binary page storage
│   ├── index.dat                 # Hash index serialization
│   └── wal.log                   # Write-ahead log
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git ignore specifications
├── docker-compose.yml            # Multi-container orchestration
├── CMakeLists.txt                # C++ CMake configuration
├── LICENSE                       # MIT License
└── README.md                     # Project documentation
```

---

## Local Setup & Quick Start

### 1. Prerequisites
- **C++17 compiler:** `g++` / MinGW-w64 / Clang / MSVC
- **CMake:** 3.15 or newer
- **Node.js:** 18.x or newer & `npm`

### 2. Build the C++ Storage Engine
```bash
# Clone the repository
git clone https://github.com/akshaydambura-dotcom/CacheForge.git
cd CacheForge

# Build binary
mkdir build
cd build
cmake .. -G "MinGW Makefiles"   # Windows (MinGW)
# or: cmake ..                  # Linux / macOS
cmake --build .
cd ..
```

### 3. Run the C++ CLI Directly
```bash
# Interactive REPL mode:
./build/cacheforge

# One-shot command execution:
./build/cacheforge SET user:1 "Alice"
./build/cacheforge GET user:1
./build/cacheforge DELETE user:1
./build/cacheforge BENCH
./build/cacheforge COMPACT
```

### 4. Start the Backend API Adapter
```bash
cd backend
npm install
node server.js
```
The backend starts listening on `http://localhost:8080`.

### 5. Start the Frontend Web Interface
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. Vite proxies `/api` calls directly to `http://localhost:8080`.

---

## Running Tests

### 1. Backend Integration Tests
An automated test suite tests health endpoints, info metadata, SET/GET/DELETE operations, telemetry stats, and illegal input validation:
```bash
cd backend
npm test
# Or: node test_runner.js
```

### 2. Frontend Production Build Verification
To ensure all React components, icons, and Vite configurations compile with zero errors:
```bash
cd frontend
npm run build
```

### 3. C++ Storage Engine Benchmark
Run the built-in C++ benchmark to evaluate write throughput and LRU cache hit latency:
```bash
./build/cacheforge BENCH
```

---

## Docker Deployment

To build and run the entire stack (compiled C++ engine, Node adapter, and static React frontend) in isolated containers:

```bash
docker compose up -d --build
```
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:8080`
- **Data Persistence:** Managed via named Docker volume `cacheforge_data` mounted at `/data/cacheforge`.

---

## Render Deployment Instructions

Because CacheForge contains a compiled C++17 engine that manages binary disk files (`*.db`, `*.dat`, `*.log`), the backend must run as a containerized web service with persistent storage.

### 1. Backend on Render (Web Service + Persistent Disk)
1. Push your repository to GitHub: `https://github.com/akshaydambura-dotcom/CacheForge`.
2. Go to [Render Dashboard](https://dashboard.render.com) and click **New +** $\rightarrow$ **Web Service**.
3. Connect your repository (`akshaydambura-dotcom/CacheForge`).
4. Configure the service settings:
   - **Name:** `cacheforge-backend`
   - **Language / Environment:** `Docker`
   - **Dockerfile Path:** `backend/Dockerfile`
   - **Docker Context Directory:** `.` (root directory)
5. Under **Disks**, click **Add Persistent Disk**:
   - **Name:** `cacheforge-data`
   - **Mount Path:** `/data/cacheforge`
   - **Size:** `1 GB` (or desired capacity)
6. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=8080
   CACHEFORGE_BIN=/app/build/cacheforge
   CACHEFORGE_DATA_DIR=/data/cacheforge
   CORS_ORIGIN=*
   ```
7. Click **Create Web Service**. Render builds the C++ engine via `cmake` inside the container and boots the Express server.
8. Note your public backend URL (e.g. `https://cacheforge-backend.onrender.com`).

### 2. Frontend on Vercel / Netlify
1. Import `akshaydambura-dotcom/CacheForge` on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add the environment variable:
   ```env
   VITE_API_BASE_URL=https://cacheforge-backend.onrender.com
   ```
5. Deploy the application.

---

## Attribution & License

- **Original Engine Author:** Sai Yashaswith Gunda ([Original Upstream Repository](https://github.com/saiyashaswithgunda-code/CacheForge))
- **Maintainer & Enhancements:** Akshay Dambura ([Personal Repository](https://github.com/akshaydambura-dotcom/CacheForge))
- **License:** Released under the [MIT License](LICENSE).

### Academic Inspirations
- [CMU 15-445 Database Systems](https://15445.courses.cs.cmu.edu)
- [Google LevelDB](https://github.com/google/leveldb)
- [Let's Build a Simple Database](https://cstack.github.io/db_tutorial)