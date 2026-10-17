import React, { useEffect, useState, useMemo } from 'react';
import {
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  Type,
  HelpCircle,
  Edit,
  X,
  Search,
  Star,
  FolderPlus,
  Folder,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getFaqAdmin,
  updateFaqSection,
  saveFaqItem,
  deleteFaqItem,
  reorderFaqItems,
  saveFaqCategory,
  deleteFaqCategory,
  reorderFaqCategories
} from '../api/faq';

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

export default function FaqAdmin({ token, onCountChange }) {
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'categories' | 'section'
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // FAQ Section
  const [section, setSection] = useState({
    eyebrow: '',
    title: '',
    title_em: '',
    description: '',
    cta_text: '',
    cta_link: ''
  });
  const [savingSection, setSavingSection] = useState(false);

  // Questions and categories
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & filter for questions
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Item Modal
  const [editingItem, setEditingItem] = useState(null); // null = closed, {} = create, {id, ...} = edit
  const [itemForm, setItemForm] = useState({
    question: '',
    answer: '',
    category_id: '',
    is_featured: false,
    is_active: true
  });
  const [savingItem, setSavingItem] = useState(false);

  // Category Edit / Add inline state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // Expanded answer card IDs
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    getFaqAdmin(token)
      .then((data) => {
        if (data.section) {
          setSection({
            eyebrow: data.section.eyebrow || '',
            title: data.section.title || '',
            title_em: data.section.title_em || '',
            description: data.section.description || '',
            cta_text: data.section.cta_text || '',
            cta_link: data.section.cta_link || ''
          });
        }
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

  // Save Section
  const handleSaveSection = async (e) => {
    e.preventDefault();
    setSavingSection(true);
    try {
      await updateFaqSection(section, token);
      flash('En-têtes de la FAQ enregistrés avec succès.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingSection(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setItemForm({
      question: '',
      answer: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      is_featured: false,
      is_active: true
    });
    setEditingItem({});
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setItemForm({
      question: item.question || item.q || '',
      answer: item.answer || item.a || '',
      category_id: item.category_id || '',
      is_featured: Boolean(item.is_featured),
      is_active: Boolean(item.is_active)
    });
    setEditingItem(item);
  };

  // Save Question (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemForm.question.trim()) {
      fail('La question est obligatoire.');
      return;
    }
    if (!itemForm.answer.trim()) {
      fail('La réponse est obligatoire.');
      return;
    }

    setSavingItem(true);
    try {
      const payload = {
        question: itemForm.question.trim(),
        answer: itemForm.answer.trim(),
        category_id: itemForm.category_id ? parseInt(itemForm.category_id, 10) : null,
        is_featured: itemForm.is_featured ? 1 : 0,
        is_active: itemForm.is_active ? 1 : 0
      };

      const isEdit = Boolean(editingItem?.id);
      const saved = await saveFaqItem(payload, token, isEdit ? editingItem.id : undefined);

      if (isEdit) {
        setItems((prev) => prev.map((i) => (i.id === saved.id ? saved : i)));
        flash('Question mise à jour.');
      } else {
        setItems((prev) => [...prev, saved]);
        flash('Question créée.');
      }
      setEditingItem(null);
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingItem(false);
    }
  };

  // Delete Question
  const handleDeleteItem = async (id, title) => {
    const preview = title ? `"${title.slice(0, 40)}..."` : 'cette question';
    if (!window.confirm(`Voulez-vous vraiment supprimer ${preview} ?`)) {
      return;
    }
    try {
      await deleteFaqItem(id, token);
      setItems((prev) => prev.filter((i) => i.id !== id));
      flash('Question supprimée.');
    } catch (err) {
      fail(err.message);
    }
  };

  // Toggle Visibility
  const handleToggleActive = async (item) => {
    try {
      const updated = await saveFaqItem(
        { is_active: item.is_active ? 0 : 1 },
        token,
        item.id
      );
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_active: updated.is_active } : i)));
      flash(`Question ${updated.is_active ? 'affichée' : 'masquée'}.`);
    } catch (err) {
      fail(err.message);
    }
  };

  // Toggle Featured
  const handleToggleFeatured = async (item) => {
    try {
      const updated = await saveFaqItem(
        { is_featured: item.is_featured ? 0 : 1 },
        token,
        item.id
      );
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_featured: updated.is_featured } : i)));
      flash(updated.is_featured ? 'Question mise en avant.' : 'Question retirée de la une.');
    } catch (err) {
      fail(err.message);
    }
  };

  // Reorder Questions
  const handleMoveItem = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setItems(newItems);

    try {
      const ids = newItems.map((i) => i.id);
      await reorderFaqItems(ids, token);
      flash('Ordre des questions mis à jour.');
    } catch (err) {
      fail(err.message);
      loadData();
    }
  };

  // --- Category Actions ---
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSavingCategory(true);
    try {
      const created = await saveFaqCategory({ name: newCategoryName.trim() }, token);
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
      flash('Catégorie ajoutée.');
    } catch (err) {
      fail(err.message);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleUpdateCategory = async (cat) => {
    if (!editCategoryName.trim()) return;
    try {
      const updated = await saveFaqCategory({ name: editCategoryName.trim() }, token, cat.id);
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      setEditingCategory(null);
      flash('Catégorie renommée.');
    } catch (err) {
      fail(err.message);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Supprimer la catégorie "${cat.name}" ? Les questions associées deviendront sans catégorie.`)) {
      return;
    }
    try {
      await deleteFaqCategory(cat.id, token);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      setItems((prev) => prev.map((i) => (i.category_id === cat.id ? { ...i, category_id: null, category_name: null } : i)));
      flash('Catégorie supprimée.');
    } catch (err) {
      fail(err.message);
    }
  };

  const handleToggleCategoryActive = async (cat) => {
    try {
      const updated = await saveFaqCategory({ is_active: !cat.is_active }, token, cat.id);
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
      flash(`Catégorie ${updated.is_active ? 'activée' : 'désactivée'}.`);
    } catch (err) {
      fail(err.message);
    }
  };

  const handleMoveCategory = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;

    setCategories(newCats);

    try {
      const ids = newCats.map((c) => c.id);
      await reorderFaqCategories(ids, token);
      flash('Ordre des catégories mis à jour.');
    } catch (err) {
      fail(err.message);
      loadData();
    }
  };

  // Filtered Questions
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategoryFilter !== 'all') {
        if (selectedCategoryFilter === 'uncategorized') {
          if (item.category_id) return false;
        } else if (String(item.category_id) !== String(selectedCategoryFilter)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const questionMatch = (item.question || '').toLowerCase().includes(q);
        const answerMatch = (item.answer || '').toLowerCase().includes(q);
        return questionMatch || answerMatch;
      }
      return true;
    });
  }, [items, selectedCategoryFilter, searchQuery]);

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          marginBottom: '24px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#f7f3ea',
                margin: 0
              }}
            >
              Foire Aux Questions (FAQ)
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(197, 160, 89, 0.15)',
                color: '#c5a059',
                fontWeight: 600
              }}
            >
              {items.length} question{items.length > 1 ? 's' : ''}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#a0988c', margin: '6px 0 0' }}>
            Gérez les questions-réponses, catégories et l'en-tête de la section{' '}
            <a href="/#faq" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>
              #faq
            </a>
            . 100% piloté par la base de données.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a
            href="/#faq"
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
            Ouvrir #faq ↗
          </a>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(46, 125, 50, 0.15)',
            border: '1px solid rgba(46, 125, 50, 0.3)',
            borderRadius: '8px',
            color: '#81c784',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Check size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            background: 'rgba(211, 47, 47, 0.15)',
            border: '1px solid rgba(211, 47, 47, 0.3)',
            borderRadius: '8px',
            color: '#e57373',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

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
          onClick={() => setActiveTab('questions')}
          style={{
            background: activeTab === 'questions' ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
            border: activeTab === 'questions' ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid transparent',
            color: activeTab === 'questions' ? '#c5a059' : '#a0988c',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <HelpCircle size={15} />
          Questions ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            background: activeTab === 'categories' ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
            border: activeTab === 'categories' ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid transparent',
            color: activeTab === 'categories' ? '#c5a059' : '#a0988c',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Folder size={15} />
          Catégories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('section')}
          style={{
            background: activeTab === 'section' ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
            border: activeTab === 'section' ? '1px solid rgba(197, 160, 89, 0.3)' : '1px solid transparent',
            color: activeTab === 'section' ? '#c5a059' : '#a0988c',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Type size={15} />
          En-tête & CTA
        </button>
      </div>

      {/* TAB 1: QUESTIONS */}
      {activeTab === 'questions' && (
        <div>
          {/* Controls bar: search, category filter, new button */}
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
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              {/* Search box */}
              <div style={{ position: 'relative', minWidth: '220px', maxWidth: '320px', flex: 1 }}>
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#777'
                  }}
                />
                <input
                  type="text"
                  placeholder="Rechercher une question..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: '32px',
                    fontSize: '12px',
                    paddingTop: '8px',
                    paddingBottom: '8px'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#a0988c',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  style={{
                    fontSize: '11px',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    background: selectedCategoryFilter === 'all' ? '#c5a059' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedCategoryFilter === 'all' ? '#111' : '#a0988c',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Toutes ({items.length})
                </button>
                {categories.map((cat) => {
                  const count = items.filter((i) => i.category_id === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      style={{
                        fontSize: '11px',
                        padding: '5px 10px',
                        borderRadius: '20px',
                        background: selectedCategoryFilter === cat.id ? '#c5a059' : 'rgba(255, 255, 255, 0.06)',
                        color: selectedCategoryFilter === cat.id ? '#111' : '#a0988c',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {cat.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            <button onClick={handleOpenCreate} style={primaryBtn}>
              <Plus size={16} />
              Nouvelle question
            </button>
          </div>

          {/* Question Cards List */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#a0988c' }}>
              Chargement des questions...
            </div>
          ) : filteredItems.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                padding: '48px 24px',
                color: '#a0988c'
              }}
            >
              <HelpCircle size={36} style={{ color: '#c5a059', opacity: 0.5, marginBottom: '12px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchQuery || selectedCategoryFilter !== 'all'
                  ? 'Aucune question ne correspond à vos filtres.'
                  : 'Aucune question dans la FAQ pour le moment.'}
              </p>
              <button
                onClick={handleOpenCreate}
                style={{ ...primaryBtn, marginTop: '16px', display: 'inline-flex' }}
              >
                <Plus size={15} />
                Ajouter la première question
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredItems.map((item, idx) => {
                const isExpanded = Boolean(expandedCards[item.id]);
                const isFirst = idx === 0;
                const isLast = idx === filteredItems.length - 1;

                return (
                  <div
                    key={item.id}
                    style={{
                      ...cardStyle,
                      padding: '18px 20px',
                      opacity: item.is_active ? 1 : 0.6,
                      border: item.is_featured
                        ? '1px solid rgba(197, 160, 89, 0.45)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '16px'
                      }}
                    >
                      {/* Left: Position badge + Content */}
                      <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(197, 160, 89, 0.12)',
                            color: '#c5a059',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          Q{idx + 1}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Badges row: category, featured, hidden */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '6px',
                              flexWrap: 'wrap'
                            }}
                          >
                            {item.category_name && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: '#e5dec9',
                                  fontWeight: 600
                                }}
                              >
                                {item.category_name}
                              </span>
                            )}

                            {item.is_featured && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(197, 160, 89, 0.2)',
                                  color: '#c5a059',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Star size={10} fill="#c5a059" /> À la une
                              </span>
                            )}

                            {!item.is_active && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(211, 47, 47, 0.15)',
                                  color: '#e57373',
                                  fontWeight: 600
                                }}
                              >
                                Masquée
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <h3
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#f7f3ea',
                              margin: '0 0 6px',
                              lineHeight: 1.4
                            }}
                          >
                            {item.question}
                          </h3>

                          {/* Answer preview / full */}
                          <div
                            style={{
                              fontSize: '13px',
                              color: '#a0988c',
                              lineHeight: 1.6,
                              whiteSpace: 'pre-line'
                            }}
                          >
                            {isExpanded || (item.answer && item.answer.length <= 150)
                              ? item.answer
                              : `${item.answer.slice(0, 150)}...`}
                          </div>

                          {item.answer && item.answer.length > 150 && (
                            <button
                              onClick={() => toggleExpand(item.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#c5a059',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: '4px 0',
                                marginTop: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {isExpanded ? (
                                <>
                                  Réduire <ChevronUp size={12} />
                                </>
                              ) : (
                                <>
                                  Lire la suite <ChevronDown size={12} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0
                        }}
                      >
                        {/* Reorder Up / Down */}
                        <button
                          onClick={() => handleMoveItem(idx, -1)}
                          disabled={isFirst}
                          title="Monter"
                          style={{
                            ...iconBtn,
                            opacity: isFirst ? 0.3 : 1,
                            cursor: isFirst ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveItem(idx, 1)}
                          disabled={isLast}
                          title="Descendre"
                          style={{
                            ...iconBtn,
                            opacity: isLast ? 0.3 : 1,
                            cursor: isLast ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ArrowDown size={14} />
                        </button>

                        {/* Star / Featured */}
                        <button
                          onClick={() => handleToggleFeatured(item)}
                          title={item.is_featured ? 'Retirer de la une' : 'Mettre à la une'}
                          style={{
                            ...iconBtn,
                            color: item.is_featured ? '#c5a059' : '#a0988c'
                          }}
                        >
                          <Star size={14} fill={item.is_featured ? '#c5a059' : 'none'} />
                        </button>

                        {/* Toggle visibility */}
                        <button
                          onClick={() => handleToggleActive(item)}
                          title={item.is_active ? 'Masquer' : 'Afficher'}
                          style={{
                            ...iconBtn,
                            color: item.is_active ? '#81c784' : '#e57373'
                          }}
                        >
                          {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Modifier"
                          style={{ ...iconBtn, color: '#c5a059' }}
                        >
                          <Edit size={14} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteItem(item.id, item.question)}
                          title="Supprimer"
                          style={{ ...iconBtn, color: '#e57373' }}
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

      {/* TAB 2: CATÉGORIES */}
      {activeTab === 'categories' && (
        <div>
          {/* Add Category Bar */}
          <form
            onSubmit={handleAddCategory}
            style={{
              ...cardStyle,
              marginBottom: '24px',
              padding: '18px 20px',
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Nom de la nouvelle catégorie (ex: Prix & Devis, Pose...)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <button
              type="submit"
              disabled={savingCategory || !newCategoryName.trim()}
              style={{
                ...primaryBtn,
                opacity: savingCategory || !newCategoryName.trim() ? 0.5 : 1
              }}
            >
              <FolderPlus size={16} />
              {savingCategory ? 'Ajout...' : 'Ajouter la catégorie'}
            </button>
          </form>

          {/* Categories List */}
          {categories.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '36px', color: '#a0988c' }}>
              Aucune catégorie créée. Créez-en une ci-dessus pour classer vos questions.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categories.map((cat, idx) => {
                const count = items.filter((i) => i.category_id === cat.id).length;
                const isEditing = editingCategory?.id === cat.id;
                const isFirst = idx === 0;
                const isLast = idx === categories.length - 1;

                return (
                  <div
                    key={cat.id}
                    style={{
                      ...cardStyle,
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      opacity: cat.is_active ? 1 : 0.6
                    }}
                  >
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '10px', flex: 1, alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          style={{ ...inputStyle, flex: 1, maxWidth: '300px' }}
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateCategory(cat)}
                          style={{
                            ...primaryBtn,
                            padding: '8px 12px',
                            fontSize: '12px'
                          }}
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          style={{
                            ...iconBtn,
                            padding: '8px'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Folder size={18} style={{ color: '#c5a059' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f7f3ea' }}>
                              {cat.name}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                color: '#a0988c',
                                fontFamily: 'monospace',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              slug: {cat.slug}
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#a0988c' }}>
                            {count} question{count > 1 ? 's' : ''} associée{count > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {!isEditing && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleMoveCategory(idx, -1)}
                          disabled={isFirst}
                          title="Monter"
                          style={{ ...iconBtn, opacity: isFirst ? 0.3 : 1 }}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveCategory(idx, 1)}
                          disabled={isLast}
                          title="Descendre"
                          style={{ ...iconBtn, opacity: isLast ? 0.3 : 1 }}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleCategoryActive(cat)}
                          title={cat.is_active ? 'Désactiver' : 'Activer'}
                          style={{
                            ...iconBtn,
                            color: cat.is_active ? '#81c784' : '#e57373'
                          }}
                        >
                          {cat.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCategoryName(cat.name);
                          }}
                          title="Renommer"
                          style={{ ...iconBtn, color: '#c5a059' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          title="Supprimer"
                          style={{ ...iconBtn, color: '#e57373' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EN-TÊTE & CTA */}
      {activeTab === 'section' && (
        <form onSubmit={handleSaveSection} style={cardStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Surtitre (Eyebrow)</label>
              <input
                type="text"
                value={section.eyebrow}
                onChange={(e) => setSection({ ...section, eyebrow: e.target.value })}
                placeholder="Questions fréquentes"
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Titre principal</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => setSection({ ...section, title: e.target.value })}
                  placeholder="Tout ce que vous"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Titre accentué (doré / italique)</label>
                <input
                  type="text"
                  value={section.title_em}
                  onChange={(e) => setSection({ ...section, title_em: e.target.value })}
                  placeholder="devez savoir."
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description / Texte d'accompagnement</label>
              <textarea
                rows={3}
                value={section.description}
                onChange={(e) => setSection({ ...section, description: e.target.value })}
                placeholder="Vous hésitez sur le choix de votre pierre ? Contactez directement nos tailleurs..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Texte du bouton CTA</label>
                <input
                  type="text"
                  value={section.cta_text}
                  onChange={(e) => setSection({ ...section, cta_text: e.target.value })}
                  placeholder="Poser une question"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Lien du bouton CTA (optionnel)</label>
                <input
                  type="text"
                  value={section.cta_link}
                  onChange={(e) => setSection({ ...section, cta_link: e.target.value })}
                  placeholder="Laisser vide pour le lien WhatsApp automatique"
                  style={inputStyle}
                />
                <small style={{ fontSize: '11px', color: '#777', marginTop: '4px', display: 'block' }}>
                  Si vide, renverra automatiquement vers WhatsApp.
                </small>
              </div>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={savingSection}
                style={{
                  ...primaryBtn,
                  opacity: savingSection ? 0.6 : 1
                }}
              >
                <Save size={16} />
                {savingSection ? 'Enregistrement...' : 'Enregistrer les en-têtes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL: CREATE / EDIT QUESTION */}
      {editingItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => !savingItem && setEditingItem(null)}
        >
          <div
            style={{
              background: '#1a1816',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
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
                {editingItem.id ? 'Modifier la question' : 'Nouvelle question'}
              </h2>
              <button
                onClick={() => setEditingItem(null)}
                disabled={savingItem}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#a0988c',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category Select */}
              <div>
                <label style={labelStyle}>Catégorie</label>
                <select
                  value={itemForm.category_id}
                  onChange={(e) => setItemForm({ ...itemForm, category_id: e.target.value })}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Sans catégorie --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label style={labelStyle}>Question *</label>
                <textarea
                  rows={2}
                  required
                  value={itemForm.question}
                  onChange={(e) => setItemForm({ ...itemForm, question: e.target.value })}
                  placeholder="Ex: Quels sont les délais de fabrication ?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Answer Text */}
              <div>
                <label style={labelStyle}>Réponse détaillée *</label>
                <textarea
                  rows={6}
                  required
                  value={itemForm.answer}
                  onChange={(e) => setItemForm({ ...itemForm, answer: e.target.value })}
                  placeholder="Rédigez une réponse claire et professionnelle. Les sauts de ligne sont pris en compte."
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
              </div>

              {/* Toggles: Featured & Active */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={itemForm.is_featured}
                    onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                    style={{ accentColor: '#c5a059', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', color: '#f7f3ea', fontWeight: 600 }}>À la une</span>
                    <small style={{ display: 'block', fontSize: '11px', color: '#a0988c' }}>
                      Priorité d'affichage
                    </small>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={itemForm.is_active}
                    onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                    style={{ accentColor: '#c5a059', width: '16px', height: '16px' }}
                  />
                  <div>
                    <span style={{ fontSize: '13px', color: '#f7f3ea', fontWeight: 600 }}>Visible</span>
                    <small style={{ display: 'block', fontSize: '11px', color: '#a0988c' }}>
                      Affichée sur le site
                    </small>
                  </div>
                </label>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: '16px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={savingItem}
                  style={{
                    padding: '10px 16px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#efe8db',
                    borderRadius: '8px',
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
                    opacity: savingItem ? 0.6 : 1
                  }}
                >
                  <Save size={15} />
                  {savingItem ? 'Enregistrement...' : 'Enregistrer la question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
