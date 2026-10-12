const express = require('express');
const cors = require('cors');
const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Parse and validate port
const rawPort = process.env.PORT;
const PORT = rawPort && !isNaN(parseInt(rawPort, 10)) ? parseInt(rawPort, 10) : 8080;

// Resolve binary and data directory paths
const DEFAULT_BIN_WIN = path.resolve(__dirname, '../build/cacheforge.exe');
const DEFAULT_BIN_UNIX = path.resolve(__dirname, '../build/cacheforge');
const BIN_PATH = process.env.CACHEFORGE_BIN
  ? path.resolve(process.env.CACHEFORGE_BIN)
  : (process.platform === 'win32' ? DEFAULT_BIN_WIN : DEFAULT_BIN_UNIX);

// Resolve data directory: prioritize CACHEFORGE_DATA_DIR, then /data mount point if present, then ../data
const rawDataDir = process.env.CACHEFORGE_DATA_DIR;
let DATA_DIR;
if (rawDataDir && rawDataDir.trim().length > 0) {
  DATA_DIR = path.resolve(rawDataDir);
} else if (fs.existsSync('/data')) {
  DATA_DIR = '/data/cacheforge';
} else {
  DATA_DIR = path.resolve(__dirname, '../data');
}

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.error(`[CRITICAL] Failed to create data directory at ${DATA_DIR}:`, err.message);
}

// Security & Middleware (flexible CORS supporting *, single domain, or comma-separated list)
const corsOriginEnv = (process.env.CORS_ORIGIN || '*').trim();
const allowedOrigins = corsOriginEnv.includes(',')
  ? corsOriginEnv.split(',').map(s => s.trim().toLowerCase())
  : [corsOriginEnv.toLowerCase()];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOriginEnv === '*' || allowedOrigins.includes('*') || allowedOrigins.includes(origin.toLowerCase())) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

// Simple mutex queue to prevent race conditions on database binary files during concurrent requests
class CommandQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  enqueue(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processNext();
    });
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;
    const { fn, resolve, reject } = this.queue.shift();
    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      this.isProcessing = false;
      this.processNext();
    }
  }
}

const commandQueue = new CommandQueue();

// Helper to check if binary is available
function checkBinaryExists() {
  return fs.existsSync(BIN_PATH);
}

// Safe execution helper using argument array (no shell invocation)
function runEngine(args, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (!checkBinaryExists()) {
      return reject(new Error(`CacheForge executable not found at ${BIN_PATH}. Please compile the C++ engine first.`));
    }

    const env = {
      ...process.env,
      CACHEFORGE_DATA_DIR: DATA_DIR
    };

    const startTime = Date.now();
    execFile(BIN_PATH, args, { env, timeout: timeoutMs, windowsHide: true }, (error, stdout, stderr) => {
      const durationMs = Date.now() - startTime;
      if (error) {
        if (error.killed) {
          return reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }
        return reject(new Error(stderr || error.message || 'Execution error'));
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), durationMs });
    });
  });
}

