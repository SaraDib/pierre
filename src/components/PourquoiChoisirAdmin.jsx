import React, { useState, useEffect } from 'react';
import {
  Type,
  Hash,
  Image as ImageIcon,
  Upload,
  Save,
  RotateCcw,
  Eye,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import {
  DEFAULT_POURQUOI_CHOISIR,
  DEFAULT_POURQUOI_CATEGORIES,
  getPourquoiChoisirAdmin,
  updatePourquoiChoisir,
  resetPourquoiChoisir,
  formatPourquoiMediaUrl,
} from '../api/pourquoiChoisir';

export const POURQUOI_ICON_OPTIONS = [
  { value: 'home', label: 'Maison / Villa' },
  { value: 'hotel', label: 'Hôtel / Restaurant' },
  { value: 'shop', label: 'Commerce / Boutique' },
  { value: 'users', label: 'Espace public / Pro' },
  { value: 'building', label: 'Immeuble / Bureau' },
  { value: 'sparkles', label: 'Luxe / Sur-mesure' },
];

export function renderPourquoiCategorySvg(iconKey) {
  switch (iconKey) {
    case 'home':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
        </svg>
      );
    case 'hotel':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 21h10M12 3v4M3 11h18M6 21V11a6 6 0 0 1 12 0v10" />
        </svg>
      );
    case 'shop':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'building':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="9" y1="6" x2="9.01" y2="6" />
          <line x1="15" y1="6" x2="15.01" y2="6" />
          <line x1="9" y1="10" x2="9.01" y2="10" />
          <line x1="15" y1="10" x2="15.01" y2="10" />
          <line x1="9" y1="14" x2="9.01" y2="14" />
          <line x1="15" y1="14" x2="15.01" y2="14" />
          <path d="M9 22v-4h6v4" />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
        </svg>
      );
    case 'users':
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(17, 16, 15, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#f7f3ea',
  fontSize: '13px',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#a0988c',
  marginBottom: '6px',
  fontWeight: 600,
};

const cardStyle = {
  background: 'rgba(26, 24, 22, 0.85)',
  border: '1px solid rgba(197, 160, 89, 0.22)',
  borderRadius: '14px',
  padding: '24px',
};

