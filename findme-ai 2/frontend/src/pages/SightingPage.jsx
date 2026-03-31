import React, { useState, useRef } from 'react';
import { createSighting } from '../utils/api';

export default function SightingPage() {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    location_name: '', lat: '', lng: '',
    reporter_name: '', reporter_contact: '', notes: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!fileRef.current?.files[0]) { setError('Фото міндетті!'); return; }
    setLoading(true);
    setError('');
    setResult(null);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('photo', fileRef.current.files[0]);

    try {
      const data = await createSighting(fd);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Қате болды.');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityClass = (score) => {
    if (score >= 90) return 'similarity-high';
    if (score >= 75) return 'similarity-mid';
    return 'similarity-low';
  };

  return (
    <div className="page">
      <h1 className="page-title">📸 Байқалды деп хабарлау</h1>
      <p className="page-subtitle">Фотоны жүктеңіз — AI автоматты түрде базамен салыстырады</p>

      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <div className={`alert ${result.matches_found > 0 ? 'alert-success' : 'alert-info'}`}>
          {result.matches_found > 0
            ? `🎯 ${result.matches_found} сәйкестік табылды! Төменде нәтижелерді қараңыз.`
            : '✅ Хабарлама қабылданды. Сәйкестік табылмады.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Фото *</label>
              <div className="photo-upload" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
                {preview
                  ? <img src={preview} alt="preview" className="photo-preview" />
                  : <div>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                      <div>Суретті жүктеу үшін басыңыз</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        JPG, PNG, WEBP — макс 16MB
                      </div>
                    </div>
                }
              </div>
            </div>

            <div className="form-group">
              <label>Байқалған жер</label>
              <input name="location_name" value={form.location_name} onChange={handleChange}
                placeholder="Алматы, Достык даңғылы" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ендік</label>
                <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="43.238949" />
              </div>
              <div className="form-group">
                <label>Бойлық</label>
                <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="76.889709" />
              </div>
            </div>

            <div className="form-group">
              <label>Ескертпе</label>
              <textarea name="notes" value={form.notes} onChange={handleChange}
                rows={2} placeholder="Қосымша ақпарат..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Сіздің атыңыз</label>
                <input name="reporter_name" value={form.reporter_name} onChange={handleChange} placeholder="Аты-жөні" />
              </div>
              <div className="form-group">
                <label>Байланыс</label>
                <input name="reporter_contact" value={form.reporter_contact} onChange={handleChange} placeholder="+7 777 ..." />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '🤖 AI тексеруде...' : '🔍 Іздеуді бастау'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div>
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <div style={{ color: 'var(--accent-cyan)' }}>AI бет векторларын салыстырып жатыр...</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                Бұл бірнеше секунд алуы мүмкін
              </div>
            </div>
          )}

          {result?.matches?.map((match, i) => (
            <div className="card" key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 600 }}>{match.case_name}</span>
                <span style={{
                  fontSize: '1.3rem', fontWeight: 700,
                  color: match.similarity >= 90 ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>
                  {match.similarity}%
                </span>
              </div>
              <div className="similarity-bar">
                <div
                  className={`similarity-fill ${getSimilarityClass(match.similarity)}`}
                  style={{ width: `${match.similarity}%` }}
                />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
                Кейс #{match.case_id} · AI сәйкестігі
              </div>
            </div>
          ))}

          {result && result.matches_found === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔎</div>
              <div>Сәйкестік табылмады</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 8 }}>
                Хабарлама сақталды және жаңа кейстермен салыстырылатын болады
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤖</div>
              <div>Фотоны жүктеп, іздеуді бастаңыз</div>
              <div style={{ fontSize: '0.85rem', marginTop: 8 }}>
                AI барлық активті кейстермен автоматты салыстырады
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
