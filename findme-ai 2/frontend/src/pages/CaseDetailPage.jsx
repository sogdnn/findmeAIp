import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, updateCaseStatus, updateMatch } from '../utils/api';

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCase = () => {
    getCase(id).then(setCaseData).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCase(); }, [id]);

  const handleStatusChange = async (status) => {
    await updateCaseStatus(id, status);
    fetchCase();
  };

  const handleMatchAction = async (matchId, status) => {
    await updateMatch(matchId, status);
    fetchCase();
  };

  const getSimilarityClass = (score) => {
    if (score >= 90) return 'similarity-high';
    if (score >= 75) return 'similarity-mid';
    return 'similarity-low';
  };

  if (loading) return <div className="loading"><div className="spinner" />Жүктелуде...</div>;
  if (!caseData) return <div className="page">Кейс табылмады</div>;

  return (
    <div className="page">
      <button onClick={() => navigate('/cases')} className="btn btn-outline" style={{ marginBottom: 24 }}>
        ← Артқа
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* Left: Photo + Info */}
        <div>
          <div className="card">
            {caseData.photo_url ? (
              <img
                src={`http://localhost:5000${caseData.photo_url}`}
                alt={caseData.full_name}
                style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
              />
            ) : (
              <div style={{
                height: 240, background: 'var(--bg-secondary)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem', marginBottom: 16
              }}>👤</div>
            )}

            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>{caseData.full_name}</h2>
            <span className={`badge badge-${caseData.status}`} style={{ marginBottom: 16, display: 'inline-block' }}>
              {caseData.status === 'active' ? 'Іздестіруде' : 'Табылды'}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {caseData.age && (
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Жасы: </span>{caseData.age}
                </div>
              )}
              {caseData.last_seen_location && (
                <div style={{ fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Байқалған жер: </span>
                  {caseData.last_seen_location}
                </div>
              )}
              {caseData.description && (
                <div style={{ fontSize: '0.9rem', marginTop: 8, lineHeight: 1.6 }}>{caseData.description}</div>
              )}
              {caseData.reporter_name && (
                <div style={{ fontSize: '0.9rem', marginTop: 8 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Хабарлаушы: </span>
                  {caseData.reporter_name}<br />
                  <span style={{ color: 'var(--accent-cyan)' }}>{caseData.reporter_contact}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {caseData.status === 'active' ? (
                <button className="btn btn-success" style={{ flex: 1 }}
                  onClick={() => handleStatusChange('found')}>
                  ✅ Табылды
                </button>
              ) : (
                <button className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => handleStatusChange('active')}>
                  🔄 Қайта ашу
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Matches */}
        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>
            🤖 AI Сәйкестіктер
            {caseData.matches?.length > 0 && (
              <span style={{
                marginLeft: 10, background: 'var(--accent-cyan)', color: '#000',
                borderRadius: 20, padding: '2px 10px', fontSize: '0.8rem'
              }}>
                {caseData.matches.length}
              </span>
            )}
          </h3>

          {!caseData.matches?.length ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔎</div>
              <div>Сәйкестік табылмаған</div>
              <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
                Жаңа байқалулар хабарланғанда AI автоматты тексереді
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {caseData.matches.map(match => (
                <div className="card" key={match.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                        Байқалу #{match.sighting_id}
                      </span>
                      <span className={`badge badge-${match.status}`} style={{ marginLeft: 10 }}>
                        {match.status === 'pending' ? 'Тексерілуде'
                          : match.status === 'confirmed' ? 'Расталды' : 'Өтірік'}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '1.4rem', fontWeight: 700,
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

                  {match.sighting?.location_name && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                      📍 {match.sighting.location_name}
                    </div>
                  )}

                  {match.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-success" style={{ flex: 1, padding: '8px' }}
                        onClick={() => handleMatchAction(match.id, 'confirmed')}>
                        ✅ Растау
                      </button>
                      <button className="btn btn-danger" style={{ flex: 1, padding: '8px' }}
                        onClick={() => handleMatchAction(match.id, 'dismissed')}>
                        ❌ Өтірік
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
