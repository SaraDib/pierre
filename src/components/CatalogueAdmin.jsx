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
  FolderKanban,
  ExternalLink,
} from 'lucide-react';
import {
  getCatalogueAdmin,
  getCatalogueCategoriesAdmin,
  saveCatalogueCategory,
  deleteCatalogueCategory,
  reorderCatalogueCategories,
  updateCatalogueSection,
  saveCatalogueItem,
  deleteCatalogueItem,
  reorderCatalogueItems,
} from '../api/catalogue';
import { formatMediaUrl } from '../api/acceuil';
import LuxuryLoader from './LuxuryLoader';

const cardStyle = {
  background: 'rgba(26, 24, 22, 0.85)',
  border: '1px solid rgba(197, 160, 89, 0.22)',
  borderRadius: '14px',
  padding: '24px',
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

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(17, 16, 15, 0.8)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#f7f3ea',
  fontSize: '13px',
  outline: 'none',
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
  textDecoration: 'none',
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
  cursor: 'pointer',
};

const EMPTY_FORM = {
  category_id: '',
  name: '',
  variant: '',
  type: '',
  description: '',
  origin: '',
  finish: '',
  thickness: '',
  uses: '',
  maintenance: '',
  is_active: true,
};

const EMPTY_CATEGORY_FORM = {
  name: '',
  subtitle: '',
  description: '',
  is_active: true,
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
        gap: '10px',
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
            fontSize: '10px',
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
            <button
              type="button"
              onClick={onRemove}
              style={{ ...iconBtn, padding: '5px 10px', fontSize: '12px', width: 'fit-content' }}
            >
              Retirer l'image
            </button>
          )}
        </div>
      </div>
    </Field>
  );
}

