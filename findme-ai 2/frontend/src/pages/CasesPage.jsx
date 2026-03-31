import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCases } from '../utils/api';

export default function CasesPage() {
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const status = filter === 'all' ? '' : filter;
    getCases(status)
      .then(setCases)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);

  const filtered = cases.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.last_seen_location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">📋 Кейстер тізімі</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{filtered.length} кейс табылды</p>
        </div>
        <Link to="/report" className="btn btn-primary">➕ Жаңа кейс</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Іздеу..."
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 16px', color: 'var(--text-primary)',
            outline: 'none', flex: 1, minWidth: 200
          }}
        />
        {['all', 'active', 'found'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '10px 20px' }}
          >
            {s === 'all' ? 'Барлығы' : s === 'active' ? 'Іздестіруде' : 'Табылды'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Жүктелуде...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <div>Кейс табылмады</div>
        </div>
      ) : (
        <div className="cases-grid">
          {filtered.map(c => (
            <Link to={`/cases/${c.id}`} key={c.id} style={{ textDecoration: 'none' }}>
              <div className="card case-card">
                {c.photo_url ? (
                  <img src={`http://localhost:5000${c.photo_url}`} alt={c.full_name} />
                ) : (
                  <div style={{
                    width: '100%', height: 180, background: 'var(--bg-secondary)',
                    borderRadius: 8, marginBottom: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem'
                  }}>👤</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="case-name">{c.full_name}</div>
                    <div className="case-meta">
                      {c.age && `${c.age} жас`}
                      {c.age && c.last_seen_location && ' · '}
                      {c.last_seen_location}
                    </div>
                  </div>
                  <span className={`badge badge-${c.status}`}>
                    {c.status === 'active' ? 'Іздестіруде' : 'Табылды'}
                  </span>
                </div>
                {c.created_at && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                    {new Date(c.created_at).toLocaleDateString('kk-KZ')}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
