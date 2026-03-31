import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getCases } from '../utils/api';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getCases('active')])
      .then(([s, cases]) => {
        setStats(s);
        setRecentCases(cases.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Жүктелуде...
      </div>
    );
  }

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '40px 0 48px' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: 12 }}>
          🔍 <span style={{ color: 'var(--accent-cyan)' }}>FindMe AI</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 32px' }}>
          AI арқылы жоғалған адамдарды іздеу платформасы. Фотоны жүктеп, секундтар ішінде нәтиже алыңыз.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/sighting" className="btn btn-primary">📸 Байқалды деп хабарлау</Link>
          <Link to="/report" className="btn btn-outline">➕ Кейс ашу</Link>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total_cases}</div>
            <div className="stat-label">Барлық кейс</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent-orange)' }}>{stats.active_cases}</div>
            <div className="stat-label">Іздестіруде</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent-green)' }}>{stats.found_cases}</div>
            <div className="stat-label">Табылды</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_sightings}</div>
            <div className="stat-label">Хабарламалар</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent-cyan)' }}>{stats.pending_matches}</div>
            <div className="stat-label">Тексерілуде</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--accent-green)' }}>{stats.confirmed_matches}</div>
            <div className="stat-label">Расталды</div>
          </div>
        </div>
      )}

      {/* Recent Cases */}
      {recentCases.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: 20 }}>Соңғы кейстер</h2>
          <div className="cases-grid">
            {recentCases.map(c => (
              <Link to={`/cases/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
                <div className="card case-card">
                  {c.photo_url ? (
                    <img src={`http://localhost:5000${c.photo_url}`} alt={c.full_name} />
                  ) : (
                    <div style={{
                      width: '100%', height: 180, background: 'var(--bg-secondary)',
                      borderRadius: 8, marginBottom: 12, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '3rem'
                    }}>👤</div>
                  )}
                  <div className="case-name">{c.full_name}</div>
                  <div className="case-meta">
                    {c.age && `${c.age} жас · `}{c.last_seen_location}
                  </div>
                  <span className={`badge badge-${c.status}`}>
                    {c.status === 'active' ? 'Іздестіруде' : 'Табылды'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to="/cases" className="btn btn-outline">Барлық кейстер →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
