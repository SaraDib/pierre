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
  Edit,
  X,
  Save,
  Type,
  Layers,
  ExternalLink
} from 'lucide-react';
import {
  getCatalogueAdmin,
  updateCatalogueSection,
  saveCatalogueItem,
  deleteCatalogueItem,
  reorderCatalogueItems
} from '../api/catalogue';
import { formatMediaUrl } from '../api/acceuil';
import LuxuryLoader from './LuxuryLoader';
import MateriauxAdmin from './MateriauxAdmin';

const cardStyle = {
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
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none'
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

const EMPTY_FORM = {
  name: '',
  variant: '',
  type: '',
  description: '',
  origin: '',
  finish: '',
  thickness: '',
  uses: '',
  maintenance: '',
  is_active: true
};

let galleryKey = 0;

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

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: '11px', color: '#7d766b', marginTop: '5px' }}>{hint}</div>}
    </div>
  );
}

/** Champ image : aperçu + choix de fichier (+ suppression optionnelle) */
function ImageField({ label, hint, preview, onFile, onRemove }) {
  return (
    <Field label={label} hint={hint}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div
          style={{
            width: '72px',
            height: '92px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: '#7d766b',
            fontSize: '10px'
          }}
        >
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            'Aucune'
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            style={{ color: '#efe8db', fontSize: '12px' }}
          />
          {preview && onRemove && (
            <button type="button" onClick={onRemove} style={{ ...iconBtn, padding: '5px 10px', fontSize: '12px', width: 'fit-content' }}>
              Retirer l'image
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

export default function CatalogueAdmin({ token, onCountChange }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'section' | 'svg'
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [section, setSection] = useState({
    eyebrow: 'NOS MATÉRIAUX',
    title: "Une sélection d'exception",
    title_em: '',
    description: 'Marbre, granit, pierre naturelle... Des matériaux nobles, soigneusement sélectionnés pour leur beauté, leur résistance et leur durabilité.'
  });
  const [savingSection, setSavingSection] = useState(false);

  // Modal créer / modifier
  const [editing, setEditing] = useState(null); // null = fermé, {} = création, item = édition
  const [form, setForm] = useState(EMPTY_FORM);
  const [cardImage, setCardImage] = useState({ file: null, preview: null, remove: false });
  const [heroImage, setHeroImage] = useState({ file: null, preview: null, remove: false });
  const [gallery, setGallery] = useState([]); // [{ key, src?, file?, preview, alt }]
  const [saving, setSaving] = useState(false);

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
    getCatalogueAdmin(token)
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res) ? res : res?.items || [];
        setItems(list);
        if (res?.section) {
          setSection({
            eyebrow: res.section.eyebrow || '',
            title: res.section.title || '',
            title_em: res.section.title_em || '',
            description: res.section.description || ''
          });
        }
      })
      .catch((err) => {
        if (!cancelled) fail(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items, onCountChange]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSaveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      const updated = await updateCatalogueSection(section, token);
      if (updated) {
        setSection({
          eyebrow: updated.eyebrow || '',
          title: updated.title || '',
          title_em: updated.title_em || '',
          description: updated.description || ''
        });
      }
      flash("En-tête de la section « Nos matériaux » enregistré.");
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setCardImage({ file: null, preview: null, remove: false });
    setHeroImage({ file: null, preview: null, remove: false });
    setGallery([]);
    setEditing({});
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || '',
      variant: item.variant || '',
      type: item.type || '',
      description: item.description || '',
      origin: item.specs?.origin || '',
      finish: item.specs?.finish || '',
      thickness: item.specs?.thickness || '',
      uses: (item.specs?.uses || []).join(', '),
      maintenance: item.specs?.maintenance || '',
      is_active: Boolean(item.is_active)
    });
    setCardImage({ file: null, preview: formatMediaUrl(item.image) || null, remove: false });
    setHeroImage({ file: null, preview: formatMediaUrl(item.hero) || null, remove: false });
    setGallery(
      (item.gallery || []).map((g) => ({ key: ++galleryKey, src: g.src, preview: formatMediaUrl(g.src), alt: g.alt || '' }))
    );
    setEditing(item);
  };

  const pickFile = (setter) => (file) =>
    setter({ file, preview: URL.createObjectURL(file), remove: false });

  const addGalleryFiles = (fileList) => {
    const added = Array.from(fileList).map((file) => ({
      key: ++galleryKey,
      file,
      preview: URL.createObjectURL(file),
      alt: ''
    }));
    setGallery((g) => [...g, ...added].slice(0, 8));
  };

  const moveGallery = (index, dir) => {
    setGallery((g) => {
      const next = [...g];
      const j = index + dir;
      if (j < 0 || j >= next.length) return g;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const buildFormData = (f, extra = {}) => {
    const fd = new FormData();
    fd.append('name', f.name.trim());
    fd.append('variant', (f.variant || '').trim());
    fd.append('type', (f.type || '').trim());
    fd.append('description', (f.description || '').trim());
    fd.append('origin', (f.origin || '').trim());
    fd.append('finish', (f.finish || '').trim());
    fd.append('thickness', (f.thickness || '').trim());
    fd.append('maintenance', (f.maintenance || '').trim());
    fd.append(
      'uses',
      JSON.stringify(String(f.uses || '').split(',').map((s) => s.trim()).filter(Boolean))
    );
    fd.append('is_active', f.is_active ? '1' : '0');
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return fd;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      fail('Le nom du matériau est obligatoire (ex : Marbre).');
      return;
    }

    setSaving(true);
    try {
      const fd = buildFormData(form);

      if (cardImage.file) fd.append('image_file', cardImage.file);
      else if (cardImage.remove) fd.append('remove_image', '1');

      if (heroImage.file) fd.append('hero_file', heroImage.file);
      else if (heroImage.remove) fd.append('remove_hero', '1');

      const kept = gallery.filter((g) => !g.file).map((g) => ({ src: g.src, alt: g.alt }));
      const added = gallery.filter((g) => g.file);
      fd.append('gallery', JSON.stringify(kept));
      fd.append('gallery_alts', JSON.stringify(added.map((g) => g.alt)));
      added.forEach((g) => fd.append('gallery_files[]', g.file));

      const isEdit = Boolean(editing?.id);
      const saved = await saveCatalogueItem(fd, token, isEdit ? editing.id : undefined);

      if (isEdit) {
        setItems(items.map((i) => (i.id === saved.id ? saved : i)));
        flash(`« ${saved.name} ${saved.variant || ''} » mis à jour.`);
      } else {
        setItems([...items, saved]);
        flash(`« ${saved.name} ${saved.variant || ''} » ajouté : carte et page créées.`);
      }
      setEditing(null);
    } catch (err) {
      fail(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Supprimer définitivement « ${item.name} ${item.variant || ''} » (carte + page) ?`)) return;
    setBusy(true);
    try {
      await deleteCatalogueItem(item.id, token);
      setItems(items.filter((i) => i.id !== item.id));
      flash('Matériau supprimé.');
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (item) => {
    setBusy(true);
    try {
      const fd = buildFormData({
        name: item.name,
        variant: item.variant,
        type: item.type,
        description: item.description,
        origin: item.specs?.origin,
        finish: item.specs?.finish,
        thickness: item.specs?.thickness,
        uses: (item.specs?.uses || []).join(','),
        maintenance: item.specs?.maintenance,
        is_active: !item.is_active
      });
      const updated = await saveCatalogueItem(fd, token, item.id);
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
      flash(updated.is_active ? 'Matériau visible sur le site.' : 'Matériau masqué du site.');
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await reorderCatalogueItems(next.map((i) => i.id), token);
      flash('Ordre mis à jour.');
    } catch (err) {
      setItems(items);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <LuxuryLoader />;

  const tabBtnStyle = (active) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    borderRadius: '10px',
    border: active ? '1px solid rgba(197, 160, 89, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    background: active ? 'rgba(197, 160, 89, 0.16)' : 'rgba(26, 24, 22, 0.6)',
    color: active ? '#c5a059' : '#a0988c',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer'
  });

  return (
    <div>
      {/* Navigation par sous-onglets */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <button type="button" onClick={() => setActiveTab('cards')} style={tabBtnStyle(activeTab === 'cards')}>
          <Layers size={15} /> Matériaux ({items.length})
        </button>
        <button type="button" onClick={() => setActiveTab('section')} style={tabBtnStyle(activeTab === 'section')}>
          <Type size={15} /> En-tête de la section
        </button>
        {/* Commenté temporairement :
        <button type="button" onClick={() => setActiveTab('svg')} style={tabBtnStyle(activeTab === 'svg')}>
          Textures SVG (Savoir-faire / Arche)
        </button>
        */}
      </div>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {/* {activeTab === 'svg' && <MateriauxAdmin token={token} />} */}

      {activeTab === 'section' && (
        <form onSubmit={handleSaveSection} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Type size={18} color="#c5a059" />
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
              En-tête « Nos matériaux » (Accueil & /detailsmateriaux)
            </h2>
          </div>

          <Field label="Accroche (Eyebrow)">
            <input
              type="text"
              style={inputStyle}
              value={section.eyebrow}
              placeholder="NOS MATÉRIAUX"
              onChange={(e) => setSection({ ...section, eyebrow: e.target.value })}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Field label="Titre principal">
              <input
                type="text"
                style={inputStyle}
                value={section.title}
                placeholder="Une sélection d'exception"
                onChange={(e) => setSection({ ...section, title: e.target.value })}
              />
            </Field>
            <Field label="Fin du titre en italique (optionnel)">
              <input
                type="text"
                style={inputStyle}
                value={section.title_em}
                placeholder=""
                onChange={(e) => setSection({ ...section, title_em: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={section.description}
              onChange={(e) => setSection({ ...section, description: e.target.value })}
            />
          </Field>

          <button type="submit" disabled={savingSection} style={primaryBtn}>
            <Save size={15} /> {savingSection ? 'Enregistrement…' : "Enregistrer l'en-tête"}
          </button>
        </form>
      )}

      {activeTab === 'cards' && (
        <>
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
                  Matériaux
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a0988c', maxWidth: '640px', lineHeight: 1.6 }}>
                  Chaque matériau crée automatiquement une carte dans le carrousel « Nos matériaux » de l'accueil, une carte dans la grille{' '}
                  <a href="/detailsmateriaux" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>
                    /detailsmateriaux
                  </a>{' '}
                  et sa propre page détail.
                </p>
              </div>
              <button type="button" onClick={openCreate} style={primaryBtn}>
                <Plus size={16} /> Ajouter un matériau
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {items.length === 0 && (
              <div style={{ ...cardStyle, color: '#a0988c', fontSize: '14px' }}>Aucun matériau pour le moment.</div>
            )}
            {items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...cardStyle,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: item.is_active ? 1 : 0.55,
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: item.fallbackGradient || '#2a2723'
                  }}
                >
                  {item.image && (
                    <img
                      src={formatMediaUrl(item.image)}
                      alt={`${item.name} ${item.variant || ''}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '180px' }}>
                  <div style={{ color: '#f7f3ea', fontWeight: 600, fontSize: '15px' }}>
                    {item.name} <span style={{ color: '#c5a059', fontWeight: 400 }}>{item.variant}</span>
                  </div>
                  <div style={{ color: '#a0988c', fontSize: '12px', marginTop: '3px' }}>
                    Filtre : {item.type} · /detailsmateriaux/{item.slug}
                    {!item.is_active && ' · masqué'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`/detailsmateriaux/${item.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={iconBtn}
                    title="Ouvrir la page du matériau"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button type="button" disabled={busy || index === 0} onClick={() => handleMove(index, -1)} style={iconBtn} title="Monter">
                    <ArrowUp size={15} />
                  </button>
                  <button type="button" disabled={busy || index === items.length - 1} onClick={() => handleMove(index, 1)} style={iconBtn} title="Descendre">
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleToggle(item)} style={iconBtn} title={item.is_active ? 'Masquer' : 'Afficher'}>
                    {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button type="button" disabled={busy} onClick={() => openEdit(item)} style={iconBtn} title="Modifier">
                    <Edit size={15} />
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleDelete(item)} style={{ ...iconBtn, color: '#fca5a5' }} title="Supprimer">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 16px',
            overflowY: 'auto'
          }}
          onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            style={{ ...cardStyle, background: '#1a1816', width: '100%', maxWidth: '760px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px' }}>
                {editing.id ? 'Modifier le matériau' : 'Nouveau matériau'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} style={iconBtn} aria-label="Fermer">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 18px' }}>
              <Field label="Nom (ligne en gras) *">
                <input style={inputStyle} value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="Marbre" />
              </Field>
              <Field label="Variante (ligne dessous)">
                <input style={inputStyle} value={form.variant} onChange={(e) => setField('variant', e.target.value)} placeholder="Calacatta" />
              </Field>
              <Field label="Type (onglet de filtre)" hint="Laisser vide = identique au nom.">
                <input style={inputStyle} value={form.type} onChange={(e) => setField('type', e.target.value)} placeholder="Marbre" />
              </Field>
            </div>

            <Field label="Description">
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={(e) => setField('description', e.target.value)} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 18px' }}>
              <Field label="Origine">
                <input style={inputStyle} value={form.origin} onChange={(e) => setField('origin', e.target.value)} />
              </Field>
              <Field label="Finition">
                <input style={inputStyle} value={form.finish} onChange={(e) => setField('finish', e.target.value)} />
              </Field>
              <Field label="Épaisseur">
                <input style={inputStyle} value={form.thickness} onChange={(e) => setField('thickness', e.target.value)} />
              </Field>
            </div>

            <Field label="Usages" hint="Séparés par des virgules (ex : Escaliers, Plans de travail).">
              <input style={inputStyle} value={form.uses} onChange={(e) => setField('uses', e.target.value)} />
            </Field>

            <Field label="Entretien">
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.maintenance} onChange={(e) => setField('maintenance', e.target.value)} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0 18px' }}>
              <ImageField
                label="Image de la carte (texture plein cadre)"
                hint="Close-up de la texture, sans fond ni bord. Recadrée automatiquement."
                preview={cardImage.preview}
                onFile={pickFile(setCardImage)}
                onRemove={() => setCardImage({ file: null, preview: null, remove: true })}
              />
              <ImageField
                label="Grande image de la page détail"
                hint="Optionnelle : par défaut, l'image de la carte."
                preview={heroImage.preview}
                onFile={pickFile(setHeroImage)}
                onRemove={() => setHeroImage({ file: null, preview: null, remove: true })}
              />
            </div>

            <Field label={`Galerie (${gallery.length}/8)`} hint="Texte alternatif = description de l'image (accessibilité et SEO).">
              <div style={{ display: 'grid', gap: '10px', marginBottom: '10px' }}>
                {gallery.map((g, i) => (
                  <div key={g.key} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={g.preview} alt="" style={{ width: '44px', height: '56px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                    <input
                      style={inputStyle}
                      value={g.alt}
                      placeholder="Texte alternatif"
                      onChange={(e) => setGallery(gallery.map((x) => (x.key === g.key ? { ...x, alt: e.target.value } : x)))}
                    />
                    <button type="button" style={iconBtn} onClick={() => moveGallery(i, -1)} disabled={i === 0} title="Monter"><ArrowUp size={14} /></button>
                    <button type="button" style={iconBtn} onClick={() => moveGallery(i, 1)} disabled={i === gallery.length - 1} title="Descendre"><ArrowDown size={14} /></button>
                    <button type="button" style={{ ...iconBtn, color: '#fca5a5' }} onClick={() => setGallery(gallery.filter((x) => x.key !== g.key))} title="Retirer"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
              {gallery.length < 8 && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addGalleryFiles(e.target.files);
                    e.target.value = '';
                  }}
                  style={{ color: '#efe8db', fontSize: '12px' }}
                />
              )}
            </Field>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#efe8db', fontSize: '13px', marginBottom: '22px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
              Visible sur le site
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setEditing(null)} style={{ ...iconBtn, padding: '10px 16px', fontSize: '13px' }}>
                Annuler
              </button>
              <button type="submit" disabled={saving} style={primaryBtn}>
                <Save size={15} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
