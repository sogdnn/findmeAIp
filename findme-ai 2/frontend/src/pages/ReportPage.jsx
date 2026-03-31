import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../utils/api';

export default function ReportPage() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', age: '', location: '', description: '',
    lat: '', lng: '', reporter_name: '', reporter_contact: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name) { setError('Аты міндетті!'); return; }
    setLoading(true);
    setError('');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (fileRef.current?.files[0]) fd.append('photo', fileRef.current.files[0]);

    try {
      const result = await createCase(fd);
      navigate(`/cases/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Қате болды. Қайталап көріңіз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">➕ Жоғалған адамды хабарлау</h1>
      <p className="page-subtitle">Барлық ақпаратты толтырып, фото жүктеңіз</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: 680 }}>
        <form onSubmit={handleSubmit}>
          {/* Photo */}
          <div className="form-group">
            <label>Фото</label>
            <div className="photo-upload" onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} />
              {preview
                ? <img src={preview} alt="preview" className="photo-preview" />
                : <div>📷 Суретті осы жерге жүктеу үшін басыңыз</div>
              }
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Толық аты *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Иванов Иван" required />
            </div>
            <div className="form-group">
              <label>Жасы</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="25" min="1" max="120" />
            </div>
          </div>

          <div className="form-group">
            <label>Соңғы рет байқалған жер</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Алматы, Абай даңғылы" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ендік (Latitude)</label>
              <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="43.238949" />
            </div>
            <div className="form-group">
              <label>Бойлық (Longitude)</label>
              <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="76.889709" />
            </div>
          </div>

          <div className="form-group">
            <label>Сипаттама</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Адамның сыртқы келбеті, киімі, жағдайы туралы қосымша ақпарат..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Хабарлаушының аты</label>
              <input name="reporter_name" value={form.reporter_name} onChange={handleChange} placeholder="Сіздің атыңыз" />
            </div>
            <div className="form-group">
              <label>Байланыс</label>
              <input name="reporter_contact" value={form.reporter_contact} onChange={handleChange} placeholder="+7 777 123 4567" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? '⏳ Жүктелуде...' : '✅ Кейс ашу'}
          </button>
        </form>
      </div>
    </div>
  );
}
