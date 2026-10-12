import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PlaygroundPage from './pages/PlaygroundPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DocsPage from './pages/DocsPage';
import StatusPage from './pages/StatusPage';

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0a0e17' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
