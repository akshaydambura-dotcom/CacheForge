import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Github, BookOpen, Terminal, Cpu, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#070a10', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '4rem 0 2rem 0', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Col 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                background: '#10b981',
                padding: '0.35rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={18} color="#041f14" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>CacheForge</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              A persistent, page-based key-value storage engine engineered from scratch in C++17 without external dependencies.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ShieldCheck size={16} color="#34d399" />
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Storage, engineered from within.</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
              <li><Link to="/" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>System Overview</Link></li>
              <li><Link to="/playground" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Interactive Playground</Link></li>
              <li><Link to="/architecture" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Architecture Explorer</Link></li>
              <li><Link to="/docs" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Engine Documentation</Link></li>
              <li><Link to="/status" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>Live Status & Metrics</Link></li>
            </ul>
          </div>

          {/* Col 3: Engine Architecture */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internals</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#94a3b8' }}>
              <li>Write-Ahead Log (WAL) Crash Recovery</li>
              <li>Page-Based File Format (4096B Slots)</li>
              <li>LRU Buffer Pool (Dirty Eviction Writeback)</li>
              <li>Persistent Hash Index (Separate Chaining)</li>
              <li>Offline Compaction Garbage Collection</li>
            </ul>
          </div>

          {/* Col 4: Academic & Open Source */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inspirations</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: '1.5' }}>
              Designed to master systems programming concepts from CMU 15-445 Database Systems & Google LevelDB.
            </p>
            <a
              href="https://github.com/akshaydambura-dotcom/CacheForge"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}
            >
              <Github size={16} />
              <span>GitHub Repository</span>
            </a>
          </div>

        </div>

        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.85rem',
          color: '#64748b'
        }}>
          <div>
            © {new Date().getFullYear()} CacheForge. Built with C++17, Express, React & Vite.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>Original Author: Sai Yashaswith Gunda</span>
            <span>Maintained by: <a href="https://github.com/akshaydambura-dotcom" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Akshay Dambura</a></span>
            <span>MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