export default function CatalogueAdmin({ token, onCountChange }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'cards' | 'section'
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [section, setSection] = useState({
    eyebrow: 'NOS MATÉRIAUX',
    title: "Une sélection d'exception",
    title_em: '',
    description:
      'Marbre, granit, pierre naturelle... Des matériaux nobles, soigneusement sélectionnés pour leur beauté, leur résistance et leur durabilité.',
  });
  const [savingSection, setSavingSection] = useState(false);

  // Modal créer / modifier une variété
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [cardImage, setCardImage] = useState({ file: null, preview: null, remove: false });
  const [heroImage, setHeroImage] = useState({ file: null, preview: null, remove: false });
  const [gallery, setGallery] = useState([]);
  const [saving, setSaving] = useState(false);

  // Modal créer / modifier un type (catégorie)
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY_FORM);
  const [catCardImage, setCatCardImage] = useState({ file: null, preview: null, remove: false });
  const [catHeroImage, setCatHeroImage] = useState({ file: null, preview: null, remove: false });
  const [savingCat, setSavingCat] = useState(false);

  const flash = (msg) => {
    setError(null);
    setMessage(`✓ ${msg}`);
    setTimeout(() => setMessage(null), 5000);
  };

  const fail = (msg) => {
    setMessage(null);
    setError(msg || 'Une erreur est survenue.');
  };

  const loadAll = () => {
    setLoading(true);
    return Promise.all([getCatalogueCategoriesAdmin(token), getCatalogueAdmin(token)])
      .then(([cats, res]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        const list = Array.isArray(res) ? res : res?.items || [];
        setItems(list);
        if (res?.section) {
          setSection({
            eyebrow: res.section.eyebrow || '',
            title: res.section.title || '',
            title_em: res.section.title_em || '',
            description: res.section.description || '',
          });
        }
      })
      .catch((err) => fail(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  useEffect(() => {
    if (onCountChange) onCountChange(items.length);
  }, [items, onCountChange]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  /* ------------------------------------------------ Section Header */
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
          description: updated.description || '',
        });
      }
      flash("En-tête de la section « Nos matériaux » enregistré.");
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  /* ------------------------------------------------ Types (Categories) CRUD */
  const openCreateCategory = () => {
    setCatForm(EMPTY_CATEGORY_FORM);
    setCatCardImage({ file: null, preview: null, remove: false });
    setCatHeroImage({ file: null, preview: null, remove: false });
    setEditingCategory({});
  };

  const openEditCategory = (cat) => {
    setCatForm({
      name: cat.name || '',
      subtitle: cat.subtitle || '',
      description: cat.description || '',
      is_active: Boolean(cat.is_active),
    });
    setCatCardImage({ file: null, preview: formatMediaUrl(cat.raw_image || cat.image) || null, remove: false });
    setCatHeroImage({ file: null, preview: formatMediaUrl(cat.raw_hero || cat.hero) || null, remove: false });
    setEditingCategory(cat);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catForm.name.trim()) {
      fail('Le nom du type est obligatoire (ex : Marbre).');
      return;
    }
    setSavingCat(true);
    try {
      const fd = new FormData();
      fd.append('name', catForm.name.trim());
      fd.append('subtitle', (catForm.subtitle || '').trim());
      fd.append('description', (catForm.description || '').trim());
      fd.append('is_active', catForm.is_active ? '1' : '0');

      if (catCardImage.file) fd.append('image_file', catCardImage.file);
      else if (catCardImage.remove) fd.append('remove_image', '1');

      if (catHeroImage.file) fd.append('hero_file', catHeroImage.file);
      else if (catHeroImage.remove) fd.append('remove_hero', '1');

      const isEdit = Boolean(editingCategory?.id);
      const saved = await saveCatalogueCategory(fd, token, isEdit ? editingCategory.id : undefined);

      if (isEdit) {
        setCategories(categories.map((c) => (c.id === saved.id ? saved : c)));
        flash(`Type « ${saved.name} » mis à jour.`);
      } else {
        setCategories([...categories, saved]);
        flash(`Type « ${saved.name} » créé.`);
      }
      setEditingCategory(null);
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingCat(false);
    }
  };

  const handleToggleCategory = async (cat) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('name', cat.name);
      fd.append('subtitle', cat.subtitle || '');
      fd.append('description', cat.description || '');
      fd.append('is_active', !cat.is_active ? '1' : '0');
      const saved = await saveCatalogueCategory(fd, token, cat.id);
      setCategories(categories.map((c) => (c.id === saved.id ? saved : c)));
      flash(saved.is_active ? 'Type visible sur le site.' : 'Type masqué du site.');
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleMoveCategory = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[index], next[j]] = [next[j], next[index]];
    setCategories(next);
    setBusy(true);
    try {
      await reorderCatalogueCategories(next.map((c) => c.id), token);
      flash('Ordre des types mis à jour.');
    } catch (err) {
      setCategories(categories);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Supprimer le type « ${cat.name} » ?`)) return;
    setBusy(true);
    try {
      await deleteCatalogueCategory(cat.id, token);
      setCategories(categories.filter((c) => c.id !== cat.id));
      flash('Type supprimé.');
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------------------------ Variétés (Materials) CRUD */
  const openCreate = (preselectCatId) => {
    const defaultCatId =
      preselectCatId && preselectCatId !== 'all'
        ? preselectCatId
        : selectedCategoryId !== 'all'
          ? selectedCategoryId
          : categories[0]?.id || '';
    const foundCat = categories.find((c) => String(c.id) === String(defaultCatId));

    setForm({
      ...EMPTY_FORM,
      category_id: defaultCatId,
      name: foundCat?.name || '',
      type: foundCat?.name || '',
    });
    setCardImage({ file: null, preview: null, remove: false });
    setHeroImage({ file: null, preview: null, remove: false });
    setGallery([]);
    setEditing({});
  };

  const openEdit = (item) => {
    setForm({
      category_id: item.category_id || categories.find((c) => c.name === item.type)?.id || '',
      name: item.name || '',
      variant: item.variant || '',
      type: item.type || '',
      description: item.description || '',
      origin: item.specs?.origin || '',
      finish: item.specs?.finish || '',
      thickness: item.specs?.thickness || '',
      uses: (item.specs?.uses || []).join(', '),
      maintenance: item.specs?.maintenance || '',
      is_active: Boolean(item.is_active),
    });
    setCardImage({ file: null, preview: formatMediaUrl(item.image) || null, remove: false });
    setHeroImage({ file: null, preview: formatMediaUrl(item.hero) || null, remove: false });
    setGallery(
      (item.gallery || []).map((g) => ({
        key: ++galleryKey,
        src: g.src,
        preview: formatMediaUrl(g.src),
        alt: g.alt || '',
      }))
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
      alt: '',
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
    const chosenCat = categories.find((c) => String(c.id) === String(f.category_id));
    fd.append('category_id', f.category_id);
    fd.append('name', (f.name || chosenCat?.name || '').trim());
    fd.append('variant', (f.variant || '').trim());
    fd.append('type', (chosenCat?.name || f.type || f.name || '').trim());
    fd.append('description', (f.description || '').trim());
    fd.append('origin', (f.origin || '').trim());
    fd.append('finish', (f.finish || '').trim());
    fd.append('thickness', (f.thickness || '').trim());
    fd.append('maintenance', (f.maintenance || '').trim());
    fd.append(
      'uses',
      JSON.stringify(
        String(f.uses || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
    fd.append('is_active', f.is_active ? '1' : '0');
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return fd;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.category_id) {
      fail('Veuillez choisir le type de matériau (ex : Marbre).');
      return;
    }
    if (!form.variant.trim() && !form.name.trim()) {
      fail('Veuillez indiquer le nom de la variété (ex : Calacatta).');
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
        flash(`« ${saved.name} ${saved.variant || ''} » ajouté.`);
      }
      setEditing(null);
      getCatalogueCategoriesAdmin(token).then(setCategories).catch(() => {});
    } catch (err) {
      fail(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Supprimer définitivement « ${item.name} ${item.variant || ''} » ?`)) return;
    setBusy(true);
    try {
      await deleteCatalogueItem(item.id, token);
      setItems(items.filter((i) => i.id !== item.id));
      getCatalogueCategoriesAdmin(token).then(setCategories).catch(() => {});
      flash('Variété supprimée.');
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
        category_id: item.category_id || categories.find((c) => c.name === item.type)?.id || '',
        name: item.name,
        variant: item.variant,
        type: item.type,
        description: item.description,
        origin: item.specs?.origin,
        finish: item.specs?.finish,
        thickness: item.specs?.thickness,
        uses: (item.specs?.uses || []).join(','),
        maintenance: item.specs?.maintenance,
        is_active: !item.is_active,
      });
      const updated = await saveCatalogueItem(fd, token, item.id);
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
      getCatalogueCategoriesAdmin(token).then(setCategories).catch(() => {});
      flash(updated.is_active ? 'Variété visible sur le site.' : 'Variété masquée du site.');
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
    cursor: 'pointer',
  });

  const filteredItems =
    selectedCategoryId === 'all'
      ? items
      : items.filter((i) => String(i.category_id) === String(selectedCategoryId));

  return (
    <div>
      {/* Navigation par sous-onglets */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <button type="button" onClick={() => setActiveTab('categories')} style={tabBtnStyle(activeTab === 'categories')}>
          <FolderKanban size={15} /> 1. Types de matériaux ({categories.length})
        </button>
        <button type="button" onClick={() => setActiveTab('cards')} style={tabBtnStyle(activeTab === 'cards')}>
          <Layers size={15} /> 2. Variétés par type ({items.length})
        </button>
        <button type="button" onClick={() => setActiveTab('section')} style={tabBtnStyle(activeTab === 'section')}>
          <Type size={15} /> 3. En-tête de la section
        </button>
      </div>

      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {/* ==================== ONGLET 1 : TYPES DE MATÉRIAUX ==================== */}
      {activeTab === 'categories' && (
        <>
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
                  Types de matériaux (Marbre, Granit, Onyx…)
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a0988c', maxWidth: '680px', lineHeight: 1.6 }}>
                  Chaque type apparaît dans le carrousel de l'accueil et sur{' '}
                  <a href="/detailsmateriaux" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>
                    /detailsmateriaux
                  </a>
                  . En cliquant sur un type (ex : <b>Marbre</b>), le visiteur arrive sur sa page dédiée listant toutes ses variétés.
                </p>
              </div>
              <button type="button" onClick={openCreateCategory} style={primaryBtn}>
                <Plus size={16} /> Ajouter un type
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                style={{
                  ...cardStyle,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  opacity: cat.is_active ? 1 : 0.55,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '70px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: cat.fallbackGradient || '#2a2723',
                  }}
                >
                  {cat.image && (
                    <img
                      src={formatMediaUrl(cat.image)}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ color: '#f7f3ea', fontWeight: 600, fontSize: '16px' }}>
                    {cat.name}{' '}
                    <span style={{ color: '#c5a059', fontWeight: 500, fontSize: '13px' }}>
                      ({cat.materials_count || 0} {(cat.materials_count || 0) > 1 ? 'variétés' : 'variété'})
                    </span>
                  </div>
                  <div style={{ color: '#a0988c', fontSize: '12px', marginTop: '3px' }}>
                    Page du type : /detailsmateriaux/{cat.slug}
                    {!cat.is_active && ' · masqué'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setActiveTab('cards');
                    }}
                    style={{ ...primaryBtn, padding: '7px 12px', fontSize: '12px' }}
                  >
                    <Layers size={14} /> Gérer les variétés ({cat.materials_count || 0})
                  </button>
                  <a
                    href={`/detailsmateriaux/${cat.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={iconBtn}
                    title="Ouvrir la page de ce type"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button type="button" disabled={busy || index === 0} onClick={() => handleMoveCategory(index, -1)} style={iconBtn} title="Monter">
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === categories.length - 1}
                    onClick={() => handleMoveCategory(index, 1)}
                    style={iconBtn}
                    title="Descendre"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" disabled={busy} onClick={() => handleToggleCategory(cat)} style={iconBtn} title={cat.is_active ? 'Masquer' : 'Afficher'}>
                    {cat.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button type="button" disabled={busy} onClick={() => openEditCategory(cat)} style={iconBtn} title="Modifier ce type">
                    <Edit size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteCategory(cat)}
                    style={{ ...iconBtn, color: '#fca5a5' }}
                    title="Supprimer ce type"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ==================== ONGLET 2 : VARIÉTÉS PAR TYPE ==================== */}
      {activeTab === 'cards' && (
        <>
          <div style={{ ...cardStyle, marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400 }}>
                  Variétés de pierres (Calacatta, Statuario, Noir Absolu…)
                </h2>
                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a0988c', maxWidth: '640px', lineHeight: 1.6 }}>
                  Filtrez par type de matériau (ex : <b>Marbre</b>) et ajoutez autant de variétés que souhaité. Chaque variété possède sa propre fiche technique complète.
                </p>
              </div>
              <button type="button" onClick={() => openCreate(selectedCategoryId)} style={primaryBtn}>
                <Plus size={16} /> Ajouter une variété
              </button>
            </div>

            {/* Filtre par type */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelectedCategoryId('all')}
                style={{
                  ...tabBtnStyle(selectedCategoryId === 'all'),
                  padding: '7px 14px',
                  fontSize: '12px',
                }}
              >
                Tous ({items.length})
              </button>
              {categories.map((cat) => {
                const count = items.filter((i) => String(i.category_id) === String(cat.id)).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    style={{
                      ...tabBtnStyle(String(selectedCategoryId) === String(cat.id)),
                      padding: '7px 14px',
                      fontSize: '12px',
                    }}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {filteredItems.length === 0 && (
              <div style={{ ...cardStyle, color: '#a0988c', fontSize: '14px' }}>
                Aucune variété dans ce type pour le moment.
              </div>
            )}
            {filteredItems.map((item) => {
              const globalIdx = items.findIndex((x) => x.id === item.id);
              const catSlug = item.category?.slug || categories.find((c) => c.id === item.category_id)?.slug || '';
              const detailUrl = catSlug ? `/detailsmateriaux/${catSlug}/${item.slug}` : `/detailsmateriaux/${item.slug}`;

              return (
                <div
                  key={item.id}
                  style={{
                    ...cardStyle,
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    opacity: item.is_active ? 1 : 0.55,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '70px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: item.fallbackGradient || '#2a2723',
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
                      Type : <b>{item.type}</b> · {detailUrl}
                      {!item.is_active && ' · masqué'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={iconBtn}
                      title="Ouvrir la fiche détail"
                    >
                      <ExternalLink size={15} />
                    </a>
                    <button
                      type="button"
                      disabled={busy || globalIdx <= 0}
                      onClick={() => handleMove(globalIdx, -1)}
                      style={iconBtn}
                      title="Monter"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={busy || globalIdx === items.length - 1}
                      onClick={() => handleMove(globalIdx, 1)}
                      style={iconBtn}
                      title="Descendre"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleToggle(item)}
                      style={iconBtn}
                      title={item.is_active ? 'Masquer' : 'Afficher'}
                    >
                      {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button type="button" disabled={busy} onClick={() => openEdit(item)} style={iconBtn} title="Modifier">
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(item)}
                      style={{ ...iconBtn, color: '#fca5a5' }}
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ==================== ONGLET 3 : EN-TÊTE DE LA SECTION ==================== */}
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

      {/* ==================== MODAL CRÉER / MODIFIER UN TYPE ==================== */}
      {editingCategory && (
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
            overflowY: 'auto',
          }}
          onMouseDown={(e) => e.target === e.currentTarget && setEditingCategory(null)}
        >
          <form
            onSubmit={handleSaveCategory}
            style={{ ...cardStyle, background: '#1a1816', width: '100%', maxWidth: '640px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px' }}>
                {editingCategory.id ? 'Modifier le type de matériau' : 'Nouveau type de matériau'}
              </h3>
              <button type="button" onClick={() => setEditingCategory(null)} style={iconBtn} aria-label="Fermer">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
              <Field label="Nom du type *">
                <input
                  style={inputStyle}
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="Ex : Marbre"
                />
              </Field>
              <Field label="Sous-titre sur la carte (optionnel)" hint="Vide = affiche automatiquement « X variétés ».">
                <input
                  style={inputStyle}
                  value={catForm.subtitle}
                  onChange={(e) => setCatForm({ ...catForm, subtitle: e.target.value })}
                  placeholder="Ex : 5 variétés d'exception"
                />
              </Field>
            </div>

            <Field label="Description de la famille de pierre">
              <textarea
                style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 18px' }}>
              <ImageField
                label="Image de la carte du type"
                hint="Optionnelle : par défaut, utilise l'image de la 1re variété."
                preview={catCardImage.preview}
                onFile={pickFile(setCatCardImage)}
                onRemove={() => setCatCardImage({ file: null, preview: null, remove: true })}
              />
              <ImageField
                label="Image bannière du type"
                hint="Optionnelle."
                preview={catHeroImage.preview}
                onFile={pickFile(setCatHeroImage)}
                onRemove={() => setCatHeroImage({ file: null, preview: null, remove: true })}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#efe8db', fontSize: '13px', marginBottom: '22px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={catForm.is_active}
                onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
              />
              Visible sur le site
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setEditingCategory(null)} style={{ ...iconBtn, padding: '10px 16px', fontSize: '13px' }}>
                Annuler
              </button>
              <button type="submit" disabled={savingCat} style={primaryBtn}>
                <Save size={15} /> {savingCat ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== MODAL CRÉER / MODIFIER UNE VARIÉTÉ ==================== */}
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
            overflowY: 'auto',
          }}
          onMouseDown={(e) => e.target === e.currentTarget && setEditing(null)}
        >
          <form
            onSubmit={handleSave}
            style={{ ...cardStyle, background: '#1a1816', width: '100%', maxWidth: '760px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ margin: 0, color: '#f7f3ea', fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '20px' }}>
                {editing.id ? 'Modifier la variété' : 'Nouvelle variété de pierre'}
              </h3>
              <button type="button" onClick={() => setEditing(null)} style={iconBtn} aria-label="Fermer">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 18px' }}>
              <Field label="Type de matériau (Famille) *">
                <select
                  style={inputStyle}
                  value={form.category_id}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const found = categories.find((c) => String(c.id) === String(catId));
                    setForm((prev) => ({
                      ...prev,
                      category_id: catId,
                      name: found ? found.name : prev.name,
                      type: found ? found.name : prev.type,
                    }));
                  }}
                >
                  <option value="">— Choisir un type —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Nom de la variété *" hint="Ex : Calacatta, Statuario, Noir Absolu…">
                <input
                  style={inputStyle}
                  value={form.variant}
                  onChange={(e) => setField('variant', e.target.value)}
                  placeholder="Calacatta"
                />
              </Field>

              <Field label="Nom principal affiché" hint="Par défaut : le nom du type (ex: Marbre).">
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Marbre"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0 18px' }}>
              <Field label="Origine">
                <input style={inputStyle} value={form.origin} onChange={(e) => setField('origin', e.target.value)} placeholder="Carrare, Italie" />
              </Field>
              <Field label="Finition">
                <input style={inputStyle} value={form.finish} onChange={(e) => setField('finish', e.target.value)} placeholder="Poli, adouci ou satiné" />
              </Field>
              <Field label="Épaisseur">
                <input style={inputStyle} value={form.thickness} onChange={(e) => setField('thickness', e.target.value)} placeholder="2 cm, 3 cm" />
              </Field>
            </div>

            <Field label="Usages" hint="Séparés par des virgules (ex : Escaliers, Plans de travail).">
              <input style={inputStyle} value={form.uses} onChange={(e) => setField('uses', e.target.value)} />
            </Field>

            <Field label="Entretien">
              <textarea
                style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
                value={form.maintenance}
                onChange={(e) => setField('maintenance', e.target.value)}
              />
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
                    <button type="button" style={iconBtn} onClick={() => moveGallery(i, -1)} disabled={i === 0} title="Monter">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" style={iconBtn} onClick={() => moveGallery(i, 1)} disabled={i === gallery.length - 1} title="Descendre">
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      style={{ ...iconBtn, color: '#fca5a5' }}
                      onClick={() => setGallery(gallery.filter((x) => x.key !== g.key))}
                      title="Retirer"
                    >
                      <Trash2 size={14} />
                    </button>
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
