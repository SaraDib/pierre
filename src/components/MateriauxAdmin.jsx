import React, { useEffect, useState } from 'react';
import {
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Upload,
  Save,
  Type,
  Layers,
  Sparkles,
  Tag
} from 'lucide-react';
import {
  getMateriauxAdmin,
  updateMateriauxSection,
  saveMateriauxItem,
  deleteMateriauxItem,
  reorderMateriauxItems,
  saveMateriauxCategory,
  deleteMateriauxCategory,
  reorderMateriauxCategories,
  toStoneMaterial
} from '../api/materiaux';
import { formatMediaUrl } from '../api/acceuil';
import LuxuryLoader from './LuxuryLoader';
import StoneTexture from './StoneTexture';

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

function MaterialCard({
  item,
  index,
  total,
  categories,
  token,
  busy,
  onSaved,
  onDeleted,
  onMove,
  onError
}) {
  const isNew = !item.id;
  const initialTexture = item.texture || {};
  const [draft, setDraft] = useState({
    name: item.name || '',
    category_id: item.category_id || '',
    description: item.description || '',
    finishesText: Array.isArray(item.finishes) ? item.finishes.join(', ') : '',
    texture_type: initialTexture.type || item.texture_type || 'veins',
    base: initialTexture.base || item.base || '#e9e4da',
    vein: initialTexture.vein || item.vein || '#5d5a55',
    tone: initialTexture.tone || item.tone || '#bfb7a6',
    freq: initialTexture.freq || item.freq || '0.007 0.016',
    seed: initialTexture.seed ?? item.seed ?? 4,
    is_active: item.is_active ?? true
  });
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live stone texture object for preview
  const liveStone = toStoneMaterial({
    slug: item.slug || 'preview',
    texture: {
      type: draft.texture_type,
      base: draft.base,
      vein: draft.vein,
      tone: draft.tone,
      freq: draft.freq,
      seed: Number(draft.seed) || 1
    }
  });

  const handleSave = async () => {
    if (!draft.name.trim()) {
      onError('Le nom du matériau est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', draft.name.trim());
      if (draft.category_id) {
        fd.append('category_id', draft.category_id);
      }
      fd.append('description', draft.description || '');
      const finishes = draft.finishesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      fd.append('finishes', JSON.stringify(finishes));
      fd.append('texture_type', draft.texture_type);
      fd.append('base', draft.base);
      fd.append('vein', draft.vein);
      fd.append('tone', draft.tone);
      fd.append('freq', draft.freq);
      fd.append('seed', String(draft.seed));
      fd.append('is_active', draft.is_active ? '1' : '0');

      if (file) {
        fd.append('image_file', file);
      }
      if (removeImage && !file) {
        fd.append('remove_image', '1');
      }

      const saved = await saveMateriauxItem(fd, token, item.id);
      setFile(null);
      setRemoveImage(false);
      onSaved(saved, isNew ? 'Matériau créé.' : 'Matériau enregistré.');
    } catch (err) {
      onError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) return onDeleted(item, true);
    if (!window.confirm(`Supprimer le matériau « ${item.name} » ?`)) return;
    try {
      await deleteMateriauxItem(item.id, token);
      onDeleted(item);
    } catch (err) {
      onError(err.message);
    }
  };

  const currentImage = !removeImage && !file && item.image ? formatMediaUrl(item.image) : null;

  return (
    <div style={{ ...card, padding: '22px', opacity: draft.is_active ? 1 : 0.68 }}>
      {/* Header card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          gap: '8px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '22px',
              color: '#c5a059',
              fontWeight: 300
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          {item.slug && (
            <code
              style={{
                fontSize: '11px',
                color: '#c5a059',
                background: 'rgba(197, 160, 89, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {item.slug}
            </code>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {!isNew && (
            <>
              <button
                type="button"
                style={iconBtn}
                disabled={busy || index === 0}
                onClick={() => onMove(index, -1)}
                aria-label="Monter"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                style={iconBtn}
                disabled={busy || index === total - 1}
                onClick={() => onMove(index, 1)}
                aria-label="Descendre"
              >
                <ArrowDown size={14} />
              </button>
            </>
          )}
          <button
            type="button"
            style={iconBtn}
            onClick={() => setDraft({ ...draft, is_active: !draft.is_active })}
            aria-label={draft.is_active ? 'Masquer' : 'Afficher'}
            title={draft.is_active ? 'Visible sur le site — cliquer pour masquer' : 'Masqué — cliquer pour afficher'}
          >
            {draft.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            style={{ ...iconBtn, color: '#fca5a5' }}
            onClick={handleDelete}
            aria-label="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Inputs principaux */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div>
          <label style={labelStyle}>Nom de la pierre</label>
          <input
            type="text"
            style={inputStyle}
            value={draft.name}
            placeholder="Ex: Marbre Calacatta"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Catégorie</label>
          <select
            style={inputStyle}
            value={draft.category_id}
            onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}
          >
            <option value="">— Sans catégorie —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          rows={3}
          style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }}
          value={draft.description}
          placeholder="Propriétés, usages recommandés, caractère minéral…"
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Finitions (séparées par une virgule)</label>
        <input
          type="text"
          style={inputStyle}
          value={draft.finishesText}
          placeholder="Ex: Poli, Adouci, Brossé, Flammé"
          onChange={(e) => setDraft({ ...draft, finishesText: e.target.value })}
        />
      </div>

      {/* Rendu procédural de la texture */}
      <div
        style={{
          padding: '14px',
          background: 'rgba(17, 16, 15, 0.65)',
          border: '1px solid rgba(197, 160, 89, 0.25)',
          borderRadius: '10px',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#c5a059', fontSize: '12px', fontWeight: 600 }}>
          <Sparkles size={14} /> Texture procédurale SVG & Finition
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '14px', alignItems: 'start' }}>
          {/* Texture preview thumbnail */}
          <div
            style={{
              width: '120px',
              height: '120px',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(197, 160, 89, 0.35)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            {currentImage ? (
              <img
                src={currentImage}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : liveStone ? (
              <StoneTexture material={liveStone} />
            ) : null}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '3px 6px',
                background: 'rgba(0,0,0,0.7)',
                fontSize: '10px',
                color: '#efe8db',
                textAlign: 'center'
              }}
            >
              Aperçu en direct
            </div>
          </div>

          {/* Texture controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={labelStyle}>Motif (Type)</label>
              <select
                style={{ ...inputStyle, padding: '8px 10px' }}
                value={draft.texture_type}
                onChange={(e) => setDraft({ ...draft, texture_type: e.target.value })}
              >
                <option value="veins">Veines (Marbre)</option>
                <option value="granit">Granit (Moucheté)</option>
                <option value="bands">Stries (Travertin/Ardoise)</option>
                <option value="grain">Grain (Calcaire/Taza)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Fréquence</label>
              <input
                type="text"
                style={{ ...inputStyle, padding: '8px 10px' }}
                value={draft.freq}
                placeholder="Ex: 0.007 0.016"
                onChange={(e) => setDraft({ ...draft, freq: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>Couleur de fond (Base)</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={draft.base}
                  onChange={(e) => setDraft({ ...draft, base: e.target.value })}
                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  value={draft.base}
                  onChange={(e) => setDraft({ ...draft, base: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Couleur de veine</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={draft.vein}
                  onChange={(e) => setDraft({ ...draft, vein: e.target.value })}
                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  value={draft.vein}
                  onChange={(e) => setDraft({ ...draft, vein: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Couleur de nuance (Ton)</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={draft.tone}
                  onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
                  style={{ width: '32px', height: '32px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  style={{ ...inputStyle, padding: '6px 8px', fontSize: '12px' }}
                  value={draft.tone}
                  onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Graine aléatoire (Seed)</label>
              <input
                type="number"
                min="0"
                max="9999"
                style={{ ...inputStyle, padding: '8px 10px' }}
                value={draft.seed}
                onChange={(e) => setDraft({ ...draft, seed: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image photo personnalisée optionnelle */}
      <div
        style={{
          padding: '12px',
          background: 'rgba(17, 16, 15, 0.5)',
          border: '1px dashed rgba(197, 160, 89, 0.3)',
          borderRadius: '8px',
          marginBottom: '16px'
        }}
      >
        <div style={{ fontSize: '12px', color: '#efe8db', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Upload size={14} color="#c5a059" /> Image photo personnalisée (remplace la texture SVG si présente)
        </div>
        {currentImage && (
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={currentImage}
              alt=""
              style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '6px' }}
            />
            <button
              type="button"
              style={{ ...iconBtn, fontSize: '11px', gap: '4px' }}
              onClick={() => setRemoveImage(true)}
            >
              <Trash2 size={12} /> Retirer la photo (revenir à la texture SVG)
            </button>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(e.target.files[0] || null);
            setRemoveImage(false);
          }}
          style={{ fontSize: '12px', color: '#a0988c' }}
        />
        {file && (
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>
            Fichier sélectionné : {file.name}
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        type="button"
        style={primaryBtn}
        onClick={handleSave}
        disabled={saving || !draft.name.trim()}
      >
        <Save size={14} /> {saving ? 'Enregistrement…' : isNew ? 'Créer le matériau' : 'Enregistrer le matériau'}
      </button>
    </div>
  );
}

export default function MateriauxAdmin({ token, onCountChange }) {
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState({ eyebrow: '', title: '', title_em: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [savingSection, setSavingSection] = useState(false);
  const [busy, setBusy] = useState(false);

  // New category inline input
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const flash = (msg) => {
    setError(null);
    setMessage(`✓ ${msg}`);
    setTimeout(() => setMessage(null), 5000);
  };
  const fail = (msg) => {
    setMessage(null);
    setError(msg || 'Une erreur est survenue.');
  };

  const loadData = () => {
    setLoading(true);
    getMateriauxAdmin(token)
      .then((data) => {
        setSection({
          eyebrow: data.section.eyebrow || '',
          title: data.section.title || '',
          title_em: data.section.title_em || '',
          description: data.section.description || ''
        });
        setCategories(data.categories || []);
        setItems(data.items || []);
      })
      .catch((err) => fail(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    if (onCountChange) {
      onCountChange(items.filter((i) => i.id).length);
    }
  }, [items, onCountChange]);

  const saveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      await updateMateriauxSection(section, token);
      flash('En-tête de la section enregistré.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  // Reorder materials
  const moveItem = async (index, delta) => {
    const next = [...items];
    const target = index + delta;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await reorderMateriauxItems(
        next.filter((i) => i.id).map((i) => i.id),
        token
      );
      flash('Ordre des matériaux mis à jour.');
    } catch (err) {
      setItems(items);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Category operations
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const created = await saveMateriauxCategory({ name: newCatName.trim() }, token);
      setCategories([...categories, created]);
      setNewCatName('');
      flash(`Catégorie « ${created.name} » créée.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ? Les pierres associées deviendront sans catégorie.`)) return;
    try {
      await deleteMateriauxCategory(cat.id, token);
      setCategories(categories.filter((c) => c.id !== cat.id));
      // update local items category
      setItems(items.map((it) => (it.category_id === cat.id ? { ...it, category_id: null, category_name: null } : it)));
      flash('Catégorie supprimée.');
    } catch (err) {
      fail(err.message);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      const updated = await saveMateriauxCategory({ name: cat.name, is_active: !cat.is_active }, token, cat.id);
      setCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
      flash(`Catégorie « ${cat.name} » ${updated.is_active ? 'activée' : 'masquée'}.`);
    } catch (err) {
      fail(err.message);
    }
  };

  const moveCategory = async (index, delta) => {
    const next = [...categories];
    const target = index + delta;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    setBusy(true);
    try {
      await reorderMateriauxCategories(
        next.map((c) => c.id),
        token
      );
      flash('Ordre des catégories mis à jour.');
    } catch (err) {
      setCategories(categories);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Materials handlers
  const handleSavedItem = (saved, msg) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === saved.id);
      if (exists) return prev.map((i) => (i.id === saved.id ? saved : i));
      return [...prev.filter((i) => i.id), saved];
    });
    flash(msg);
  };

  const handleDeletedItem = (item, isDraft) => {
    setItems((prev) => prev.filter((i) => (isDraft ? i !== item : i.id !== item.id)));
    if (!isDraft) flash('Matériau supprimé.');
  };

  const addDraftItem = () => {
    if (items.some((i) => !i.id)) return;
    setItems([
      ...items,
      {
        name: '',
        category_id: categories[0]?.id || null,
        description: '',
        finishes: ['Poli', 'Adouci'],
        texture_type: 'veins',
        base: '#e9e4da',
        vein: '#5d5a55',
        tone: '#bfb7a6',
        freq: '0.007 0.016',
        seed: 4,
        is_active: true,
        image: null,
        _draft: true
      }
    ]);
  };

  const displayedItems = items.filter((it) => {
    if (filterCategory === 'all') return true;
    return String(it.category_id) === String(filterCategory);
  });

  return (
    <div>
      {/* Title bar */}
      <div
        style={{
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '28px',
              fontWeight: 400,
              color: '#f7f3ea',
              margin: '0 0 6px'
            }}
          >
            Matériaux d'Exception & Collections
          </h1>
          <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
            Toutes les roches présentées sur la section{' '}
            <a href="/#materiaux" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>
              #materiaux
            </a>
            , entièrement configurables (textures, finitions, photos, catégories).
          </p>
        </div>
        <a
          href="/#materiaux"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            background: 'rgba(197, 160, 89, 0.12)',
            color: '#c5a059',
            fontSize: '12px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Ouvrir #materiaux ↗
        </a>
      </div>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <LuxuryLoader size={70} minHeight="240px" />
      ) : (
        <>
          {/* 1. SECTION HEADER FORM */}
          <form onSubmit={saveSection} style={{ ...card, marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Type size={18} color="#c5a059" />
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                1. En-tête de la section
              </h2>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Accroche (Eyebrow)</label>
              <input
                type="text"
                style={inputStyle}
                value={section.eyebrow}
                placeholder="Collections"
                onChange={(e) => setSection({ ...section, eyebrow: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Titre</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={section.title}
                  placeholder="Choisissez votre"
                  onChange={(e) => setSection({ ...section, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, color: '#c5a059' }}>Fin du titre (Doré)</label>
                <input
                  type="text"
                  style={{
                    ...inputStyle,
                    color: '#c5a059',
                    fontWeight: 600,
                    border: '1px solid rgba(197, 160, 89, 0.4)'
                  }}
                  value={section.title_em}
                  placeholder="matière."
                  onChange={(e) => setSection({ ...section, title_em: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Texte descriptif</label>
              <textarea
                rows={3}
                style={{ ...inputStyle, lineHeight: 1.6, resize: 'vertical' }}
                value={section.description}
                placeholder="Touchez, comparez, imaginez…"
                onChange={(e) => setSection({ ...section, description: e.target.value })}
              />
            </div>

            <button type="submit" style={primaryBtn} disabled={savingSection}>
              <Save size={14} /> {savingSection ? 'Enregistrement…' : "Enregistrer l'en-tête"}
            </button>
          </form>

          {/* 2. CATEGORIES MANAGEMENT */}
          <div style={{ ...card, marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  2. Catégories de roches ({categories.length})
                </h2>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ ...inputStyle, width: '220px', padding: '8px 12px' }}
                  placeholder="Nouvelle catégorie…"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <button type="submit" style={{ ...primaryBtn, padding: '8px 14px' }} disabled={addingCat || !newCatName.trim()}>
                  <Plus size={14} /> Ajouter
                </button>
              </form>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(17, 16, 15, 0.7)',
                    border: `1px solid ${cat.is_active ? 'rgba(197, 160, 89, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    borderRadius: '8px',
                    opacity: cat.is_active ? 1 : 0.6
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#f7f3ea', fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      style={{ ...iconBtn, padding: '4px' }}
                      disabled={busy || idx === 0}
                      onClick={() => moveCategory(idx, -1)}
                      title="Déplacer à gauche"
                    >
                      <ArrowUp size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                    <button
                      type="button"
                      style={{ ...iconBtn, padding: '4px' }}
                      disabled={busy || idx === categories.length - 1}
                      onClick={() => moveCategory(idx, 1)}
                      title="Déplacer à droite"
                    >
                      <ArrowDown size={12} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                    <button
                      type="button"
                      style={{ ...iconBtn, padding: '4px' }}
                      onClick={() => handleToggleCategoryActive(cat)}
                      title={cat.is_active ? 'Visible' : 'Masquée'}
                    >
                      {cat.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      type="button"
                      style={{ ...iconBtn, padding: '4px', color: '#fca5a5' }}
                      onClick={() => handleDeleteCategory(cat)}
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div style={{ fontSize: '13px', color: '#7a7266' }}>Aucune catégorie créée.</div>
              )}
            </div>
          </div>

          {/* 3. MATERIALS CARDS */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#c5a059" />
                  <h2
                    style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '18px',
                      color: '#f7f3ea',
                      margin: 0
                    }}
                  >
                    3. Matériaux ({items.length})
                  </h2>
                </div>

                {/* Filter selector */}
                <select
                  style={{ ...inputStyle, width: 'auto', padding: '6px 12px', fontSize: '12px' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories ({items.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({items.filter((it) => it.category_id === c.id).length})
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" style={primaryBtn} onClick={addDraftItem}>
                <Plus size={14} /> Ajouter un matériau
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '22px' }}>
              {displayedItems.map((item, index) => (
                <MaterialCard
                  key={item.id || 'draft'}
                  item={item}
                  index={index}
                  total={items.length}
                  categories={categories}
                  token={token}
                  busy={busy}
                  onSaved={handleSavedItem}
                  onDeleted={handleDeletedItem}
                  onMove={moveItem}
                  onError={fail}
                />
              ))}
            </div>

            {displayedItems.length === 0 && (
              <div style={{ color: '#a0988c', textAlign: 'center', padding: '40px 0' }}>
                Aucun matériau dans cette sélection. Cliquez sur « Ajouter un matériau ».
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
