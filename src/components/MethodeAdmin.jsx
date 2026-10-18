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
  ListChecks,
  Edit,
  X,
  ImageIcon,
  Ruler,
  FileText,
  Hammer,
  Truck,
  Compass,
  Scissors,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  getMethodeAdmin,
  updateMethodeSection,
  saveMethodeItem,
  deleteMethodeItem,
  reorderMethodeItems
} from '../api/methode';
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

const AVAILABLE_ICONS = [
  { name: 'Ruler', label: 'Règle / Métrage', icon: Ruler },
  { name: 'FileText', label: 'Devis / Document', icon: FileText },
  { name: 'Hammer', label: 'Marteau / Taille', icon: Hammer },
  { name: 'Truck', label: 'Camion / Livraison', icon: Truck },
  { name: 'Compass', label: 'Compas / Étude', icon: Compass },
  { name: 'Scissors', label: 'Découpe', icon: Scissors },
  { name: 'Layers', label: 'Couches / Matériaux', icon: Layers },
  { name: 'Sparkles', label: 'Finition / Éclat', icon: Sparkles },
  { name: 'ShieldCheck', label: 'Contrôle Qualité', icon: ShieldCheck },
  { name: 'CheckCircle2', label: 'Validation', icon: CheckCircle2 }
];

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

