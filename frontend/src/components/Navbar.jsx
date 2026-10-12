import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Database, Terminal, Cpu, BookOpen, Activity, Github, Menu, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [engineStatus, setEngineStatus] = useState({ connected: false, loading: true });

  const navLinks = [
    { name: 'Overview', path: '/', icon: Database },
    { name: 'Playground', path: '/playground', icon: Terminal },
    { name: 'Architecture', path: '/architecture', icon: Cpu },
    { name: 'Documentation', path: '/docs', icon: BookOpen },
    { name: 'Engine Status', path: '/status', icon: Activity },
  ];

  const checkHealth = async () => {
    const res = await api.getHealth();
    setEngineStatus({ connected: res.connected && res.data?.engineAvailable, loading: false });
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(16,185,129,0.3)'
          }}>
            <Database size={22} color="#041f14" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>CacheForge</span>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>v1.0 C++</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: 0, letterSpacing: '0.01em' }}>Storage, engineered from within.</p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none', gap: '0.5rem', alignItems: 'center' }} className="md-flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#34d399' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="md-flex">
          {/* Health Pill */}
          <Link
            to="/status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: engineStatus.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: engineStatus.connected ? '#34d399' : '#f87171',
              border: `1px solid ${engineStatus.connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              textDecoration: 'none'
            }}
            title="Click to check engine status"
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: engineStatus.connected ? '#10b981' : '#ef4444',
              boxShadow: engineStatus.connected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
            }}></span>
            <span>{engineStatus.connected ? 'Engine Online (C++)' : 'Engine Offline'}</span>
          </Link>

          {/* GitHub Link */}
          <a
            href="https://github.com/akshaydambura-dotcom/CacheForge"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Github size={16} />
            <span>GitHub</span>
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div style={{ display: 'flex' }} className="mobile-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#0d131f',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  color: isActive ? '#34d399' : '#cbd5e1',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                }}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/status"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: engineStatus.connected ? '#34d399' : '#f87171'
              }}
            >
              {engineStatus.connected ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{engineStatus.connected ? 'C++ Engine Connected' : 'C++ Engine Disconnected'}</span>
            </Link>
            <a
              href="https://github.com/akshaydambura-dotcom/CacheForge"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <Github size={18} />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>
      )}

      {/* CSS helper for responsive display */}
      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
