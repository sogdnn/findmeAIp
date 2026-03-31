import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMatches, updateMatch } from '../utils/api';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchMatches = () => {
    const params = filter === 'all' ? {} : { status: filter };
    getMatches(params).then(setMatches).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMatches(); }, [filter]);

  const handleAction = async (id, status) => {
    await updateMatch(id, status);
    fetchMatches();
  };

  const getSimilarityClass = (score) => {
    if (score >= 90) return 'similarity-high';
    if (score >= 75) return 'similarity-mid';
    return 'similarity-low';
  };

  return (
    <div className="page">
      <h1 className="page-title">🤖 AI Сәйкестіктер</h1>
      <p className="page-subtitle">AI тапқан барлық ықтимал сәйкестіктер</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['pending', 'confirmed', 'dismissed', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px' }}>
            {s === 'pending' ? '⏳ Тексерілуде'
              : s === 'confirmed' ? '✅ Расталды'
              : s === 'dismissed' ? '❌ Өтірік'
              : 'Барлығы'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Жүктелуде...</div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔎</div>
          <div>Сәйкестік табылмады</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {matches.map(match => (
            <div className="card" key={match.id}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <Link to={`/cases/${match.case_id}`} style={{
                      fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-cyan)',
                      textDecoration: 'none'
                    }}>
                      {match.case?.full_name || `Кейс #${match.case_id}`}
                    </Link>
                    <span className={`badge badge-${match.status}`}>
                      {match.status === 'pending' ? 'Тексерілуде'
                        : match.status === 'confirmed' ? 'Расталды' : 'Өтірік'}
                    </span>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ұқсастық</span>
                      <span style={{
                        fontWeight: 700,
                        color: match.similarity_score >= 90 ? 'var(--accent-green)' : 'var(--accent-orange)'
                      }}>
                        {match.similarity_score}%
                      </span>
                    </div>
                    <div className="similarity-bar">
                      <div
                        className={`similarity-fill ${getSimilarityClass(match.similarity_score)}`}
                        style={{ width: `${match.similarity_score}%` }}
                      />
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {match.case?.last_seen_location && `📍 ${match.case.last_seen_location}`}
                    {match.created_at && ` · ${new Date(match.created_at).toLocaleString('kk-KZ')}`}
                  </div>
                </div>

                {match.status === 'pending' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-success" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={() => handleAction(match.id, 'confirmed')}>✅ Растау</button>
                    <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      onClick={() => handleAction(match.id, 'dismissed')}>❌ Өтірік</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
