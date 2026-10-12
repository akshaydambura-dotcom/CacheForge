import axios from 'axios';

// Resolve base URL from environment or fallback to current origin / proxy
const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
let cleanBase = rawBase.replace(/\/+$/, '');
if (cleanBase && !cleanBase.startsWith('http://') && !cleanBase.startsWith('https://') && !cleanBase.startsWith('/')) {
  cleanBase = cleanBase.includes('.') ? `https://${cleanBase}` : `https://${cleanBase}.onrender.com`;
}
const API_BASE = cleanBase;

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Return resolved base URL
  getBaseUrl() {
    return API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  },

  // Check backend health
  async getHealth() {
    try {
      const res = await client.get('/api/health');
      return { connected: true, data: res.data };
    } catch (err) {
      return { connected: false, error: err.message };
    }
  },

  // Get engine architecture and info
  async getInfo() {
    try {
      const res = await client.get('/api/info');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Get live engine storage stats
  async getStats() {
    try {
      const res = await client.get('/api/stats');
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Execute C++ engine command
  async executeCommand(operation, key = '', value = '') {
    try {
      const payload = { operation: operation.toUpperCase() };
      if (key) payload.key = key;
      if (value) payload.value = value;

      const res = await client.post('/api/command', payload);
      return {
        success: true,
        isSimulated: false,
        data: res.data,
      };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Execution error';
      return {
        success: false,
        isSimulated: false,
        error: errorMsg,
      };
    }
  },

  // In-memory simulation fallback strictly labeled if backend is offline
  simulateCommand(simStore, operation, key = '', value = '') {
    const op = operation.toUpperCase();
    const startTime = performance.now();

    if (op === 'SET') {
      if (!key || !value) {
        return {
          success: false,
          isSimulated: true,
          error: 'Key and Value are required for SET',
        };
      }
      simStore[key] = value;
      return {
        success: true,
        isSimulated: true,
        data: {
          success: true,
          operation: 'SET',
          key,
          value,
          status: 'OK',
          message: 'DEMO MODE — Browser-only simulation; not connected to the C++ engine.',
          durationMs: (performance.now() - startTime).toFixed(2),
        },
      };
    } else if (op === 'GET') {
      if (!key) {
        return {
          success: false,
          isSimulated: true,
          error: 'Key is required for GET',
        };
      }
      const val = simStore[key];
      return {
        success: true,
        isSimulated: true,
        data: {
          success: true,
          operation: 'GET',
          key,
          found: val !== undefined,
          value: val !== undefined ? val : null,
          message: val !== undefined
            ? 'DEMO MODE — Browser-only simulation; not connected to the C++ engine.'
            : 'DEMO MODE: KEY NOT FOUND in browser simulation',
          durationMs: (performance.now() - startTime).toFixed(2),
        },
      };
    } else if (op === 'DELETE') {
      if (!key) {
        return {
          success: false,
          isSimulated: true,
          error: 'Key is required for DELETE',
        };
      }
      delete simStore[key];
      return {
        success: true,
        isSimulated: true,
        data: {
          success: true,
          operation: 'DELETE',
          key,
          status: 'OK',
          message: 'DEMO MODE — Browser-only simulation; not connected to the C++ engine.',
          durationMs: (performance.now() - startTime).toFixed(2),
        },
      };
    }

    return {
      success: false,
      isSimulated: true,
      error: `Unsupported operation: ${op}`,
    };
  },
};
