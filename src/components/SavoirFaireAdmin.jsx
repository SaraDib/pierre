import React, { useEffect, useState } from 'react';
import { Check, AlertCircle, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Plus, Upload, Save, Type } from 'lucide-react';
import {
  getSavoirFaireAdmin,
  updateSavoirFaireSection,
  saveSavoirFaireItem,
  deleteSavoirFaireItem,
  reorderSavoirFaireItems
} from '../api/savoirFaire';
import { formatMediaUrl } from '../api/acceuil';
import { getMateriauxAdmin } from '../api/materiaux';

const card = {
  background: 'rgba(26, 24, 22, 0.85)',
  border: '1px solid rgba(197, 160, 89, 0.22)',
  borderRadius: '14px',
  padding: '24px'
};
const labelStyle = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#a0988c',
  marginBottom: '6px',
  fontWeight: 600
};
const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(17, 16, 15, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#f7f3ea',
  fontSize: '13px',
  outline: 'none'
};
const iconBtn = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  color: '#efe8db',
  cursor: 'pointer',
  padding: '7px',
  display: 'inline-flex',
  alignItems: 'center'
};
const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  background: 'rgba(197, 160, 89, 0.12)',
  border: '1px solid rgba(197, 160, 89, 0.3)',
  color: '#c5a059',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer'
};

