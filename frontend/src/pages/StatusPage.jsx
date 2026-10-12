import React, { useState, useEffect } from 'react';
import { 
  Activity, CheckCircle2, AlertTriangle, RefreshCw, HardDrive, 
  Database, ShieldCheck, Cpu, Clock, Layers, Folder, Terminal
} from 'lucide-react';
import { api } from '../services/api';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, iRes, sRes] = await Promise.all([
        api.getHealth(),
        api.getInfo(),
        api.getStats(),
      ]);

      setHealth(hRes);
      if (iRes.success) setInfo(iRes.data);
      if (sRes.success) setStats(sRes.data);
      if (!hRes.connected) {
        setError('Cannot connect to the CacheForge backend API. Is node server.js running?');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health?.connected && health?.data?.engineAvailable;

  return (
    <div className="section-padding">
      <div className="container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald">Diagnostics</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Real Engine Telemetry</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>System Health & Storage Dashboard</h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.25rem' }}>
              Real-time inspection of the C++ executable binary, binary database pages, persistent hash index, and WAL.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lastChecked && (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Updated: {lastChecked}
              </span>
            )}
            <button
              onClick={fetchAll}
              disabled={loading}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderRadius: '12px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isOnline ? (
              <CheckCircle2 size={28} color="#10b981" />
            ) : (
              <AlertTriangle size={28} color="#ef4444" />
            )}
            <div>
              <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block' }}>
                {isOnline ? 'C++ Storage Engine: Operational' : 'C++ Storage Engine: Disconnected / Degraded'}
              </strong>
              <span style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                {isOnline
                  ? `Binary connected at ${health?.data?.binaryPath}. Safe argument execution enabled.`
                  : error || 'The backend adapter is offline or could not find the compiled cacheforge executable.'}
              </span>
            </div>
          </div>

          <span className={`badge ${isOnline ? 'badge-emerald' : 'badge-rose'}`} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
            {isOnline ? '100% HEALTHY' : 'ACTION REQUIRED'}
          </span>
        </div>

        {/* 4 Overview Metrics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Database Pages</span>
              <HardDrive size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
              {stats?.files?.db?.pageCount ?? (isOnline ? 0 : '—')}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {stats?.files?.db?.sizeBytes ? `${stats.files.db.sizeBytes.toLocaleString()} bytes (4KB per page)` : 'File not initialized'}
            </span>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Indexed Live Keys</span>
              <Layers size={18} color="#38bdf8" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {stats?.files?.index?.keyCount ?? (isOnline ? 0 : '—')}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {stats?.files?.index?.sizeBytes ? `${stats.files.index.sizeBytes} bytes on disk (index.dat)` : 'Empty index'}
            </span>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>WAL File Size</span>
              <ShieldCheck size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
              {stats?.files?.wal?.sizeBytes !== undefined ? `${stats.files.wal.sizeBytes} B` : (isOnline ? '0 B' : '—')}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {stats?.files?.wal?.entryCount ?? 0} active un-truncated log entries
            </span>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Adapter Uptime</span>
              <Clock size={18} color="#fbbf24" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
              {health?.data?.uptimeSeconds !== undefined ? `${health.data.uptimeSeconds}s` : '—'}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Node.js Express bridge uptime
            </span>
          </div>

        </div>

        {/* Detailed Grid: Filesystem State + Subsystem Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* File Storage Breakdown */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Folder size={20} color="#10b981" />
              <span>Persistent Disk Files (Data Directory)</span>
            </h3>

            <div style={{ padding: '0.75rem 1rem', background: '#070a10', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span style={{ color: '#64748b' }}>CACHEFORGE_DATA_DIR: </span>
              {stats?.dataDir || health?.data?.dataDir || 'data/'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  name: 'cacheforge.db',
                  desc: 'Binary page heap storing 4KB raw page blocks',
                  file: stats?.files?.db,
                  unit: 'pages',
                  metric: stats?.files?.db?.pageCount ?? 0
                },
                {
                  name: 'index.dat',
                  desc: 'Serialized hash table bucket chains (key -> page_id)',
                  file: stats?.files?.index,
                  unit: 'keys',
                  metric: stats?.files?.index?.keyCount ?? 0
                },
                {
                  name: 'wal.log',
                  desc: 'Append-only write-ahead log for crash recovery',
                  file: stats?.files?.wal,
                  unit: 'entries',
                  metric: stats?.files?.wal?.entryCount ?? 0
                }
              ].map((f, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#ffffff', fontFamily: 'var(--font-mono)' }}>{f.name}</strong>
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                      {f.file?.exists ? `${f.file.sizeBytes} bytes` : 'Not Created'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Live Indexed Keys Table */}
            {stats?.files?.index?.sampleKeys && stats.files.index.sampleKeys.length > 0 && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'block', marginBottom: '0.5rem' }}>
                  Live Sample Keys in Index:
                </span>
                <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    <thead>
                      <tr style={{ color: '#64748b', textAlign: 'left' }}>
                        <th>Key</th>
                        <th>Mapped Page ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.files.index.sampleKeys.map((k, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ color: '#38bdf8', padding: '0.35rem 0' }}>{k.key}</td>
                          <td style={{ color: '#34d399', padding: '0.35rem 0' }}>Page #{k.pageId} (offset {k.pageId * 4096}B)</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Engine Parameters & Supported Operations */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={20} color="#38bdf8" />
              <span>Verified Engine Specifications</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Page Size</span>
                <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>4,096 Bytes (4KB)</strong>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>LRU Buffer Frames</span>
                <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>3 Pages</strong>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Hash Buckets</span>
                <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>16 Buckets</strong>
              </div>
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Checkpoint Sync</span>
                <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>Every 100 Ops</strong>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
              Supported Operations & Execution Protocols
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { name: 'SET', proto: 'POST /api/command', desc: 'Atomic WAL write -> Pin dirty page -> Update HashIndex -> Mark WAL DONE' },
                { name: 'GET', proto: 'POST /api/command', desc: 'HashIndex page_id lookup -> LRU buffer pool check -> DiskManager read fallback' },
                { name: 'DELETE', proto: 'POST /api/command', desc: 'WAL log -> HashIndex removal -> LRU buffer pool page eviction' },
                { name: 'BENCH', proto: 'POST /api/command', desc: 'Executes 1000 SETs, 1000 cache misses, and 1000 cache hits' },
                { name: 'COMPACT', proto: 'POST /api/command', desc: 'Collects active keys from index.dat and rewrites clean unfragmented files' },
              ].map((cmd, i) => (
                <div key={i} style={{ padding: '0.75rem', borderRadius: '6px', background: '#070a10', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{cmd.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>{cmd.proto}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{cmd.desc}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
