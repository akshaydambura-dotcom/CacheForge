import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Database, Terminal, Cpu, Zap, ShieldCheck, RefreshCw, Layers, 
  ArrowRight, Github, CheckCircle2, HardDrive, BarChart3, FileCode2,
  Box, Clock, GitBranch
} from 'lucide-react';

export default function LandingPage() {
  const performanceStats = [
    { op: 'SET (Disk + WAL)', speed: '~220 ops/sec', latency: '4.5 ms', desc: 'Atomic append to WAL + LRU cache write' },
    { op: 'GET (Cache Miss)', speed: '~200,000 ops/sec', latency: '0.005 ms', desc: 'HashIndex lookup + single 4KB disk page read' },
    { op: 'GET (Cache Hit)', speed: '~1,000,000 ops/sec', latency: '< 0.001 ms', desc: 'O(1) memory lookup from LRU buffer pool' },
  ];

  const features = [
    {
      icon: HardDrive,
      title: 'Persistent Page Storage',
      desc: 'Stores records inside 4KB fixed binary pages (cacheforge.db). Data survives system power-offs and restarts with zero data loss.',
      tag: 'OS & Storage'
    },
    {
      icon: ShieldCheck,
      title: 'Write-Ahead Logging (WAL)',
      desc: 'Atomically appends PENDING/DONE entries before executing memory mutations. Incomplete transactions are replayed automatically on reboot.',
      tag: 'ACID Durability'
    },
    {
      icon: Zap,
      title: 'LRU Buffer Pool',
      desc: '3-page in-memory LRU cache with dirty-page tracking. Evictions lazily write back to disk, delivering a 2,000x speedup on cache hits.',
      tag: 'Caching Engine'
    },
    {
      icon: Layers,
      title: 'Persistent Hash Index',
      desc: 'Custom 16-bucket hash table with separate chaining for collision resolution. Serializes to index.dat for instant startup lookups.',
      tag: 'Data Structures'
    },
    {
      icon: RefreshCw,
      title: 'Offline Log Compaction',
      desc: 'Discards obsolete and orphaned pages created during updates and deletes, rebuilding the physical database to active records only.',
      tag: 'Space Reclamation'
    },
    {
      icon: FileCode2,
      title: 'Zero External Dependencies',
      desc: 'Written in pure standard C++17 using standard library templates and OS filesystem primitives. No Boost, RocksDB, or third-party wrappers.',
      tag: 'Pure C++17'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 5rem 0',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 1rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '1.75rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              LevelDB-Inspired Storage Engine • C++17
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.25rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.5rem', maxWidth: '950px', margin: '0 auto 1.5rem auto' }}>
            Storage, engineered <span className="gradient-text">from within.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
            A persistent, page-based key-value storage engine engineered from scratch in C++ without external libraries. Features write-ahead logging, LRU buffer caching, hash indexing, and log compaction.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center', marginBottom: '3.5rem' }}>
            <Link to="/playground" className="btn btn-primary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <Terminal size={18} />
              <span>Explore Playground</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/architecture" className="btn btn-secondary" style={{ padding: '0.8rem 1.8rem', fontSize: '1rem' }}>
              <Cpu size={18} />
              <span>View Architecture</span>
            </Link>
            <a 
              href="https://github.com/akshaydambura-dotcom/CacheForge"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ padding: '0.8rem 1.6rem', fontSize: '1rem' }}
            >
              <Github size={18} />
              <span>GitHub Source</span>
            </a>
          </div>

          {/* Terminal Mockup Preview */}
          <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'left' }} className="terminal-box">
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>cacheforge-interactive-repl — C++17</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Binary Active</span>
            </div>
            <div className="terminal-body" style={{ minHeight: 'auto', padding: '1.5rem' }}>
              <p style={{ color: '#64748b', marginBottom: '0.65rem' }}># CacheForge v1.0 — Storage Engine Initialized</p>
              <p style={{ color: '#cbd5e1', marginBottom: '0.35rem' }}>
                <span style={{ color: '#10b981' }}>CacheForge&gt;</span> <span style={{ color: '#38bdf8' }}>SET</span> user:101 <span style={{ color: '#f59e0b' }}>&quot;Arjun Sharma&quot;</span>
              </p>
              <p style={{ color: '#34d399', marginBottom: '0.65rem', paddingLeft: '1rem' }}>OK  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>(WAL: PENDING → Dirty Page Pin → HashIndex Update → WAL: DONE)</span></p>
              
              <p style={{ color: '#cbd5e1', marginBottom: '0.35rem' }}>
                <span style={{ color: '#10b981' }}>CacheForge&gt;</span> <span style={{ color: '#38bdf8' }}>GET</span> user:101
              </p>
              <p style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.65rem', paddingLeft: '1rem' }}>
                &quot;Arjun Sharma&quot; <span style={{ color: '#10b981', fontSize: '0.8rem' }}>(Cache HIT — LRU Buffer Pool, 0.001ms)</span>
              </p>

              <p style={{ color: '#cbd5e1', marginBottom: '0.35rem' }}>
                <span style={{ color: '#10b981' }}>CacheForge&gt;</span> <span style={{ color: '#38bdf8' }}>BENCH</span>
              </p>
              <p style={{ color: '#94a3b8', paddingLeft: '1rem', fontSize: '0.82rem' }}>
                SET: 220 ops/sec | GET (miss): 200,000 ops/sec | GET (hit): 1,000,000 ops/sec <span style={{ color: '#34d399' }}>(2000x cache speedup)</span>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Performance Section */}
      <section className="section-padding" style={{ backgroundColor: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>Verified Benchmarks</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Engineered for Real-World Throughput</h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Benchmarked across 1,000 sequential and random operations. Buffer pool caching transforms disk I/O bottlenecks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {performanceStats.map((item, idx) => (
              <div key={idx} className="card card-glow" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '3px',
                  width: '100%',
                  background: idx === 2 ? '#10b981' : idx === 1 ? '#06b6d4' : '#6366f1'
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.15rem' }}>{item.op}</h3>
                  <span className="badge badge-emerald">{item.latency}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  {item.speed}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2.5rem', padding: '1.25rem 1.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={22} color="#10b981" />
              <div>
                <strong style={{ color: '#ffffff' }}>2,000x Acceleration Factor</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>Buffer pool hits eliminate disk reads and system calls entirely via LRU memory pointers.</p>
              </div>
            </div>
            <Link to="/playground" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              Run Benchmark Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>Core Capabilities</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Storage Engine Anatomy</h2>
            <p style={{ color: '#94a3b8', maxWidth: '650px', margin: '0 auto' }}>
              Every component is implemented from scratch to mirror foundational database design patterns.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="card card-glow">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981'
                    }}>
                      <Icon size={22} />
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{feat.tag}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>{feat.title}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Preview Teaser */}
      <section className="section-padding" style={{ backgroundColor: '#090d16', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-amber" style={{ marginBottom: '0.75rem' }}>Internal Mechanics</span>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: '1.25' }}>
                How Writes & Reads Flow Through CacheForge
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                When you execute a <code style={{ color: '#38bdf8' }}>SET key value</code>, CacheForge first writes a <code style={{ color: '#f59e0b' }}>PENDING</code> entry to the Write-Ahead Log. It allocates a 4KB slot in the Page layer, pins it in the LRU Buffer Pool, updates the in-memory Hash Index, and logs <code style={{ color: '#10b981' }}>DONE</code>.
              </p>
              
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Crash-resilient recovery via WAL log replay on boot</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#cbd5e1', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Separate chaining hash index for fast O(1) page resolution</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#10b981', fontSize: '0.95rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Dirty page writeback prevents premature disk I/O</span>
                </li>
              </ul>

              <Link to="/architecture" className="btn btn-primary">
                <span>Explore Full Architecture</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="card" style={{ padding: '2rem', backgroundColor: '#070a10', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Data Flow Diagram</span>
                <span className="badge badge-emerald">Verified In C++</span>
              </div>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                color: '#38bdf8',
                lineHeight: 1.5,
                overflowX: 'auto',
                padding: '0.5rem 0'
              }}>
{`+-------------------------------+
|     HTTP API / REPL CLI       |
+-------------------------------+
                |
                v
+-------------------------------+
|         StorageEngine         |
+-------------------------------+
   /            |             \\
  v             v              v
HashIndex      WAL      BufferPool (LRU)
 (chaining)  (PENDING/DONE)  (3-page capacity)
  \\             |             /
   \\            |            /
    v           v           v
+-------------------------------+
|          DiskManager          |
+-------------------------------+
                |
                v
       [ cacheforge.db ]
       [   index.dat   ]
       [    wal.log    ]`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Callout */}
      <section className="section-padding">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.75rem' }}>Technology Stack</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }}>Built with Robust Technologies</h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {[
              { name: 'C++17', role: 'Storage Engine Core', color: '#60a5fa' },
              { name: 'CMake 3.15+', role: 'Build Orchestration', color: '#f87171' },
              { name: 'MinGW-w64 / GCC', role: 'Native Compiler', color: '#34d399' },
              { name: 'Node.js & Express', role: 'Safe API Adapter', color: '#4ade80' },
              { name: 'React 18 & Vite', role: 'Frontend UI', color: '#38bdf8' },
              { name: 'Docker', role: 'Container Runtime', color: '#818cf8' },
            ].map((tech, idx) => (
              <div key={idx} style={{
                padding: '1rem 1.5rem',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '160px'
              }}>
                <span style={{ fontWeight: 700, color: tech.color, fontSize: '1.1rem' }}>{tech.name}</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>{tech.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{
        padding: '4rem 0',
        backgroundColor: '#0c1322',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Test the Real Storage Engine Today</h2>
          <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Interact with the live compiled C++ executable, inspect persistent database files, and run throughput benchmarks.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/playground" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
              Launch Interactive Playground
            </Link>
            <Link to="/docs" className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }}>
              Read Engineering Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
