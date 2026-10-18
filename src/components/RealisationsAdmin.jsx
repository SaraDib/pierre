import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Boxes,
  Sparkles,
  Tag,
  Edit,
  X,
  ImageIcon,
  MapPin
} from 'lucide-react';
import {
  getRealisationsAdmin,
  updateRealisationsSection,
  saveRealisationItem,
  deleteRealisationItem,
  reorderRealisationItems,
  saveRealisationCategory,
  deleteRealisationCategory,
  reorderRealisationCategories
} from '../api/realisations';
import LuxuryLoader from './LuxuryLoader';

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
  justifyContent: 'center'
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

export default function RealisationsAdmin({ token, onCountChange }) {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'categories' | 'section'
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Data from backend
  const [section, setSection] = useState({
    hero_eyebrow: '',
    hero_title: '',
    hero_title_em: '',
    hero_description: '',
    bento_eyebrow: '',
    bento_title: '',
    bento_title_em: '',
    bento_description: '',
    cta_title: '',
    cta_title_em: '',
    cta_description: ''
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [materiauxOptions, setMateriauxOptions] = useState([]);

  // Filter & Search
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Project Modal State
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = new, item = edit
  const [itemForm, setItemForm] = useState({
    title: '',
    subtitle: '',
    short_title: '',
    category_id: '',
    stone: '',
    finish: '',
    location: '',
    short_description: '',
    description: '',
    grid_class: '',
    is_featured: false,
    is_active: true,
    materiaux_ids: []
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [removeGalleryIds, setRemoveGalleryIds] = useState([]);
  const [savingItem, setSavingItem] = useState(false);

  // Category Modal / Inline state
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Section saving state
  const [savingSection, setSavingSection] = useState(false);

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
    getRealisationsAdmin(token)
      .then((data) => {
        if (data.section) {
          setSection({
            hero_eyebrow: data.section.hero_eyebrow || '',
            hero_title: data.section.hero_title || '',
            hero_title_em: data.section.hero_title_em || '',
            hero_description: data.section.hero_description || '',
            bento_eyebrow: data.section.bento_eyebrow || '',
            bento_title: data.section.bento_title || '',
            bento_title_em: data.section.bento_title_em || '',
            bento_description: data.section.bento_description || '',
            cta_title: data.section.cta_title || '',
            cta_title_em: data.section.cta_title_em || '',
            cta_description: data.section.cta_description || ''
          });
        }
        setCategories(data.categories || []);
        setItems(data.items || []);
        setMateriauxOptions(data.materiaux_options || []);
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

  // Section Save
  const handleSaveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      await updateRealisationsSection(section, token);
      flash('En-têtes et textes enregistrés avec succès.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  // Open modal for create
  const handleOpenCreate = () => {
    setItemForm({
      title: '',
      subtitle: '',
      short_title: '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      stone: '',
      finish: '',
      location: '',
      short_description: '',
      description: '',
      grid_class: '',
      is_featured: false,
      is_active: true,
      materiaux_ids: []
    });
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(false);
    setGalleryFiles([]);
    setRemoveGalleryIds([]);
    setEditingItem({});
  };

  // Open modal for edit
  const handleOpenEdit = (item) => {
    setItemForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      short_title: item.short_title || item.shortTitle || '',
      category_id: item.category_id ? String(item.category_id) : '',
      stone: item.stone || '',
      finish: item.finish || '',
      location: item.location || item.loc || '',
      short_description: item.short_description || item.shortDesc || '',
      description: item.description || item.desc || '',
      grid_class: item.grid_class || item.gridClass || '',
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active),
      materiaux_ids: Array.isArray(item.materiaux_ids)
        ? item.materiaux_ids
        : (item.materiaux || []).map((m) => m.id)
    });
    setCoverFile(null);
    setCoverPreview(item.cover_image || item.img || null);
    setRemoveCover(false);
    setGalleryFiles([]);
    setRemoveGalleryIds([]);
    setEditingItem(item);
  };

  // Save Project (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.title.trim()) {
      fail('Le titre du projet est obligatoire.');
      return;
    }

    setSavingItem(true);
    try {
      const fd = new FormData();
      fd.append('title', itemForm.title.trim());
      if (itemForm.subtitle) fd.append('subtitle', itemForm.subtitle.trim());
      if (itemForm.short_title) fd.append('short_title', itemForm.short_title.trim());
      if (itemForm.category_id) fd.append('category_id', itemForm.category_id);
      if (itemForm.stone) fd.append('stone', itemForm.stone.trim());
      if (itemForm.finish) fd.append('finish', itemForm.finish.trim());
      if (itemForm.location) fd.append('location', itemForm.location.trim());
      if (itemForm.short_description) fd.append('short_description', itemForm.short_description.trim());
      if (itemForm.description) fd.append('description', itemForm.description.trim());
      if (itemForm.grid_class) fd.append('grid_class', itemForm.grid_class);
      fd.append('is_featured', itemForm.is_featured ? '1' : '0');
      fd.append('is_active', itemForm.is_active ? '1' : '0');
      fd.append('materiaux_ids', JSON.stringify(itemForm.materiaux_ids || []));

      if (coverFile) {
        fd.append('cover_image_file', coverFile);
      } else if (removeCover) {
        fd.append('remove_cover_image', '1');
      }

      if (galleryFiles && galleryFiles.length > 0) {
        Array.from(galleryFiles).forEach((f) => fd.append('gallery_files[]', f));
      }

      if (removeGalleryIds && removeGalleryIds.length > 0) {
        fd.append('remove_gallery_ids', JSON.stringify(removeGalleryIds));
      }

      const isEdit = Boolean(editingItem?.id);
      const saved = await saveRealisationItem(fd, token, isEdit ? editingItem.id : undefined);

      if (isEdit) {
        setItems(items.map((i) => (i.id === saved.id ? saved : i)));
        flash(`Projet « ${saved.title} » mis à jour.`);
      } else {
        setItems([...items, saved]);
        flash(`Projet « ${saved.title} » créé avec succès.`);
      }

      setEditingItem(null);
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingItem(false);
    }
  };

  // Delete project
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Supprimer définitivement le projet « ${item.title} » ?`)) return;
    setBusy(true);
    try {
      await deleteRealisationItem(item.id, token);
      setItems(items.filter((i) => i.id !== item.id));
      flash(`Projet « ${item.title} » supprimé.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Toggle Visibility
  const handleToggleVisibility = async (item) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', item.title);
      fd.append('is_active', item.is_active ? '0' : '1');
      const updated = await saveRealisationItem(fd, token, item.id);
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
      flash(updated.is_active ? `« ${item.title} » est maintenant visible.` : `« ${item.title} » est masqué.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (item) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('title', item.title);
      fd.append('is_featured', item.is_featured ? '0' : '1');
      const updated = await saveRealisationItem(fd, token, item.id);
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
      flash(updated.is_featured ? `« ${item.title} » mis en avant (Bento).` : `« ${item.title} » retiré du Bento.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Move project up/down
  const handleMoveItem = async (index, delta) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      await reorderRealisationItems(
        next.filter((i) => i.id).map((i) => i.id),
        token
      );
      flash('Ordre des projets mis à jour.');
    } catch (err) {
      setItems(items);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Category Add
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      const payload = {
        name: newCatName.trim(),
        badge_label: newCatBadge.trim() || undefined
      };
      const created = await saveRealisationCategory(payload, token);
      setCategories([...categories, created]);
      setNewCatName('');
      setNewCatBadge('');
      flash(`Catégorie « ${created.name} » créée.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setAddingCat(false);
    }
  };

  // Category Update
  const handleSaveCategory = async (cat, e) => {
    e.preventDefault();
    try {
      const updated = await saveRealisationCategory(
        { name: cat.name, badge_label: cat.badge_label },
        token,
        cat.id
      );
      setCategories(categories.map((c) => (c.id === cat.id ? updated : c)));
      setEditingCategory(null);
      flash(`Catégorie « ${updated.name} » mise à jour.`);
    } catch (err) {
      fail(err.message);
    }
  };

  // Category Delete
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.name} » ? Les projets associés seront conservés sans catégorie.`)) return;
    try {
      await deleteRealisationCategory(cat.id, token);
      setCategories(categories.filter((c) => c.id !== cat.id));
      setItems(items.map((i) => (i.category_id === cat.id ? { ...i, category_id: null, category_slug: null, category_name: null } : i)));
      flash(`Catégorie « ${cat.name} » supprimée.`);
    } catch (err) {
      fail(err.message);
    }
  };

  // Reorder Categories
  const handleMoveCategory = async (index, delta) => {
    const next = [...categories];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await reorderRealisationCategories(
        next.filter((c) => c.id).map((c) => c.id),
        token
      );
      flash('Ordre des catégories mis à jour.');
    } catch (err) {
      setCategories(categories);
      fail(err.message);
    }
  };

  // Filtered items list
  const filteredItems = items.filter((item) => {
    if (filterCategory !== 'all') {
      const matchCat =
        String(item.category_id) === String(filterCategory) ||
        item.category_slug === filterCategory ||
        item.category === filterCategory;
      if (!matchCat) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        (item.title || '').toLowerCase().includes(q) ||
        (item.stone || '').toLowerCase().includes(q) ||
        (item.location || item.loc || '').toLowerCase().includes(q);
      if (!matchSearch) return false;
    }
    return true;
  });

  return (
    <div>
      {/* Top Banner / Breadcrumb info */}
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
            Chantiers & Réalisations d'Exception
          </h1>
          <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
            {items.length} projet{items.length > 1 ? 's' : ''} gérés en base de données · Synchronisés en temps réel sur la page{' '}
            <Link to="/realisations" target="_blank" style={{ color: '#c5a059', textDecoration: 'none' }}>
              /realisations ↗
            </Link>{' '}
            et la section Bento{' '}
            <a href="/#realisations" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059', textDecoration: 'none' }}>
              #realisations ↗
            </a>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href="/#realisations"
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
            Bento Accueil ↗
          </a>
          <Link
            to="/realisations"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#f7f3ea',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Galerie Complète ↗
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px',
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'projects' ? '#c5a059' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'projects' ? '#11100f' : '#efe8db',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <Boxes size={16} />
          Projets ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'categories' ? '#c5a059' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'categories' ? '#11100f' : '#efe8db',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <Tag size={16} />
          Catégories ({categories.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('section')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'section' ? '#c5a059' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'section' ? '#11100f' : '#efe8db',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <Type size={16} />
          En-têtes & Textes
        </button>
      </div>

      {/* Notices */}
      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <LuxuryLoader size={70} minHeight="240px" />
      ) : (
        <>
          {/* TAB 1: PROJECTS */}
          {activeTab === 'projects' && (
            <div>
              {/* Actions and filter bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: filterCategory === 'all' ? '#c5a059' : 'rgba(255, 255, 255, 0.04)',
                      color: filterCategory === 'all' ? '#111' : '#f7f3ea',
                      cursor: 'pointer'
                    }}
                  >
                    Tous ({items.length})
                  </button>
                  {categories.map((c) => {
                    const cnt = items.filter((i) => i.category_id === c.id || i.category_slug === c.slug).length;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFilterCategory(c.slug)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: filterCategory === c.slug ? '#c5a059' : 'rgba(255, 255, 255, 0.04)',
                          color: filterCategory === c.slug ? '#111' : '#f7f3ea',
                          cursor: 'pointer'
                        }}
                      >
                        {c.name} ({cnt})
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Rechercher par titre, pierre, ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: '240px',
                      padding: '8px 12px',
                      fontSize: '12px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    style={{
                      ...primaryBtn,
                      background: '#c5a059',
                      color: '#111',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Plus size={16} />
                    Nouveau Projet
                  </button>
                </div>
              </div>

              {/* Projects Grid / List */}
              {filteredItems.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#a0988c' }}>
                  Aucun projet trouvé avec ces critères.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
                  {filteredItems.map((item) => {
                    const realIndex = items.findIndex((i) => i.id === item.id);
                    const cover = item.cover_image || item.img;
                    const catBadge = item.category_badge || item.catLabel || item.category_name;

                    return (
                      <div
                        key={item.id}
                        style={{
                          ...cardStyle,
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          opacity: item.is_active ? 1 : 0.65,
                          border: item.is_featured
                            ? '1px solid rgba(197, 160, 89, 0.45)'
                            : '1px solid rgba(255, 255, 255, 0.08)'
                        }}
                      >
                        <div>
                          {/* Image preview & badges */}
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '180px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              background: '#111',
                              marginBottom: '14px'
                            }}
                          >
                            {cover ? (
                              <img
                                src={cover}
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  color: '#a0988c',
                                  fontSize: '12px'
                                }}
                              >
                                <ImageIcon size={28} />
                              </div>
                            )}

                            {/* Badges on image */}
                            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {catBadge && (
                                <span
                                  style={{
                                    background: 'rgba(17, 16, 15, 0.85)',
                                    color: '#c5a059',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                  }}
                                >
                                  {catBadge}
                                </span>
                              )}
                              {item.stone && (
                                <span
                                  style={{
                                    background: 'rgba(17, 16, 15, 0.85)',
                                    color: '#f7f3ea',
                                    fontSize: '10px',
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {item.stone.split(' ')[0]}
                                </span>
                              )}
                            </div>

                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                              {item.is_featured && (
                                <span
                                  style={{
                                    background: '#c5a059',
                                    color: '#111',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Bento {item.grid_class || item.gridClass || ''}
                                </span>
                              )}
                              {!item.is_active && (
                                <span
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.85)',
                                    color: '#fff',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Masqué
                                </span>
                              )}
                            </div>

                            {item.images && item.images.length > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '8px',
                                  right: '8px',
                                  background: 'rgba(17, 16, 15, 0.8)',
                                  color: '#efe8db',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                +{item.images.length} photos
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: '#c5a059', marginBottom: '4px' }}>
                              {item.subtitle || item.stone}
                            </div>
                            <h3
                              style={{
                                fontFamily: "'Fraunces', Georgia, serif",
                                fontSize: '16px',
                                fontWeight: 500,
                                color: '#f7f3ea',
                                margin: '0 0 8px',
                                lineHeight: 1.3
                              }}
                            >
                              {item.title}
                            </h3>
                            <p
                              style={{
                                fontSize: '12px',
                                color: '#a0988c',
                                margin: 0,
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {item.short_description || item.shortDesc || item.description || item.desc}
                            </p>
                          </div>

                          {/* Specs pills */}
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                              marginBottom: '16px',
                              fontSize: '11px',
                              color: '#a0988c'
                            }}
                          >
                            {(item.location || item.loc) && (
                              <span
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <MapPin size={11} color="#c5a059" />
                                <span>{item.location || item.loc}</span>
                              </span>
                            )}
                            {item.finish && (
                              <span
                                style={{
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}
                              >
                                ✨ {item.finish}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer / Actions */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            paddingTop: '12px',
                            gap: '8px'
                          }}
                        >
                          {/* Order buttons */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(realIndex, -1)}
                              disabled={realIndex === 0 || busy}
                              style={{
                                ...iconBtn,
                                opacity: realIndex === 0 ? 0.3 : 1,
                                cursor: realIndex === 0 ? 'not-allowed' : 'pointer'
                              }}
                              title="Monter"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(realIndex, 1)}
                              disabled={realIndex === items.length - 1 || busy}
                              style={{
                                ...iconBtn,
                                opacity: realIndex === items.length - 1 ? 0.3 : 1,
                                cursor: realIndex === items.length - 1 ? 'not-allowed' : 'pointer'
                              }}
                              title="Descendre"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          {/* Action icons */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(item)}
                              disabled={busy}
                              style={{
                                ...iconBtn,
                                color: item.is_featured ? '#c5a059' : '#a0988c',
                                borderColor: item.is_featured ? 'rgba(197, 160, 89, 0.4)' : 'rgba(255, 255, 255, 0.12)'
                              }}
                              title={item.is_featured ? 'Retirer du Bento Accueil' : "Afficher sur le Bento d'accueil"}
                            >
                              <Sparkles size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(item)}
                              disabled={busy}
                              style={{
                                ...iconBtn,
                                color: item.is_active ? '#6ee7b7' : '#fca5a5'
                              }}
                              title={item.is_active ? 'Masquer' : 'Publier'}
                            >
                              {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              style={{
                                ...iconBtn,
                                background: 'rgba(197, 160, 89, 0.15)',
                                color: '#c5a059',
                                borderColor: 'rgba(197, 160, 89, 0.3)'
                              }}
                              title="Modifier"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteItem(item)}
                              disabled={busy}
                              style={{
                                ...iconBtn,
                                color: '#fca5a5'
                              }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div>
              {/* Add category inline */}
              <div style={{ ...cardStyle, marginBottom: '24px' }}>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: '0 0 16px' }}>
                  Ajouter une nouvelle catégorie
                </h3>
                <form
                  onSubmit={handleAddCategory}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '14px', alignItems: 'end' }}
                >
                  <div>
                    <label style={labelStyle}>Nom de la catégorie *</label>
                    <input
                      type="text"
                      placeholder="Ex: Piscines & Spas"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Badge / Libellé de carte (optionnel)</label>
                    <input
                      type="text"
                      placeholder="Ex: Piscine & Espace bien-être"
                      value={newCatBadge}
                      onChange={(e) => setNewCatBadge(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      disabled={addingCat || !newCatName.trim()}
                      style={{
                        ...primaryBtn,
                        background: '#c5a059',
                        color: '#111',
                        border: 'none',
                        height: '40px'
                      }}
                    >
                      <Plus size={16} />
                      {addingCat ? 'Création...' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categories.map((cat, idx) => {
                  const isEditing = editingCategory?.id === cat.id;
                  const count = items.filter((i) => i.category_id === cat.id || i.category_slug === cat.slug).length;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        ...cardStyle,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={(e) => handleSaveCategory(editingCategory, e)}
                          style={{ display: 'flex', gap: '12px', flex: 1, alignItems: 'center' }}
                        >
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                            style={{ ...inputStyle, flex: 1 }}
                            required
                          />
                          <input
                            type="text"
                            placeholder="Badge optionnel"
                            value={editingCategory.badge_label || ''}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, badge_label: e.target.value })
                            }
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button
                            type="submit"
                            style={{ ...primaryBtn, background: '#c5a059', color: '#111' }}
                          >
                            <Save size={14} /> Sauver
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            style={iconBtn}
                          >
                            <X size={14} />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <button
                                type="button"
                                onClick={() => handleMoveCategory(idx, -1)}
                                disabled={idx === 0}
                                style={{ ...iconBtn, padding: '4px', opacity: idx === 0 ? 0.3 : 1 }}
                              >
                                <ArrowUp size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCategory(idx, 1)}
                                disabled={idx === categories.length - 1}
                                style={{ ...iconBtn, padding: '4px', opacity: idx === categories.length - 1 ? 0.3 : 1 }}
                              >
                                <ArrowDown size={12} />
                              </button>
                            </div>

                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: '#f7f3ea' }}>
                                {cat.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#a0988c' }}>
                                Slug: <code style={{ color: '#c5a059' }}>{cat.slug}</code> · Badge:{' '}
                                {cat.badge_label ? `« ${cat.badge_label} »` : 'aucun'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#a0988c'
                              }}
                            >
                              {count} projet{count > 1 ? 's' : ''}
                            </span>

                            <button
                              type="button"
                              onClick={() => setEditingCategory({ ...cat })}
                              style={iconBtn}
                              title="Modifier"
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              style={{ ...iconBtn, color: '#fca5a5' }}
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SECTION HEADERS */}
          {activeTab === 'section' && (
            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Hero Page Réalisations */}
              <div style={cardStyle}>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: '0 0 16px' }}>
                  1. En-tête de la page Réalisations (/realisations)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Sur-titre (Eyebrow)</label>
                    <input
                      type="text"
                      value={section.hero_eyebrow}
                      onChange={(e) => setSection({ ...section, hero_eyebrow: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Titre principal (partie normale)</label>
                    <input
                      type="text"
                      value={section.hero_title}
                      onChange={(e) => setSection({ ...section, hero_title: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Titre mis en valeur (italique ocre)</label>
                  <input
                    type="text"
                    value={section.hero_title_em}
                    onChange={(e) => setSection({ ...section, hero_title_em: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Texte d'introduction</label>
                  <textarea
                    rows={3}
                    value={section.hero_description}
                    onChange={(e) => setSection({ ...section, hero_description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Bento Section Accueil */}
              <div style={cardStyle}>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: '0 0 16px' }}>
                  2. Section Bento sur la page d'Accueil (/#realisations)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Sur-titre (Eyebrow)</label>
                    <input
                      type="text"
                      value={section.bento_eyebrow}
                      onChange={(e) => setSection({ ...section, bento_eyebrow: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Titre (partie normale)</label>
                    <input
                      type="text"
                      value={section.bento_title}
                      onChange={(e) => setSection({ ...section, bento_title: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Titre mis en valeur (italique ocre)</label>
                  <input
                    type="text"
                    value={section.bento_title_em}
                    onChange={(e) => setSection({ ...section, bento_title_em: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description de la section Bento</label>
                  <textarea
                    rows={2}
                    value={section.bento_description}
                    onChange={(e) => setSection({ ...section, bento_description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* CTA Section */}
              <div style={cardStyle}>
                <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: '0 0 16px' }}>
                  3. Bandeau d'appel à l'action (CTA final)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>Titre CTA (partie normale)</label>
                    <input
                      type="text"
                      value={section.cta_title}
                      onChange={(e) => setSection({ ...section, cta_title: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Titre CTA mis en valeur</label>
                    <input
                      type="text"
                      value={section.cta_title_em}
                      onChange={(e) => setSection({ ...section, cta_title_em: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Description CTA</label>
                  <textarea
                    rows={2}
                    value={section.cta_description}
                    onChange={(e) => setSection({ ...section, cta_description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={savingSection}
                  style={{
                    ...primaryBtn,
                    background: '#c5a059',
                    color: '#111',
                    border: 'none',
                    padding: '12px 24px',
                    fontSize: '14px'
                  }}
                >
                  <Save size={16} />
                  {savingSection ? 'Enregistrement...' : 'Enregistrer tous les en-têtes'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* PROJECT EDIT / CREATE MODAL */}
      {editingItem !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <div
            style={{
              background: '#1a1816',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '16px'
              }}
            >
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '22px',
                  fontWeight: 400,
                  color: '#f7f3ea',
                  margin: 0
                }}
              >
                {editingItem.id ? `Modifier : ${editingItem.title}` : 'Nouveau Projet de Réalisation'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={iconBtn}
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem}>
              {/* Form Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Titre complet du projet *</label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="Ex: Villa contemporaine en pierre de Taza éclatée"
                    style={inputStyle}
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Sous-titre (ex: Façade · Pierre de Taza)</label>
                  <input
                    type="text"
                    value={itemForm.subtitle}
                    onChange={(e) => setItemForm({ ...itemForm, subtitle: e.target.value })}
                    placeholder="Ex: Façade · Pierre de Taza"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Catégorie</label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="">-- Sans catégorie --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Pierre sélectionnée</label>
                  <input
                    type="text"
                    value={itemForm.stone}
                    onChange={(e) => setItemForm({ ...itemForm, stone: e.target.value })}
                    placeholder="Ex: Pierre de Taza beige, Calacatta..."
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Finition de surface</label>
                  <input
                    type="text"
                    value={itemForm.finish}
                    onChange={(e) => setItemForm({ ...itemForm, finish: e.target.value })}
                    placeholder="Ex: Éclatée brute & Adoucie"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Localisation du chantier</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    placeholder="Ex: Rabat (Harhoura), Casablanca (Anfa)..."
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Titre court (pour tuile Bento)</label>
                  <input
                    type="text"
                    value={itemForm.short_title}
                    onChange={(e) => setItemForm({ ...itemForm, short_title: e.target.value })}
                    placeholder="Ex: Villa en pierre de Taza éclatée"
                    style={inputStyle}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Description courte (carte catalogue)</label>
                  <textarea
                    rows={2}
                    value={itemForm.short_description}
                    onChange={(e) => setItemForm({ ...itemForm, short_description: e.target.value })}
                    placeholder="Résumé succinct visible sur les cartes du catalogue..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Description complète (lightbox & détails)</label>
                  <textarea
                    rows={3}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Description architecturale détaillée pour la fenêtre d'agrandissement..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Cover Image Upload */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '18px'
                }}
              >
                <label style={labelStyle}>Photo de couverture principale</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {coverPreview && !removeCover ? (
                    <div style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={coverPreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveCover(true);
                          setCoverPreview(null);
                          setCoverFile(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(239, 68, 68, 0.9)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0
                        }}
                        title="Supprimer la photo"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '120px',
                        height: '80px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a0988c'
                      }}
                    >
                      <ImageIcon size={24} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="coverImageInput"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCoverFile(file);
                          setRemoveCover(false);
                          setCoverPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label
                      htmlFor="coverImageInput"
                      style={{
                        ...primaryBtn,
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      {coverPreview ? 'Remplacer la photo de couverture' : 'Sélectionner une photo'}
                    </label>
                    <div style={{ fontSize: '11px', color: '#a0988c', marginTop: '6px' }}>
                      Formats acceptés : JPG, PNG, WebP (max 8 Mo).
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Gallery Images */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '18px'
                }}
              >
                <label style={labelStyle}>Galerie secondaire (photos supplémentaires)</label>

                {/* Existing gallery images */}
                {editingItem.images && editingItem.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {editingItem.images.map((img) => {
                      const isDeleted = removeGalleryIds.includes(img.id);
                      return (
                        <div
                          key={img.id}
                          style={{
                            position: 'relative',
                            width: '80px',
                            height: '60px',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            opacity: isDeleted ? 0.3 : 1
                          }}
                        >
                          <img src={img.image_path} alt="Vue secondaire" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => {
                              if (isDeleted) {
                                setRemoveGalleryIds(removeGalleryIds.filter((id) => id !== img.id));
                              } else {
                                setRemoveGalleryIds([...removeGalleryIds, img.id]);
                              }
                            }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: isDeleted ? '#10b981' : 'rgba(239, 68, 68, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '10px'
                            }}
                            title={isDeleted ? 'Restaurer' : 'Supprimer'}
                          >
                            {isDeleted ? '↺' : '✕'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="galleryFilesInput"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files) {
                        setGalleryFiles(Array.from(e.target.files));
                      }
                    }}
                  />
                  <label htmlFor="galleryFilesInput" style={{ ...primaryBtn, cursor: 'pointer' }}>
                    <Plus size={14} />
                    Ajouter des photos à la galerie
                  </label>
                  {galleryFiles.length > 0 && (
                    <span style={{ fontSize: '12px', color: '#6ee7b7', marginLeft: '12px' }}>
                      {galleryFiles.length} nouvelle{galleryFiles.length > 1 ? 's' : ''} photo{galleryFiles.length > 1 ? 's' : ''} sélectionnée{galleryFiles.length > 1 ? 's' : ''}.
                    </span>
                  )}
                </div>
              </div>

              {/* Linked Materiaux */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '18px'
                }}
              >
                <label style={labelStyle}>Matériaux associés (relation many-to-many avec la table Matériaux)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {materiauxOptions.map((mat) => {
                    const selected = (itemForm.materiaux_ids || []).includes(mat.id);
                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => {
                          const cur = itemForm.materiaux_ids || [];
                          const next = selected ? cur.filter((id) => id !== mat.id) : [...cur, mat.id];
                          setItemForm({ ...itemForm, materiaux_ids: next });
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          border: selected ? '1px solid #c5a059' : '1px solid rgba(255, 255, 255, 0.12)',
                          background: selected ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          color: selected ? '#c5a059' : '#a0988c'
                        }}
                      >
                        {selected ? '✓ ' : '+ '}
                        {mat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bento & Display flags */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}
              >
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.is_featured}
                      onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                      style={{ accentColor: '#c5a059', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#f7f3ea' }}>
                      Mettre en avant sur la section Bento Accueil (/#realisations)
                    </span>
                  </label>
                  {itemForm.is_featured && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={labelStyle}>Emplacement de la tuile Bento</label>
                      <select
                        value={itemForm.grid_class}
                        onChange={(e) => setItemForm({ ...itemForm, grid_class: e.target.value })}
                        style={{ ...inputStyle, cursor: 'pointer' }}
                      >
                        <option value="">Automatique (selon l'ordre)</option>
                        <option value="t1">t1 — Grand format (Hero gauche)</option>
                        <option value="t2">t2 — Colonne droite haut</option>
                        <option value="t3">t3 — Pleine largeur milieu</option>
                        <option value="t4">t4 — Format carré gauche bas</option>
                        <option value="t5">t5 — Format droit bas</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={itemForm.is_active}
                      onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                      style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#f7f3ea' }}>
                      Projet actif / visible sur le site public
                    </span>
                  </label>
                </div>
              </div>

              {/* Form submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'transparent',
                    color: '#efe8db',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  style={{
                    ...primaryBtn,
                    background: '#c5a059',
                    color: '#111',
                    border: 'none',
                    padding: '10px 22px'
                  }}
                >
                  <Save size={16} />
                  {savingItem ? 'Enregistrement en cours...' : editingItem.id ? 'Mettre à jour le projet' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