function Notice({ kind, children }) {
  const ok = kind === 'success';
  return (
    <div
      style={{
        background: ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${ok ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        color: ok ? '#6ee7b7' : '#fca5a5',
        padding: '14px 18px',
        borderRadius: '10px',
        fontSize: '14px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {ok ? <Check size={18} /> : <AlertCircle size={18} />}
      <span>{children}</span>
    </div>
  );
}

function ItemCard({ item, index, total, availableMaterials = [], token, busy, onSaved, onDeleted, onMove, onError }) {
  const isNew = !item.id;
  const [draft, setDraft] = useState({
    title: item.title || '',
    description: item.description || '',
    mat_key: item.mat_key || '',
    is_active: item.is_active ?? true
  });
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', draft.title);
      fd.append('description', draft.description);
      fd.append('mat_key', draft.mat_key);
      fd.append('is_active', draft.is_active ? '1' : '0');
      if (file) fd.append('image_file', file);
      if (removeImage && !file) fd.append('remove_image', '1');
      const saved = await saveSavoirFaireItem(fd, token, item.id);
      setFile(null);
      setRemoveImage(false);
      onSaved(saved, 'Expertise enregistrée.');
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return onDeleted(item, true);
    if (!window.confirm(`Supprimer « ${item.title} » ?`)) return;
    try {
      await deleteSavoirFaireItem(item.id, token);
      onDeleted(item);
    } catch (err) {
      onError(err.message);
    }
  };

  const currentImage = !removeImage && !file && item.image ? formatMediaUrl(item.image) : null;

  return (
    <div style={{ ...card, padding: '20px', opacity: draft.is_active ? 1 : 0.65 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '22px', color: '#c5a059', fontWeight: 300 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isNew && (
            <>
              <button type="button" style={iconBtn} disabled={busy || index === 0} onClick={() => onMove(index, -1)} aria-label="Monter">
                <ArrowUp size={14} />
              </button>
              <button type="button" style={iconBtn} disabled={busy || index === total - 1} onClick={() => onMove(index, 1)} aria-label="Descendre">
                <ArrowDown size={14} />
              </button>
            </>
          )}
          <button
            type="button"
            style={iconBtn}
            onClick={() => setDraft({ ...draft, is_active: !draft.is_active })}
            aria-label={draft.is_active ? 'Masquer' : 'Afficher'}
            title={draft.is_active ? 'Visible — cliquer pour masquer' : 'Masquée — cliquer pour afficher'}
          >
            {draft.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button type="button" style={{ ...iconBtn, color: '#fca5a5' }} onClick={handleDelete} aria-label="Supprimer">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Titre</label>
        <input type="text" style={inputStyle} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Description</label>
        <textarea rows={3} style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
      </div>
      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Texture de la pierre (si aucune image)</label>
        <select style={inputStyle} value={draft.mat_key} onChange={(e) => setDraft({ ...draft, mat_key: e.target.value })}>
          <option value="">— Aucune —</option>
          {availableMaterials.map((m) => (
            <option key={m.slug} value={m.slug}>{m.name}</option>
          ))}
        </select>
      </div>

      <div style={{ padding: '12px', background: 'rgba(17, 16, 15, 0.5)', border: '1px dashed rgba(197, 160, 89, 0.3)', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#efe8db', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={14} color="#c5a059" /> Image personnalisée (optionnel)
        </div>
        {currentImage && (
          <div style={{ marginBottom: '8px' }}>
            <img src={currentImage} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px' }} />
            <button type="button" style={{ ...iconBtn, marginTop: '6px', fontSize: '11px', gap: '4px' }} onClick={() => setRemoveImage(true)}>
              <Trash2 size={12} /> Retirer l'image
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => { setFile(e.target.files[0] || null); setRemoveImage(false); }} style={{ fontSize: '12px', color: '#a0988c' }} />
        {file && <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>Fichier sélectionné : {file.name}</div>}
      </div>

      <button type="button" style={primaryBtn} onClick={handleSave} disabled={saving || !draft.title.trim()}>
        <Save size={14} /> {saving ? 'Enregistrement…' : isNew ? 'Créer' : 'Enregistrer'}
      </button>
    </div>
  );
}

export default function SavoirFaireAdmin({ token, onCountChange }) {
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState({ eyebrow: '', title: '', title_em: '', description: '' });
  const [items, setItems] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  const [busy, setBusy] = useState(false);

  const flash = (msg) => {
    setError(null);
    setMessage(`✓ ${msg}`);
    setTimeout(() => setMessage(null), 5000);
  };
  const fail = (msg) => {
    setMessage(null);
    setError(msg || 'Une erreur est survenue.');
  };

  useEffect(() => {
    let cancelled = false;
    getSavoirFaireAdmin(token)
      .then((data) => {
        if (cancelled) return;
        setSection({
          eyebrow: data.section.eyebrow || '',
          title: data.section.title || '',
          title_em: data.section.title_em || '',
          description: data.section.description || ''
        });
        setItems(data.items);
      })
      .catch((err) => !cancelled && fail(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    getMateriauxAdmin(token)
      .then((data) => {
        if (data?.items) {
          setAvailableMaterials(data.items);
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (onCountChange) onCountChange(items.filter((i) => i.id).length);
  }, [items, onCountChange]);

  const saveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      await updateSavoirFaireSection(section, token);
      flash('En-tête enregistré.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  const move = async (index, delta) => {
    const next = [...items];
    const target = index + delta;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await reorderSavoirFaireItems(next.filter((i) => i.id).map((i) => i.id), token);
      flash('Ordre mis à jour.');
    } catch (err) {
      setItems(items);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaved = (saved, msg) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      if (exists) return prev.map((i) => (i.id === saved.id ? saved : i));
      return [...prev.filter((i) => i.id), saved];
    });
    flash(msg);
  };

  const handleDeleted = (item, isDraft) => {
    setItems((prev) => prev.filter((i) => (isDraft ? i !== item : i.id !== item.id)));
    if (!isDraft) flash('Expertise supprimée.');
  };

  const addDraft = () => {
    if (items.some((i) => !i.id)) return;
    setItems([...items, { title: '', description: '', mat_key: '', is_active: true, image: null, _draft: true }]);
  };

  return (
    <div>
      <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
            Savoir-faire & Domaines d'Intervention
          </h1>
          <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
            Contenu de la section <a href="/#savoir-faire" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#savoir-faire</a> — modifiable, réordonnable et masquable.
          </p>
        </div>
        <a href="/#savoir-faire" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', background: 'rgba(197, 160, 89, 0.12)', color: '#c5a059', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
          Ouvrir #savoir-faire ↗
        </a>
      </div>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <div style={{ color: '#a0988c' }}>Chargement…</div>
      ) : (
        <>
          <form onSubmit={saveSection} style={{ ...card, marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Type size={18} color="#c5a059" />
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                1. En-tête de la section
              </h2>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Accroche (Eyebrow)</label>
              <input type="text" style={inputStyle} value={section.eyebrow} onChange={(e) => setSection({ ...section, eyebrow: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Titre</label>
                <input type="text" style={inputStyle} value={section.title} onChange={(e) => setSection({ ...section, title: e.target.value })} />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#c5a059' }}>Fin du titre (Doré)</label>
                <input type="text" style={{ ...inputStyle, color: '#c5a059', fontWeight: 600, border: '1px solid rgba(197, 160, 89, 0.4)' }} value={section.title_em} onChange={(e) => setSection({ ...section, title_em: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Texte descriptif</label>
              <textarea rows={3} style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }} value={section.description} onChange={(e) => setSection({ ...section, description: e.target.value })} />
            </div>
            <button type="submit" style={primaryBtn} disabled={savingSection}>
              <Save size={14} /> {savingSection ? 'Enregistrement…' : "Enregistrer l'en-tête"}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
              2. Expertises
            </h2>
            <button type="button" style={primaryBtn} onClick={addDraft}>
              <Plus size={14} /> Ajouter une expertise
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {items.map((item, index) => (
              <ItemCard
                key={item.id || 'draft'}
                item={item}
                index={index}
                total={items.length}
                availableMaterials={availableMaterials}
                token={token}
                busy={busy}
                onSaved={handleSaved}
                onDeleted={handleDeleted}
                onMove={move}
                onError={fail}
              />
            ))}
          </div>
          {items.length === 0 && <div style={{ color: '#a0988c' }}>Aucune expertise. Cliquez sur « Ajouter une expertise ».</div>}
        </>
      )}
    </div>
  );
}
