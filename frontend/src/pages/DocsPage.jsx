import React, { useState } from 'react';
import { 
  BookOpen, Terminal, HardDrive, ShieldCheck, Zap, Layers, RefreshCw, 
  AlertCircle, Copy, Check, ChevronRight, Code2
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'overview', title: '1. Project Overview' },
    { id: 'problem', title: '2. Problem Statement' },
    { id: 'architecture', title: '3. Architecture & Data Flow' },
    { id: 'commands', title: '4. Supported CLI Commands' },
    { id: 'build', title: '5. Build & Compilation' },
    { id: 'storage', title: '6. Page-Based Storage Design' },
    { id: 'wal', title: '7. WAL & Crash Recovery' },
    { id: 'indexing', title: '8. Hash Indexing & Chaining' },
    { id: 'buffer_pool', title: '9. LRU Buffer Pool & Eviction' },
    { id: 'compaction', title: '10. Space Compaction' },
    { id: 'limitations', title: '11. Technical Limitations' },
  ];

  return (
    <div className="section-padding">
      <div className="container">
        
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge badge-indigo" style={{ marginBottom: '0.5rem' }}>Technical Specification</span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>CacheForge Engineering Documentation</h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', marginTop: '0.25rem' }}>
            Complete architectural manual, storage engine design patterns, build instructions, and recovery guarantees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Sticky Sidebar Navigation */}
          <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '5.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>
              Table of Contents
            </span>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      color: activeSection === s.id ? '#34d399' : '#94a3b8',
                      backgroundColor: activeSection === s.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      fontWeight: activeSection === s.id ? 600 : 400,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{s.title}</span>
                    <ChevronRight size={14} color={activeSection === s.id ? '#10b981' : '#475569'} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Documentation Content Articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            
            {/* 1. Overview */}
            <article id="overview" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>1. Project Overview</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                <strong>CacheForge</strong> is an embedded, persistent key-value storage engine engineered from scratch in C++17, inspired by the architecture of Google LevelDB and academic principles from Carnegie Mellon University's CMU 15-445 Database Systems.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
                Unlike toy in-memory hash maps or simple JSON stores, CacheForge addresses the fundamental challenges of persistent database engines: how to organize byte streams into structured pages, how to manage volatile memory against disk bandwidth, how to ensure crash recovery, and how to resolve hash collisions efficiently.
              </p>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <strong style={{ color: '#34d399' }}>Core Philosophy:</strong>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Zero third-party library dependencies. Implemented exclusively with standard C++17 library types (<code style={{ color: '#38bdf8' }}>std::list</code>, <code style={{ color: '#38bdf8' }}>std::unordered_map</code>, <code style={{ color: '#38bdf8' }}>std::fstream</code>, <code style={{ color: '#38bdf8' }}>std::filesystem</code>).
                </p>
              </div>
            </article>

            {/* 2. Problem Statement */}
            <article id="problem" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>2. Problem Statement</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                Modern enterprise applications require high-throughput read operations while demanding guarantees that committed writes will never be lost if power fails mid-transaction.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                Naïve disk I/O causes two critical failures:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <li style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#fca5a5', fontSize: '0.9rem' }}>
                  <strong>Data Corruption on Crash:</strong> If an update process crashes while writing halfway through a binary page, the file header is ruined and unrecoverable.
                </li>
                <li style={{ padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', color: '#fcd34d', fontSize: '0.9rem' }}>
                  <strong>Disk I/O Bottlenecks:</strong> Synchronous random disk seeks for every GET request reduce throughput from millions of operations per second down to mere hundreds.
                </li>
              </ul>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7' }}>
                CacheForge solves this dual challenge by pairing an append-only Write-Ahead Log (WAL) with an in-memory LRU Buffer Pool and a persistent Hash Index.
              </p>
            </article>

            {/* 3. Architecture */}
            <article id="architecture" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>3. Architecture & Data Flow</h2>
              <div className="terminal-box" style={{ marginBottom: '1.5rem' }}>
                <div className="terminal-body" style={{ minHeight: 'auto', padding: '1rem', fontSize: '0.8rem', color: '#38bdf8' }}>
{`+---------------+
|   REPL / API  |
+---------------+
        |
        v
+---------------+
| StorageEngine |  <--- Orchestrator: routes calls, handles checkpoints
+---------------+
   /    |    \\
  v     v     v
 [WAL] [LRU] [HashIndex]
    \\   |   /
     v  v  v
  [DiskManager]
        |
        v
  [data/*.db]`}
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#ffffff' }}>Write Execution Flow (SET key value)</h3>
              <ol style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: '1.8', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                <li><strong style={{ color: '#f8fafc' }}>WAL Append:</strong> Writes <code style={{ color: '#f59e0b' }}>SET|key|val|PENDING</code> to <code style={{ color: '#38bdf8' }}>wal.log</code> and executes immediate flush.</li>
                <li><strong style={{ color: '#f8fafc' }}>Slot Allocation:</strong> DiskManager allocates a new 4096-byte page slot (<code style={{ color: '#38bdf8' }}>allocateNewPage()</code>).</li>
                <li><strong style={{ color: '#f8fafc' }}>Binary Page Serialization:</strong> Packs key length (int), key string, val length (int), and val string into Page.</li>
                <li><strong style={{ color: '#f8fafc' }}>Buffer Pool Pinning:</strong> Inserts page into LRU buffer pool and marks <code style={{ color: '#f59e0b' }}>is_dirty = true</code>.</li>
                <li><strong style={{ color: '#f8fafc' }}>Hash Index Registration:</strong> Updates bucket chain in HashIndex with key mapping to page_id.</li>
                <li><strong style={{ color: '#f8fafc' }}>WAL Confirmation:</strong> Appends <code style={{ color: '#10b981' }}>SET|key|val|DONE</code> to <code style={{ color: '#38bdf8' }}>wal.log</code> and flushes.</li>
              </ol>
            </article>

            {/* 4. Supported Commands */}
            <article id="commands" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>4. Supported CLI Commands</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#34d399' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Command</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Arguments</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Behavior</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#cbd5e1' }}>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>SET</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>&lt;key&gt; &lt;val&gt;</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Writes through WAL, writes into 4KB page, pins in LRU cache, updates index.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>GET</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>&lt;key&gt;</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Resolves page_id from HashIndex; loads via LRU cache (or disk miss).</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>DELETE</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>&lt;key&gt;</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Logs WAL PENDING/DONE, purges key from HashIndex, evicts page from buffer pool.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>BENCH</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>none</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Executes 1000 SETs, 1000 cache misses, and 1000 cache hits; measures ops/sec.</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>COMPACT</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>none</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Scans index, garbage-collects orphaned pages, rewrites database to active data only.</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>HELP / EXIT</td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>none</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>Prints command list or triggers clean shutdown checkpoint.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            {/* 5. Build Instructions */}
            <article id="build" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>5. Build & Compilation</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                CacheForge builds with CMake 3.15+ and any standard C++17 compliant compiler (GCC/MinGW, Clang, or MSVC).
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', display: 'block', marginBottom: '0.5rem' }}>
                  Windows (MinGW-w64 Makefiles / Ninja)
                </span>
                <div className="terminal-box">
                  <div className="terminal-body" style={{ minHeight: 'auto', padding: '1rem', fontSize: '0.82rem' }}>
                    mkdir build<br />
                    cd build<br />
                    cmake .. -G &quot;MinGW Makefiles&quot;<br />
                    cmake --build .<br />
                    .\cacheforge.exe
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#60a5fa', display: 'block', marginBottom: '0.5rem' }}>
                  Linux / macOS
                </span>
                <div className="terminal-box">
                  <div className="terminal-body" style={{ minHeight: 'auto', padding: '1rem', fontSize: '0.82rem' }}>
                    mkdir build<br />
                    cd build<br />
                    cmake ..<br />
                    cmake --build .<br />
                    ./cacheforge
                  </div>
                </div>
              </div>
            </article>

            {/* 6. Page-Based Storage Design */}
            <article id="storage" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>6. Page-Based Storage Design</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                The physical storage layer operates on fixed-size <strong>4096-byte (4KB) pages</strong>.
              </p>
              <div className="terminal-box" style={{ marginBottom: '1rem' }}>
                <div className="terminal-body" style={{ minHeight: 'auto', padding: '1rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
{`+----------------+------------------+----------------+--------------------+
| klen (4 bytes) | key string bytes | vlen (4 bytes) | value string bytes |
+----------------+------------------+----------------+--------------------+
0                4                  4 + klen         8 + klen             (up to 4096)`}
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: '1.7' }}>
                DiskManager maps each logical <code style={{ color: '#38bdf8' }}>page_id</code> to its physical byte offset via <code style={{ color: '#38bdf8' }}>offset = page_id * 4096</code>, utilizing seek operations for constant-time random page access.
              </p>
            </article>

            {/* 7. WAL and Recovery */}
            <article id="wal" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>7. WAL & Crash Recovery</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                The Write-Ahead Log enforces the write-ahead logging rule: an intent must be persisted to non-volatile disk before modifying memory state or flushing dirty pages.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
                During unexpected system crashes (e.g. process kill, OS failure), the WAL file retains transactions that completed their PENDING record. When the engine boots:
              </p>
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>WAL Replay Protocol:</span>
                <ol style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.6' }}>
                  <li>Engine initializes <code style={{ color: '#38bdf8' }}>StorageEngine()</code>.</li>
                  <li>Calls <code style={{ color: '#38bdf8' }}>wal-&gt;replay(*this)</code>.</li>
                  <li>Scans line-by-line: for any <code style={{ color: '#f59e0b' }}>PENDING</code> operations, automatically invokes <code style={{ color: '#38bdf8' }}>engine.set(key, value)</code> or <code style={{ color: '#38bdf8' }}>engine.remove(key)</code>.</li>
                  <li>Rebuilds in-memory index state to the exact moment prior to failure without corruption.</li>
                </ol>
              </div>
            </article>

            {/* 8. Indexing */}
            <article id="indexing" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>8. Hash Indexing & Chaining</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                The index is a custom hash table implementing separate chaining with 16 buckets.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
                Each bucket holds a linked list of <code style={{ color: '#38bdf8' }}>IndexNode</code> objects containing <code style={{ color: '#f8fafc' }}>key</code>, <code style={{ color: '#f8fafc' }}>page_id</code>, and a pointer to <code style={{ color: '#f8fafc' }}>next</code>. Hash values are computed via:
              </p>
              <div className="terminal-box" style={{ marginBottom: '1rem' }}>
                <div className="terminal-body" style={{ minHeight: 'auto', padding: '0.75rem', fontSize: '0.82rem', color: '#38bdf8' }}>
                  hash_val = (hash_val * 31 + char) % 16;
                </div>
              </div>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7' }}>
                On shutdown or checkpoint, the index serializes to <code style={{ color: '#38bdf8' }}>index.dat</code>, allowing O(1) in-memory key-to-page resolution on reboot without scanning the raw database.
              </p>
            </article>

            {/* 9. Buffer Pool */}
            <article id="buffer_pool" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>9. LRU Buffer Pool & Eviction</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                The buffer pool caches up to 3 active pages in memory. It tracks page recency using a doubly linked list (<code style={{ color: '#38bdf8' }}>std::list</code>) and an unordered map of iterators (<code style={{ color: '#38bdf8' }}>std::unordered_map</code>).
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7', marginBottom: '1rem' }}>
                When the buffer pool is full and a new page is requested:
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: '#cbd5e1', lineHeight: '1.7', fontSize: '0.9rem' }}>
                <li>The least recently used page at the tail of the list is selected for eviction.</li>
                <li>If the page was mutated (<code style={{ color: '#f59e0b' }}>is_dirty == true</code>), it is written back to disk via DiskManager.</li>
                <li>If clean, it is safely evicted from memory with zero I/O cost.</li>
              </ul>
            </article>

            {/* 10. Compaction */}
            <article id="compaction" className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#f8fafc' }}>10. Space Compaction</h2>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                Because CacheForge appends new pages for key updates and marks deleted keys obsolete in the index, orphaned 4KB pages accumulate in <code style={{ color: '#38bdf8' }}>cacheforge.db</code> over time.
              </p>
              <p style={{ color: '#94a3b8', lineHeight: '1.7' }}>
                The <code style={{ color: '#38bdf8' }}>COMPACT</code> procedure performs offline garbage collection: it iterates through live keys in <code style={{ color: '#38bdf8' }}>index.dat</code>, reads their values from disk, tears down fragmented files, and rewrites only the live data sequentially. This shrinks the database file size and restores optimal disk layout.
              </p>
            </article>

            {/* 11. Limitations */}
            <article id="limitations" className="card" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.25)', backgroundColor: 'rgba(244, 63, 94, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                <AlertCircle size={22} color="#f43f5e" />
                <h2 style={{ fontSize: '1.6rem', color: '#f8fafc', margin: 0 }}>11. Technical Limitations & Future Work</h2>
              </div>
              <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '1rem' }}>
                To maintain clarity as an educational storage engine built without third-party libraries, the current v1.0 release has several known design limitations:
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: '#94a3b8', lineHeight: '1.8', fontSize: '0.9rem' }}>
                <li><strong style={{ color: '#f8fafc' }}>Single-Key per Page Limit:</strong> Each 4KB page currently stores one key-value record. Keys or values exceeding 4096 bytes are rejected with a page overflow exception.</li>
                <li><strong style={{ color: '#f8fafc' }}>Fixed Bucket Count:</strong> The HashIndex uses 16 static buckets; under very large key volumes, chaining degrades towards O(N) linked list traversals. Future work: dynamic rehashing or B+ Tree indexing.</li>
                <li><strong style={{ color: '#f8fafc' }}>Process Concurrency:</strong> CacheForge is single-process embedded. The Node.js adapter manages sequential process queueing to prevent file handle locking conflicts.</li>
                <li><strong style={{ color: '#f8fafc' }}>Offline Compaction:</strong> Compaction pauses operations while rewriting the database, rather than running concurrent background SSTable compaction like LevelDB.</li>
              </ul>
            </article>

          </div>

        </div>

      </div>
    </div>
  );
}