export default function MethodeAdmin({ token, onCountChange }) {
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' | 'section'
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Section header
  const [section, setSection] = useState({
    eyebrow: '',
    title: '',
    title_em: '',
    description: ''
  });
  const [savingSection, setSavingSection] = useState(false);

  // Steps list
  const [items, setItems] = useState([]);

  // Modal Create / Edit
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = create, item = edit
  const [itemForm, setItemForm] = useState({
    title: '',
    step_number: '',
    short_description: '',
    description: '',
    duration: '',
    icon: 'Ruler',
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

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
    getMethodeAdmin(token)
      .then((data) => {
        if (data.section) {
          setSection({
            eyebrow: data.section.eyebrow || '',
            title: data.section.title || '',
            title_em: data.section.title_em || '',
            description: data.section.description || ''
          });
        }
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

  // Save Section
  const handleSaveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      await updateMethodeSection(section, token);
      flash('En-têtes de la méthode enregistrés avec succès.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = str_pad(items.length + 1);
    setItemForm({
      title: '',
      step_number: nextNum,
      short_description: '',
      description: '',
      duration: '',
      icon: 'Ruler',
      is_active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setEditingItem({});
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setItemForm({
      title: item.title || '',
      step_number: item.step_number || '',
      short_description: item.short_description || item.desc || '',
      description: item.description || '',
      duration: item.duration || '',
      icon: item.icon || 'Ruler',
      is_active: Boolean(item.is_active)
    });
    setImageFile(null);
    setImagePreview(item.image || null);
    setRemoveImage(false);
    setEditingItem(item);
  };

  const str_pad = (n) => String(n).padStart(2, '0');

  // Save Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.title.trim()) {
      fail("Le titre de l'étape est obligatoire.");
      return;
    }
    if (!itemForm.short_description.trim()) {
      fail('La description courte est obligatoire.');
      return;
    }

    setSavingItem(true);
    try {
      const fd = new FormData();
      fd.append('title', itemForm.title.trim());
      fd.append('short_description', itemForm.short_description.trim());
      if (itemForm.description) fd.append('description', itemForm.description.trim());
      if (itemForm.step_number) fd.append('step_number', itemForm.step_number.trim());
      if (itemForm.duration) fd.append('duration', itemForm.duration.trim());
      if (itemForm.icon) fd.append('icon', itemForm.icon);
      fd.append('is_active', itemForm.is_active ? '1' : '0');

      if (imageFile) {
        fd.append('image_file', imageFile);
      } else if (removeImage) {
        fd.append('remove_image', '1');
      }

      const isEdit = Boolean(editingItem?.id);
      const saved = await saveMethodeItem(fd, token, isEdit ? editingItem.id : undefined);

      if (isEdit) {
        setItems(items.map((i) => (i.id === saved.id ? saved : i)));
        flash(`Étape « ${saved.title} » mise à jour.`);
      } else {
        setItems([...items, saved]);
        flash(`Étape « ${saved.title} » ajoutée avec succès.`);
      }

      setEditingItem(null);
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingItem(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Supprimer définitivement l'étape « ${item.title} » ?`)) return;
    setBusy(true);
    try {
      await deleteMethodeItem(item.id, token);
      setItems(items.filter((i) => i.id !== item.id));
      flash(`Étape « ${item.title} » supprimée.`);
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
      fd.append('short_description', item.short_description);
      fd.append('is_active', item.is_active ? '0' : '1');
      const updated = await saveMethodeItem(fd, token, item.id);
      setItems(items.map((i) => (i.id === item.id ? updated : i)));
      flash(updated.is_active ? `« ${item.title} » est maintenant visible.` : `« ${item.title} » est masquée.`);
    } catch (err) {
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Move Item up / down
  const handleMoveItem = async (index, delta) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    setBusy(true);
    try {
      const updated = await reorderMethodeItems(
        next.filter((i) => i.id).map((i) => i.id),
        token
      );
      setItems(updated);
      flash('Ordre des étapes mis à jour.');
    } catch (err) {
      setItems(items);
      fail(err.message);
    } finally {
      setBusy(false);
    }
  };

  const renderIcon = (iconName) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    const IconComp = found ? found.icon : Ruler;
    return <IconComp size={18} />;
  };

  return (
    <div>
      {/* Header Banner */}
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
            Méthode de Travail & Processus
          </h1>
          <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
            Les {items.length} étape{items.length > 1 ? 's' : ''} du protocole d'artisanat présentées sur la section{' '}
            <a href="/#methode" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059', textDecoration: 'none' }}>
              #methode ↗
            </a>.
          </p>
        </div>
        <a
          href="/#methode"
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
          Ouvrir #methode ↗
        </a>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '12px'
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'steps' ? '#c5a059' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'steps' ? '#11100f' : '#efe8db',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <ListChecks size={16} />
          Étapes de la méthode ({items.length})
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
          En-tête & Textes
        </button>
      </div>

      {/* Notices */}
      {message && <Notice kind="success">{message}</Notice>}
      {error && <Notice kind="error">{error}</Notice>}

      {loading ? (
        <LuxuryLoader size={70} minHeight="240px" />
      ) : (
        <>
          {/* TAB 1: STEPS */}
          {activeTab === 'steps' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '13px', color: '#a0988c' }}>
                  Glissez ou utilisez les flèches pour réordonner les étapes. Les numéros s'ajustent automatiquement.
                </div>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  style={{
                    ...primaryBtn,
                    background: '#c5a059',
                    color: '#111',
                    border: 'none'
                  }}
                >
                  <Plus size={16} />
                  Nouvelle Étape
                </button>
              </div>

              {items.length === 0 ? (
                <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#a0988c' }}>
                  Aucune étape enregistrée. Cliquez sur « Nouvelle Étape » pour en ajouter une.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {items.map((step, idx) => (
                    <div
                      key={step.id}
                      style={{
                        ...cardStyle,
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        opacity: step.is_active ? 1 : 0.6,
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      <div>
                        {/* Step Top Bar */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                          }}
                        >
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              border: '1px solid rgba(197, 160, 89, 0.5)',
                              color: '#c5a059',
                              fontFamily: "'Fraunces', Georgia, serif",
                              fontStyle: 'italic',
                              fontSize: '20px',
                              background: 'rgba(197, 160, 89, 0.08)'
                            }}
                          >
                            {step.step_number || idx + 1}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span
                              style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                color: '#c5a059',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title={`Icône : ${step.icon}`}
                            >
                              {renderIcon(step.icon)}
                            </span>
                            {!step.is_active && (
                              <span
                                style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#fca5a5',
                                  fontSize: '10px',
                                  padding: '3px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                Masqué
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h3
                          style={{
                            fontFamily: "'Fraunces', Georgia, serif",
                            fontSize: '18px',
                            fontWeight: 600,
                            color: '#f7f3ea',
                            margin: '0 0 10px',
                            lineHeight: 1.3
                          }}
                        >
                          {step.title}
                        </h3>

                        <p
                          style={{
                            fontSize: '13px',
                            color: '#c5bfb4',
                            lineHeight: 1.6,
                            marginBottom: '12px'
                          }}
                        >
                          {step.short_description || step.desc}
                        </p>

                        {step.description && step.description !== step.short_description && (
                          <p
                            style={{
                              fontSize: '12px',
                              color: '#8c8579',
                              lineHeight: 1.5,
                              fontStyle: 'italic',
                              margin: '0 0 14px'
                            }}
                          >
                            Protocole : {step.description}
                          </p>
                        )}

                        {step.duration && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '11px',
                              color: '#a0988c',
                              background: 'rgba(255, 255, 255, 0.04)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              marginBottom: '14px'
                            }}
                          >
                            <Clock size={12} color="#c5a059" />
                            <span>Délai indicatif : {step.duration}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          paddingTop: '14px',
                          marginTop: '8px'
                        }}
                      >
                        {/* Move buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, -1)}
                            disabled={idx === 0 || busy}
                            style={{
                              ...iconBtn,
                              opacity: idx === 0 ? 0.3 : 1,
                              cursor: idx === 0 ? 'not-allowed' : 'pointer'
                            }}
                            title="Monter"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, 1)}
                            disabled={idx === items.length - 1 || busy}
                            style={{
                              ...iconBtn,
                              opacity: idx === items.length - 1 ? 0.3 : 1,
                              cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer'
                            }}
                            title="Descendre"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(step)}
                            disabled={busy}
                            style={{
                              ...iconBtn,
                              color: step.is_active ? '#6ee7b7' : '#fca5a5'
                            }}
                            title={step.is_active ? 'Masquer' : 'Publier'}
                          >
                            {step.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(step)}
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
                            onClick={() => handleDeleteItem(step)}
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
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECTION HEADERS */}
          {activeTab === 'section' && (
            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cardStyle}>
                <h3
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '18px',
                    color: '#f7f3ea',
                    margin: '0 0 16px'
                  }}
                >
                  En-tête de la section Méthode (/#methode)
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Sur-titre (Eyebrow)</label>
                    <input
                      type="text"
                      value={section.eyebrow}
                      onChange={(e) => setSection({ ...section, eyebrow: e.target.value })}
                      style={inputStyle}
                      placeholder="Notre méthode"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Titre principal (partie normale)</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => setSection({ ...section, title: e.target.value })}
                      style={inputStyle}
                      placeholder="Du bloc brut"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Titre mis en valeur (italique ocre)</label>
                  <input
                    type="text"
                    value={section.title_em}
                    onChange={(e) => setSection({ ...section, title_em: e.target.value })}
                    style={inputStyle}
                    placeholder="à l'ouvrage fini."
                  />
                </div>

                <div>
                  <label style={labelStyle}>Description d'introduction (optionnelle)</label>
                  <textarea
                    rows={3}
                    value={section.description}
                    onChange={(e) => setSection({ ...section, description: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Texte introductif présentant le processus..."
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
                  {savingSection ? 'Enregistrement...' : 'Enregistrer les en-têtes'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* CREATE / EDIT STEP MODAL */}
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
              maxWidth: '680px',
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
                marginBottom: '22px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '14px'
              }}
            >
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: '20px',
                  fontWeight: 400,
                  color: '#f7f3ea',
                  margin: 0
                }}
              >
                {editingItem.id ? `Modifier : ${editingItem.title}` : 'Nouvelle Étape du Protocole'}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Numéro / Code</label>
                  <input
                    type="text"
                    value={itemForm.step_number}
                    onChange={(e) => setItemForm({ ...itemForm, step_number: e.target.value })}
                    placeholder="01"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Titre de l'étape *</label>
                  <input
                    type="text"
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="Ex: Visite & métrage"
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Description courte (affichée sur la frise) *</label>
                <textarea
                  rows={2}
                  value={itemForm.short_description}
                  onChange={(e) => setItemForm({ ...itemForm, short_description: e.target.value })}
                  placeholder="Ex: Nous étudions votre projet sur place et relevons chaque dimension."
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Détail technique / Protocole complet (optionnel)</label>
                <textarea
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ex: Prise de cotes millimétrique sur chantier avec scanner laser et plans 3D..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Durée estimée / Délai</label>
                  <input
                    type="text"
                    value={itemForm.duration}
                    onChange={(e) => setItemForm({ ...itemForm, duration: e.target.value })}
                    placeholder="Ex: 24h - 48h, 10-15 jours"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Icône représentative</label>
                  <select
                    value={itemForm.icon}
                    onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.name} value={ic.name}>
                        {ic.name} — {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}
              >
                <label style={labelStyle}>Illustration de l'étape (optionnelle)</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {imagePreview && !removeImage ? (
                    <div style={{ position: 'relative', width: '90px', height: '60px', borderRadius: '6px', overflow: 'hidden' }}>
                      <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveImage(true);
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: 'rgba(239, 68, 68, 0.9)',
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
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '90px',
                        height: '60px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a0988c'
                      }}
                    >
                      <ImageIcon size={20} />
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="stepImageInput"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageFile(file);
                          setRemoveImage(false);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label htmlFor="stepImageInput" style={{ ...primaryBtn, cursor: 'pointer' }}>
                      <Upload size={14} />
                      {imagePreview ? "Remplacer l'image" : 'Ajouter une photo'}
                    </label>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={itemForm.is_active}
                    onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#f7f3ea' }}>
                    Étape active et visible sur le site
                  </span>
                </label>
              </div>

              {/* Form buttons */}
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
                  {savingItem ? 'Enregistrement...' : editingItem.id ? "Mettre à jour l'étape" : "Créer l'étape"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