// -------------------------------------------------------------
// GET /api/health
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  const binaryExists = checkBinaryExists();
  const dataDirExists = fs.existsSync(DATA_DIR);
  const isDiskMounted = DATA_DIR.startsWith('/data') && fs.existsSync('/data');

  res.json({
    status: binaryExists ? 'ok' : 'degraded',
    engineAvailable: binaryExists,
    binaryPath: BIN_PATH,
    dataDir: DATA_DIR,
    dataDirExists,
    isPersistentDisk: isDiskMounted,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// GET /api/info
// -------------------------------------------------------------
app.get('/api/info', (req, res) => {
  res.json({
    name: 'CacheForge',
    version: '1.0.0',
    tagline: 'Storage, engineered from within.',
    engine: 'C++17 Persistent Key-Value Storage Engine',
    inspiredBy: 'LevelDB & CMU 15-445',
    author: 'Sai Yashaswith Gunda (Original Author)',
    maintainedBy: 'Akshay Dambura',
    repository: 'https://github.com/akshaydambura-dotcom/CacheForge',
    architecture: {
      storageModel: 'Page-based persistent binary file layout',
      pageSizeBytes: 4096,
      indexing: 'Persistent Hash Index with Separate Chaining',
      hashBuckets: 16,
      caching: 'LRU Buffer Pool (eviction with dirty page writeback)',
      bufferPoolCapacity: 3,
      durability: 'Write-Ahead Log (WAL) with atomic append & PENDING/DONE protocol',
      crashRecovery: 'Automatic WAL replay on engine startup',
      spaceReclamation: 'Offline log compaction removing orphaned pages',
      checkpointInterval: 100
    },
    supportedCommands: [
      { name: 'SET', syntax: 'SET <key> <value>', description: 'Persists key-value pair through WAL and Buffer Pool' },
      { name: 'GET', syntax: 'GET <key>', description: 'Retrieves value using HashIndex and LRU cache lookup' },
      { name: 'DELETE', syntax: 'DELETE <key>', description: 'Removes key from index, evicts page, logs to WAL' },
      { name: 'BENCH', syntax: 'BENCH', description: 'Executes 1000 operation benchmark (SET vs Cache Miss vs Cache Hit)' },
      { name: 'COMPACT', syntax: 'COMPACT', description: 'Reclaims orphaned pages and rewrites live data' }
    ]
  });
});

// -------------------------------------------------------------
// GET /api/stats
// -------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  try {
    const dbFile = path.join(DATA_DIR, 'cacheforge.db');
    const indexFile = path.join(DATA_DIR, 'index.dat');
    const walFile = path.join(DATA_DIR, 'wal.log');

    const dbStats = fs.existsSync(dbFile) ? fs.statSync(dbFile) : null;
    const indexStats = fs.existsSync(indexFile) ? fs.statSync(indexFile) : null;
    const walStats = fs.existsSync(walFile) ? fs.statSync(walFile) : null;

    let keyCount = 0;
    const liveKeys = [];
    if (indexStats && fs.existsSync(indexFile)) {
      const content = fs.readFileSync(indexFile, 'utf8');
      const lines = content.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          keyCount++;
          if (liveKeys.length < 50) {
            liveKeys.push({ key: parts[0], pageId: parseInt(parts[1], 10) });
          }
        }
      }
    }

    const pageSize = 4096;
    const pageCount = dbStats ? Math.floor(dbStats.size / pageSize) : 0;

    let walLines = 0;
    if (walStats && fs.existsSync(walFile)) {
      const content = fs.readFileSync(walFile, 'utf8');
      walLines = content.split('\n').filter(l => l.trim().length > 0).length;
    }

    res.json({
      engineAvailable: checkBinaryExists(),
      dataDir: DATA_DIR,
      files: {
        db: {
          exists: !!dbStats,
          sizeBytes: dbStats ? dbStats.size : 0,
          pageCount,
          pageSizeBytes: pageSize
        },
        index: {
          exists: !!indexStats,
          sizeBytes: indexStats ? indexStats.size : 0,
          keyCount,
          sampleKeys: liveKeys
        },
        wal: {
          exists: !!walStats,
          sizeBytes: walStats ? walStats.size : 0,
          entryCount: walLines
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read engine statistics', details: err.message });
  }
});

// -------------------------------------------------------------
// POST /api/command
// -------------------------------------------------------------
app.post('/api/command', async (req, res) => {
  const { operation, key, value } = req.body || {};

  if (!operation || typeof operation !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid request: "operation" is required and must be a string.'
    });
  }

  const op = operation.trim().toUpperCase();
  const allowedOps = ['SET', 'GET', 'DELETE', 'BENCH', 'COMPACT'];

  if (!allowedOps.includes(op)) {
    return res.status(400).json({
      success: false,
      error: `Invalid operation: "${operation}". Allowed operations are: ${allowedOps.join(', ')}.`
    });
  }

  // Parameter validation
  const sanitizeKey = (k) => {
    if (typeof k !== 'string') return null;
    const trimmed = k.trim();
    if (!trimmed || trimmed.length > 512) return null;
    // Disallow whitespace or pipe character that would break the text-based index or WAL format
    if (/[\s|]/.test(trimmed)) return null;
    return trimmed;
  };

  const sanitizeValue = (v) => {
    if (typeof v !== 'string') return null;
    const trimmed = v.trim();
    if (!trimmed || trimmed.length > 32768) return null;
    // Disallow newline or pipe character
    if (/[\r\n|]/.test(trimmed)) return null;
    return trimmed;
  };

  let args = [op];

  if (op === 'SET') {
    const cleanKey = sanitizeKey(key);
    const cleanValue = sanitizeValue(value);
    if (!cleanKey) {
      return res.status(400).json({
        success: false,
        error: 'SET requires a non-empty "key" (alphanumeric/symbols without spaces or pipes, max 512 chars).'
      });
    }
    if (!cleanValue) {
      return res.status(400).json({
        success: false,
        error: 'SET requires a non-empty "value" (no newlines or pipes, max 32KB).'
      });
    }
    args.push(cleanKey, cleanValue);
  } else if (op === 'GET' || op === 'DELETE') {
    const cleanKey = sanitizeKey(key);
    if (!cleanKey) {
      return res.status(400).json({
        success: false,
        error: `${op} requires a valid "key" (alphanumeric/symbols without spaces or pipes).`
      });
    }
    args.push(cleanKey);
  }

  try {
    const result = await commandQueue.enqueue(() => runEngine(args));

    // Parse the engine response
    const outputLines = result.stdout.split('\n').map(l => l.trim()).filter(Boolean);
    // Filter out checkpoint messages like "[Checkpoint] Saving index snapshot..."
    const nonStatusLines = outputLines.filter(l => !l.startsWith('[Checkpoint]'));
    const primaryLine = nonStatusLines[0] || '';

    let parsedResponse = {
      success: true,
      operation: op,
      key: key || null,
      durationMs: result.durationMs,
      rawOutput: result.stdout
    };

    if (op === 'SET') {
      parsedResponse.status = primaryLine === 'OK' ? 'OK' : primaryLine;
      parsedResponse.message = `Key "${key}" successfully saved.`;
    } else if (op === 'GET') {
      if (primaryLine === 'KEY NOT FOUND') {
        parsedResponse.found = false;
        parsedResponse.value = null;
        parsedResponse.message = `Key "${key}" not found in storage engine.`;
      } else {
        parsedResponse.found = true;
        parsedResponse.value = primaryLine;
        parsedResponse.message = `Value retrieved for "${key}".`;
      }
    } else if (op === 'DELETE') {
      parsedResponse.status = primaryLine === 'OK' ? 'OK' : primaryLine;
      parsedResponse.message = `Key "${key}" removed from storage engine.`;
    } else if (op === 'BENCH') {
      parsedResponse.benchmark = outputLines.filter(l => l.includes('ops/sec') || l.includes('Benchmark Results'));
      parsedResponse.message = 'Benchmark completed successfully.';
    } else if (op === 'COMPACT') {
      parsedResponse.compaction = outputLines.filter(l => l.includes('Compaction') || l.includes('Live keys'));
      parsedResponse.message = 'Database compaction completed successfully.';
    }

    res.json(parsedResponse);
  } catch (err) {
    res.status(500).json({
      success: false,
      operation: op,
      error: err.message,
      engineAvailable: checkBinaryExists()
    });
  }
});

// Start server on 0.0.0.0 for containerized / Render environments
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`CacheForge Backend Adapter listening on 0.0.0.0:${PORT}`);
  console.log(`Engine binary: ${BIN_PATH}`);
  console.log(`Binary exists: ${checkBinaryExists()}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
