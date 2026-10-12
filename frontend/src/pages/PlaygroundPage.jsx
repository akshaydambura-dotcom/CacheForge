import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, Trash2, Search, PlusCircle, RefreshCw, Zap,
  CheckCircle2, AlertTriangle, Clock, HardDrive, ShieldCheck, Database,
  ArrowRight, Info
} from 'lucide-react';
import { api } from '../services/api';

export default function PlaygroundPage() {
  const [operation, setOperation] = useState('SET');
  const [key, setKey] = useState('user:101');
  const [value, setValue] = useState('Arjun Sharma');
  
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const [simStore, setSimStore] = useState({ 'demo:greeting': 'Hello from CacheForge!' });
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [stats, setStats] = useState(null);

  // Poll backend health
  const checkStatus = async () => {
    const health = await api.getHealth();
    const isConn = health.connected && health.data?.engineAvailable;
    setBackendConnected(isConn);
    if (!isConn) {
      setDemoMode(true);
    } else {
      setDemoMode(false);
      loadStats();
    }
  };

  const loadStats = async () => {
    const res = await api.getStats();
    if (res.success) {
      setStats(res.data);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleExecute = async (overrideOp = null, overrideKey = null, overrideVal = null) => {
    const op = overrideOp || operation;
    const k = overrideKey !== null ? overrideKey : key;
    const v = overrideVal !== null ? overrideVal : value;

    setLoading(true);
    setCurrentResult(null);

    let res;
    if (backendConnected && !demoMode) {
      // Execute against real C++ storage engine binary
      res = await api.executeCommand(op, k, v);
    } else {
      // Browser-only simulation fallback strictly labeled
      res = api.simulateCommand(simStore, op, k, v);
      setSimStore({ ...simStore });
    }

    setLoading(false);
    setCurrentResult(res);

    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      operation: op,
      key: k,
      value: v,
      isSimulated: res.isSimulated || (!backendConnected || demoMode),
      success: res.success,
      data: res.data,
      error: res.error,
      durationMs: res.data?.durationMs || null,
    };

    setHistory((prev) => [logEntry, ...prev.slice(0, 49)]);

    if (backendConnected && !demoMode) {
      loadStats();
    }
  };

  const handleBench = () => {
    handleExecute('BENCH', '', '');
  };

  const handleCompact = () => {
    handleExecute('COMPACT', '', '');
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentResult(null);
  };

  return (
    <div className="section-padding" style={{ minHeight: 'calc(100vh - 4.5rem)' }}>
      <div className="container">
        
        {/* Page Title & Status Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-emerald">Interactive REPL</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Target: C++17 Binary</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>CacheForge Playground</h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.25rem' }}>
              Execute live SET, GET, DELETE, BENCH, and COMPACT commands against the persistent storage engine.
            </p>
          </div>

          {/* Connection Status Badge */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            backgroundColor: backendConnected && !demoMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${backendConnected && !demoMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: backendConnected && !demoMode ? '#10b981' : '#f59e0b',
                boxShadow: backendConnected && !demoMode ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
              }} />
              <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                {backendConnected && !demoMode ? 'Connected: Real C++ Engine' : 'Offline: Browser Demo Mode'}
              </strong>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={checkStatus} 
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                title="Refresh backend status"
              >
                <RefreshCw size={12} />
                <span>Check Connection</span>
              </button>

              {backendConnected && (
                <button
                  onClick={() => setDemoMode(!demoMode)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', color: demoMode ? '#34d399' : '#fbbf24' }}
                >
                  {demoMode ? 'Switch to Real C++ Engine' : 'Switch to Demo Mode'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* DEMO MODE WARNING BANNER */}
        {(!backendConnected || demoMode) && (
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#fbbf24', fontSize: '0.92rem', display: 'block' }}>
                DEMO MODE — Browser-only simulation; not connected to the C++ engine.
              </strong>
              <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                The backend adapter is currently unreachable or set to demo mode. Operations will simulate in-memory without persistent binary disk writes until the backend is running.
              </span>
            </div>
          </div>
        )}

        {/* Main Grid: Control Panel + Terminal Output */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Left Column: Command Builder */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={20} color="#10b981" />
              <span>Command Dispatcher</span>
            </h3>

            {/* Operation Selector Tabs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.65rem' }}>
                Operation
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {['SET', 'GET', 'DELETE'].map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperation(op)}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: operation === op ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: operation === op ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                      color: operation === op ? '#34d399' : '#94a3b8',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Key {operation === 'SET' ? '(required)' : '(lookup target)'}
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. user:101 or session_token"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Indexed through 16-bucket HashIndex with separate chaining.
                </span>
              </div>

              {operation === 'SET' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem' }}>
                    Value (payload)
                  </label>
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. { name: 'Arjun', role: 'admin' }"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    Written into 4KB binary disk page with klen/vlen headers.
                  </span>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <button
              onClick={() => handleExecute()}
              disabled={loading || !key.trim() || (operation === 'SET' && !value.trim())}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginBottom: '1.5rem' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>Executing C++ Instruction...</span>
                </>
              ) : (
                <>
                  <Play size={18} />
                  <span>Execute {operation}</span>
                </>
              )}
            </button>

            {/* Engine Tools: BENCH and COMPACT */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
                Advanced Engine Directives
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  onClick={handleBench}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                >
                  <Zap size={16} color="#38bdf8" />
                  <span>Run BENCH (1K)</span>
                </button>
                <button
                  onClick={handleCompact}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                >
                  <RefreshCw size={16} color="#a855f7" />
                  <span>COMPACT DB</span>
                </button>
              </div>
            </div>

            {/* Sample Preset Buttons */}
            <div style={{ marginTop: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                Quick Presets:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[
                  { label: 'Set Student', op: 'SET', k: 'student:445', v: 'Sai Yashaswith' },
                  { label: 'Get Student', op: 'GET', k: 'student:445', v: '' },
                  { label: 'Delete Student', op: 'DELETE', k: 'student:445', v: '' },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setOperation(sample.op);
                      setKey(sample.k);
                      if (sample.v) setValue(sample.v);
                      handleExecute(sample.op, sample.k, sample.v);
                    }}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#cbd5e1',
                      cursor: 'pointer'
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Execution Result & Live Terminal History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Latest Result Card */}
            {currentResult && (
              <div className="card" style={{
                borderLeft: `4px solid ${currentResult.success ? '#10b981' : '#f43f5e'}`,
                backgroundColor: '#0c1320'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {currentResult.success ? (
                      <CheckCircle2 size={18} color="#10b981" />
                    ) : (
                      <AlertTriangle size={18} color="#f43f5e" />
                    )}
                    <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
                      {currentResult.success ? 'Operation Completed' : 'Operation Failed'}
                    </strong>
                  </div>
                  <span className={`badge ${currentResult.isSimulated ? 'badge-amber' : 'badge-emerald'}`}>
                    {currentResult.isSimulated ? 'SIMULATED RESULT' : 'LIVE C++ OUTPUT'}
                  </span>
                </div>

                {currentResult.success ? (
                  <div>
                    <p style={{ color: '#34d399', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {currentResult.data?.message || 'Execution OK'}
                    </p>
                    
                    {currentResult.data?.value !== undefined && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: '#070a10',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        color: currentResult.data.found ? '#38bdf8' : '#fb7185',
                        marginBottom: '0.5rem'
                      }}>
                        {currentResult.data.found ? (
                          <>
                            <span style={{ color: '#64748b' }}>Retrieved Value: </span>
                            {currentResult.data.value}
                          </>
                        ) : (
                          <span>KEY NOT FOUND in Storage Engine</span>
                        )}
                      </div>
                    )}

                    {currentResult.data?.durationMs && (
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={12} /> Execution time: {currentResult.data.durationMs}ms
                      </span>
                    )}

                    {currentResult.data?.benchmark && (
                      <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#070a10', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {currentResult.data.benchmark.map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: '#fb7185', fontSize: '0.9rem' }}>
                    {currentResult.error}
                  </p>
                )}
              </div>
            )}

            {/* Terminal History Window */}
            <div className="terminal-box">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="terminal-dot red" />
                  <span className="terminal-dot yellow" />
                  <span className="terminal-dot green" />
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  engine-session-log ({history.length} operations)
                </span>
                <button
                  onClick={clearHistory}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                  title="Clear history"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </div>

              <div className="terminal-body" style={{ minHeight: '320px', maxHeight: '420px', overflowY: 'auto' }}>
                {history.length === 0 ? (
                  <div style={{ color: '#475569', textAlign: 'center', padding: '3rem 0' }}>
                    <Terminal size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                    <p>No operations executed yet.</p>
                    <p style={{ fontSize: '0.78rem' }}>Run a command above to see real-time engine transaction logs.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div key={item.id} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        <span>[{item.timestamp}] {item.isSimulated ? '⚠️ SIMULATED' : '🟢 LIVE C++'}</span>
                        {item.durationMs && <span>{item.durationMs}ms</span>}
                      </div>

                      <div style={{ color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        <span style={{ color: '#10b981' }}>CacheForge&gt; </span>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{item.operation} </span>
                        {item.key && <span style={{ color: '#f1f5f9' }}>{item.key} </span>}
                        {item.value && <span style={{ color: '#f59e0b' }}>&quot;{item.value}&quot;</span>}
                      </div>

                      {item.success ? (
                        <div style={{ paddingLeft: '1rem', color: '#34d399', fontSize: '0.82rem' }}>
                          {item.data?.value !== undefined ? (
                            item.data.found ? `--> "${item.data.value}"` : '--> KEY NOT FOUND'
                          ) : (
                            `--> ${item.data?.status || 'OK'}`
                          )}
                        </div>
                      ) : (
                        <div style={{ paddingLeft: '1rem', color: '#fb7185', fontSize: '0.82rem' }}>
                          ERROR: {item.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Storage Disk Snapshot */}
            {stats && (
              <div className="card" style={{ padding: '1.25rem', backgroundColor: '#070d18' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HardDrive size={16} color="#10b981" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>Real Disk State (Verified from File System)</span>
                  </div>
                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Live FS</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Pages in DB</span>
                    <strong style={{ color: '#ffffff', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{stats.files?.db?.pageCount ?? 0}</strong>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Active Keys</span>
                    <strong style={{ color: '#38bdf8', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{stats.files?.index?.keyCount ?? 0}</strong>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>DB File Size</span>
                    <strong style={{ color: '#34d399', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{(stats.files?.db?.sizeBytes / 1024).toFixed(1)} KB</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