export default function PourquoiChoisirAdmin({ token, onCountChange }) {
  const [form, setForm] = useState(DEFAULT_POURQUOI_CHOISIR);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPourquoiChoisirAdmin(token)
      .then((data) => {
        if (!mounted || !data) return;
        const cats =
          Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
            : DEFAULT_POURQUOI_CATEGORIES;
        setForm({ ...DEFAULT_POURQUOI_CHOISIR, ...data, categories: cats });
        if (onCountChange) onCountChange(cats.length);
      })
      .catch((err) => {
        console.warn('Chargement PourquoiChoisirAdmin:', err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCategoryChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...(prev.categories || [])];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, categories: next };
    });
  };

  const handleAddCategory = () => {
    setForm((prev) => {
      const next = [
        ...(prev.categories || []),
        {
          id: Date.now(),
          icon: 'home',
          line1: 'Nouveau domaine',
          line2: '& applications',
          is_active: true,
        },
      ];
      if (onCountChange) onCountChange(next.length);
      return { ...prev, categories: next };
    });
  };

  const handleRemoveCategory = (index) => {
    setForm((prev) => {
      const next = (prev.categories || []).filter((_, idx) => idx !== index);
      if (onCountChange) onCountChange(next.length);
      return { ...prev, categories: next };
    });
  };

  const handleMoveCategory = (index, dir) => {
    setForm((prev) => {
      const next = [...(prev.categories || [])];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return { ...prev, categories: next };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const fd = new FormData();
      const textFields = [
        'eyebrow',
        'title_line1',
        'title_line2',
        'description',
        'stat1_number',
        'stat1_label',
        'stat2_number',
        'stat2_label',
        'stat3_number',
        'stat3_label',
        'button_text',
        'button_link',
        'image',
        'image_alt',
        'quote_line1',
        'quote_line2',
        'quote_line3',
      ];
      textFields.forEach((key) => {
        fd.append(key, form[key] ?? '');
      });
      fd.append('categories', JSON.stringify(form.categories || []));

      if (imageFile) {
        fd.append('image_file', imageFile);
      }

      const updated = await updatePourquoiChoisir(fd, token);
      if (updated) {
        const cats =
          Array.isArray(updated.categories) && updated.categories.length > 0
            ? updated.categories
            : DEFAULT_POURQUOI_CATEGORIES;
        setForm((prev) => ({ ...prev, ...updated, categories: cats }));
        if (onCountChange) onCountChange(cats.length);
      }
      setImageFile(null);
      setImagePreview('');
      setFileInputKey((k) => k + 1);
      setSaveMessage('Section « Pourquoi nous choisir ? » enregistrée avec succès !');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Réinitialiser la section « Pourquoi nous choisir ? » aux valeurs par défaut ?')) {
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    try {
      const data = await resetPourquoiChoisir(token);
      if (data) {
        const cats =
          Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
            : DEFAULT_POURQUOI_CATEGORIES;
        setForm({ ...DEFAULT_POURQUOI_CHOISIR, ...data, categories: cats });
        if (onCountChange) onCountChange(cats.length);
      }
      setImageFile(null);
      setImagePreview('');
      setFileInputKey((k) => k + 1);
      setSaveMessage('Valeurs par défaut restaurées avec succès.');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setSaving(false);
    }
  };

  const displayedImage =
    imagePreview ||
    formatPourquoiMediaUrl(form.image) ||
    '/images/pourquoi-nous-choisir-escalier.jpg';

  return (
    <div>
      {/* Header banner */}
      <div
        style={{
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#f7f3ea',
              margin: '0 0 8px',
            }}
          >
            Gestion · Pourquoi nous choisir ?
          </h1>
          <p style={{ fontSize: '14px', color: '#a0988c', margin: 0, maxWidth: '720px' }}>
            Contrôlez l'accroche, le titre, la description, les 3 chiffres clés, l'image centrale avec sa citation superposée et les domaines d'application avec icônes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#a0988c',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <RotateCcw size={14} />
            <span>Réinitialiser par défaut</span>
          </button>

          <a
            href="/#savoir-faire"
            target="_blank"
            rel="noopener noreferrer"
            style={{
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
              textDecoration: 'none',
            }}
          >
            <Eye size={14} />
            <span>Aperçu en direct ↗</span>
          </a>
        </div>
      </div>

      {saveMessage && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            padding: '14px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Check size={18} />
          <span>{saveMessage}</span>
        </div>
      )}

      {saveError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '14px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          {/* CARD 1: TEXTES & BOUTON */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Type size={18} color="#c5a059" />
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                1. Accroche, Titre, Description & Bouton
              </h2>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Accroche supérieure (Eyebrow)</label>
              <input
                type="text"
                value={form.eyebrow || ''}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="POURQUOI NOUS CHOISIR ?"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Titre — Ligne 1</label>
                <input
                  type="text"
                  value={form.title_line1 || ''}
                  onChange={(e) => setForm({ ...form, title_line1: e.target.value })}
                  placeholder="L'excellence"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Titre — Ligne 2</label>
                <input
                  type="text"
                  value={form.title_line2 || ''}
                  onChange={(e) => setForm({ ...form, title_line2: e.target.value })}
                  placeholder="au cœur de chaque projet."
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Description</label>
              <textarea
                rows={4}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Texte du bouton</label>
                <input
                  type="text"
                  value={form.button_text || ''}
                  onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                  placeholder="En savoir plus"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Lien du bouton</label>
                <input
                  type="text"
                  value={form.button_link || ''}
                  onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                  placeholder="#materiaux ou /detailsmateriaux"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* CARD 2: CHIFFRES CLÉS */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Hash size={18} color="#c5a059" />
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                2. Les 3 Chiffres Clés
              </h2>
            </div>

            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr',
                  gap: '12px',
                  marginBottom: n < 3 ? '16px' : 0,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <label style={labelStyle}>Valeur #{n}</label>
                  <input
                    type="text"
                    value={form[`stat${n}_number`] || ''}
                    onChange={(e) => setForm({ ...form, [`stat${n}_number`]: e.target.value })}
                    placeholder={n === 1 ? '+500' : n === 2 ? '100%' : '15 ans'}
                    style={{ ...inputStyle, color: '#c5a059', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Libellé #{n}</label>
                  <input
                    type="text"
                    value={form[`stat${n}_label`] || ''}
                    onChange={(e) => setForm({ ...form, [`stat${n}_label`]: e.target.value })}
                    placeholder={n === 1 ? 'Projets réalisés' : n === 2 ? 'Clients satisfaits' : "D'expérience"}
                    style={inputStyle}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* CARD 3: IMAGE CENTRALE & CITATION */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <ImageIcon size={18} color="#c5a059" />
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                3. Image Centrale & Citation Superposée
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div
                style={{
                  width: '120px',
                  height: '150px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  flexShrink: 0,
                  position: 'relative',
                  background: '#11100f',
                }}
              >
                <img
                  src={displayedImage}
                  alt={form.image_alt || 'Aperçu'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Téléverser une nouvelle image</label>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 14px',
                      borderRadius: '8px',
                      background: 'rgba(197, 160, 89, 0.14)',
                      border: '1px solid rgba(197, 160, 89, 0.35)',
                      color: '#c5a059',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={14} />
                    <span>{imageFile ? imageFile.name : 'Choisir un fichier image...'}</span>
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Ou chemin / URL de l'image</label>
                  <input
                    type="text"
                    value={form.image || ''}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="/images/pourquoi-nous-choisir-escalier.jpg"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Texte alternatif (SEO / Alt)</label>
                  <input
                    type="text"
                    value={form.image_alt || ''}
                    onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Citation — Ligne 1</label>
                <input
                  type="text"
                  value={form.quote_line1 || ''}
                  onChange={(e) => setForm({ ...form, quote_line1: e.target.value })}
                  placeholder="La pierre"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Citation — Ligne 2</label>
                <input
                  type="text"
                  value={form.quote_line2 || ''}
                  onChange={(e) => setForm({ ...form, quote_line2: e.target.value })}
                  placeholder="révèle le caractère"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Citation — Ligne 3</label>
                <input
                  type="text"
                  value={form.quote_line3 || ''}
                  onChange={(e) => setForm({ ...form, quote_line3: e.target.value })}
                  placeholder="de vos espaces"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* CARD 4: CATÉGORIES / DOMAINES D'APPLICATION */}
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  4. Domaines d'Application (Colonne droite)
                </h2>
              </div>

              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  color: '#c5a059',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Ajouter</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(form.categories || []).map((cat, idx) => (
                <div
                  key={cat.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 150px 1fr 1fr auto',
                    gap: '8px',
                    alignItems: 'center',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '1px solid rgba(197, 160, 89, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#c5a059',
                    }}
                  >
                    <div style={{ width: '18px', height: '18px' }}>
                      {renderPourquoiCategorySvg(cat.icon)}
                    </div>
                  </div>

                  <select
                    value={cat.icon || 'home'}
                    onChange={(e) => handleCategoryChange(idx, 'icon', e.target.value)}
                    style={inputStyle}
                  >
                    {POURQUOI_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={cat.line1 || ''}
                    onChange={(e) => handleCategoryChange(idx, 'line1', e.target.value)}
                    placeholder="Ligne 1 (ex: Maisons)"
                    style={inputStyle}
                  />

                  <input
                    type="text"
                    value={cat.line2 || ''}
                    onChange={(e) => handleCategoryChange(idx, 'line2', e.target.value)}
                    placeholder="Ligne 2 (ex: & villas)"
                    style={inputStyle}
                  />

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, -1)}
                      disabled={idx === 0}
                      title="Monter"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#a0988c',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveCategory(idx, 1)}
                      disabled={idx === (form.categories?.length || 1) - 1}
                      title="Descendre"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#a0988c',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor:
                          idx === (form.categories?.length || 1) - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      title="Supprimer"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: '#fca5a5',
                        borderRadius: '6px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '18px 24px',
            background: 'rgba(26, 24, 22, 0.9)',
            border: '1px solid rgba(197, 160, 89, 0.25)',
            borderRadius: '12px',
          }}
        >
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 26px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #c5a059, #9e7d3b)',
              border: 'none',
              color: '#11100f',
              fontSize: '14px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

