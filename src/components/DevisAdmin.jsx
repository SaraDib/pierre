import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Phone,
  RefreshCw,
  Save,
  Check,
  AlertCircle,
  Eye,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  getDevisList,
  getDevisStats,
  updateDevis,
  deleteDevis,
  getDevisSection,
  updateDevisSection,
  DEFAULT_DEVIS_SECTION
} from '../api/devis';
import { useCompany } from '../context/CompanyContext';

export default function DevisAdmin({ token, onCountChange }) {
  const { company } = useCompany();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'section'
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState({ total: 0, nouveau: 0, en_cours: 0, traite: 0 });
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Section config form
  const [sectionForm, setSectionForm] = useState(DEFAULT_DEVIS_SECTION);
  const [loadingSection, setLoadingSection] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Load quotes and stats
  const fetchQuotes = useCallback(async () => {
    setLoadingQuotes(true);
    try {
      const [list, st] = await Promise.all([
        getDevisList({ status: filterStatus, search: searchQuery }, token),
        getDevisStats(token)
      ]);
      setQuotes(list || []);
      if (st) {
        setStats(st);
        if (onCountChange) {
          onCountChange(st.nouveau || 0);
        }
      }
    } catch (err) {
      console.error('Erreur chargement des devis:', err);
    } finally {
      setLoadingQuotes(false);
    }
  }, [filterStatus, searchQuery, token, onCountChange]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Load section content
  useEffect(() => {
    async function loadSection() {
      setLoadingSection(true);
      try {
        const sec = await getDevisSection();
        if (sec) {
          setSectionForm((prev) => ({ ...prev, ...sec }));
        }
      } catch (err) {
        console.error('Erreur chargement section devis:', err);
      } finally {
        setLoadingSection(false);
      }
    }
    loadSection();
  }, []);

  // Update status of quote
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDevis(id, { status: newStatus }, token);
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
      );
      const st = await getDevisStats(token);
      if (st) {
        setStats(st);
        if (onCountChange) onCountChange(st.nouveau || 0);
      }
    } catch (err) {
      alert(err.message || 'Erreur mise à jour statut');
    }
  };

  // Update notes
  const handleNotesBlur = async (id, notes) => {
    try {
      await updateDevis(id, { admin_notes: notes }, token);
    } catch (err) {
      console.error('Erreur sauvegarde notes:', err);
    }
  };

  // Delete quote
  const handleDelete = async (id) => {
    if (!window.confirm('Confirmez-vous la suppression de cette demande de devis ?')) return;
    try {
      await deleteDevis(id, token);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
      const st = await getDevisStats(token);
      if (st) {
        setStats(st);
        if (onCountChange) onCountChange(st.nouveau || 0);
      }
    } catch (err) {
      alert(err.message || 'Erreur suppression');
    }
  };

  // Save section content
  const handleSaveSection = async (e) => {
    e?.preventDefault();
    setSavingSection(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const updated = await updateDevisSection(sectionForm, token);
      if (updated) {
        setSectionForm((prev) => ({ ...prev, ...updated }));
      }
      setSaveSuccess('Les textes et éléments de la section Devis ont été enregistrés avec succès !');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSavingSection(false);
    }
  };

  // Prepare client whatsapp url
  const getClientWhatsAppUrl = (quote) => {
    const rawPhone = (quote.phone || '').replace(/\D/g, '');
    const clientName = quote.name || 'Client';
    const project = quote.project_type || 'projet de pierre';
    const companyName = company?.name || 'SUTRAVOMAR STONE LUXE';
    const text = `Bonjour ${clientName},\n\nNous faisons suite à votre demande de devis pour votre ${project} reçue sur le site de ${companyName}.\n\nPourrions-nous échanger quelques minutes concernant les détails de vos mesures et finitions souhaitées ?`;
    return `https://wa.me/${rawPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 24, 0.9) 0%, rgba(20, 18, 16, 0.95) 100%)',
        border: '1px solid rgba(197, 160, 89, 0.3)',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.2) 0%, rgba(197, 160, 89, 0.05) 100%)',
            border: '1px solid rgba(197, 160, 89, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c5a059'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '24px',
                fontWeight: 600,
                color: '#f7f3ea',
                margin: 0
              }}>
                Gestionnaire des Devis & WhatsApp
              </h1>
              {stats.nouveau > 0 && (
                <span style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '100px',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)'
                }}>
                  {stats.nouveau} nouveau{stats.nouveau > 1 ? 'x' : ''}
                </span>
              )}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a0988c', maxWidth: '650px' }}>
              Conservez une trace complète de toutes les demandes de devis générées sur le site avant envoi WhatsApp, relancez les clients en un clic et modifiez les textes et arguments de la section Devis.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchQuotes}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#c5a059',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '26px'
      }}>
        <div style={{
          background: 'rgba(26, 24, 22, 0.85)',
          border: '1px solid rgba(197, 160, 89, 0.22)',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888' }}>
              Total Demandes
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginTop: '4px' }}>
              {stats.total}
            </div>
          </div>
          <FileText size={28} color="#c5a059" opacity={0.6} />
        </div>

        <div style={{
          background: stats.nouveau > 0 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(26, 24, 22, 0.85)',
          border: stats.nouveau > 0 ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(197, 160, 89, 0.22)',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#86efac' }}>
              Nouvelles demandes
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#22c55e', marginTop: '4px' }}>
              {stats.nouveau}
            </div>
          </div>
          <Sparkles size={28} color="#22c55e" opacity={0.8} />
        </div>

        <div style={{
          background: 'rgba(26, 24, 22, 0.85)',
          border: '1px solid rgba(197, 160, 89, 0.22)',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fbbf24' }}>
              En cours de traitement
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
              {stats.en_cours}
            </div>
          </div>
          <Clock size={28} color="#f59e0b" opacity={0.6} />
        </div>

        <div style={{
          background: 'rgba(26, 24, 22, 0.85)',
          border: '1px solid rgba(197, 160, 89, 0.22)',
          borderRadius: '12px',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c' }}>
              Traités & Finalisés
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#9ca3af', marginTop: '4px' }}>
              {stats.traite}
            </div>
          </div>
          <CheckCircle2 size={28} color="#9ca3af" opacity={0.6} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '8px 8px 0 0',
            background: activeTab === 'requests' ? 'rgba(197, 160, 89, 0.14)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '2px solid #c5a059' : '2px solid transparent',
            color: activeTab === 'requests' ? '#f7f3ea' : '#a0988c',
            fontSize: '13px',
            fontWeight: activeTab === 'requests' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <MessageSquare size={16} color={activeTab === 'requests' ? '#c5a059' : '#7a7266'} />
          <span>Demandes de Devis Reçues ({quotes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('section')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '8px 8px 0 0',
            background: activeTab === 'section' ? 'rgba(197, 160, 89, 0.14)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'section' ? '2px solid #c5a059' : '2px solid transparent',
            color: activeTab === 'section' ? '#f7f3ea' : '#a0988c',
            fontSize: '13px',
            fontWeight: activeTab === 'section' ? 600 : 500,
            cursor: 'pointer'
          }}
        >
          <Sparkles size={16} color={activeTab === 'section' ? '#c5a059' : '#7a7266'} />
          <span>Personnalisation de la Section Devis (Textes & Délais)</span>
        </button>
      </div>

      {/* TAB 1: DEMANDES DE DEVIS */}
      {activeTab === 'requests' && (
        <div>
          {/* Filter & Search Bar */}
          <div style={{
            background: 'rgba(26, 24, 22, 0.85)',
            border: '1px solid rgba(197, 160, 89, 0.22)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
              <Search size={16} color="#c5a059" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, projet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(17, 16, 15, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '9px 12px 9px 36px',
                  color: '#f7f3ea',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter by Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7266', fontWeight: 600 }}>
                Filtrer :
              </span>
              {[
                { id: 'all', label: 'Tous' },
                { id: 'nouveau', label: 'Nouveaux', color: '#22c55e' },
                { id: 'en_cours', label: 'En cours', color: '#f59e0b' },
                { id: 'traite', label: 'Traités', color: '#9ca3af' },
                { id: 'archive', label: 'Archivés', color: '#6b7280' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setFilterStatus(st.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: filterStatus === st.id ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: filterStatus === st.id ? '1px solid rgba(197, 160, 89, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: filterStatus === st.id ? '#f7f3ea' : '#a0988c',
                    fontSize: '12px',
                    fontWeight: filterStatus === st.id ? 600 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quotes List */}
          {loadingQuotes ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#c5a059' }}>
              <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#a0988c' }}>Chargement des devis...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div style={{
              background: 'rgba(26, 24, 22, 0.5)',
              border: '1px dashed rgba(197, 160, 89, 0.25)',
              borderRadius: '14px',
              padding: '48px 24px',
              textAlign: 'center'
            }}>
              <MessageSquare size={36} color="#c5a059" opacity={0.4} />
              <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: '14px 0 6px' }}>
                Aucune demande de devis trouvée
              </h3>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                {searchQuery || filterStatus !== 'all'
                  ? 'Aucun résultat ne correspond à vos critères de recherche.'
                  : 'Dès qu\'un visiteur clique sur « Envoyer via WhatsApp », la demande est enregistrée ici automatiquement.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {quotes.map((q) => {
                const isNew = q.status === 'nouveau';
                const createdDate = q.created_at ? new Date(q.created_at).toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '';

                return (
                  <div
                    key={q.id}
                    style={{
                      background: isNew ? 'rgba(34, 197, 94, 0.04)' : 'rgba(26, 24, 22, 0.85)',
                      border: isNew ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(197, 160, 89, 0.22)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      transition: 'all 0.2s',
                      boxShadow: isNew ? '0 4px 20px rgba(34, 197, 94, 0.08)' : 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      marginBottom: '14px'
                    }}>
                      {/* Client Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'rgba(197, 160, 89, 0.15)',
                          border: '1px solid rgba(197, 160, 89, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#c5a059',
                          fontWeight: 700,
                          fontSize: '16px'
                        }}>
                          {(q.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: '#f7f3ea' }}>
                              {q.name}
                            </span>
                            <span style={{
                              background: 'rgba(197, 160, 89, 0.14)',
                              border: '1px solid rgba(197, 160, 89, 0.3)',
                              color: '#c5a059',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {q.project_type || 'Aménagement'}
                            </span>
                            {isNew && (
                              <span style={{
                                background: '#22c55e',
                                color: '#000',
                                fontSize: '10px',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                Nouveau
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '12px', color: '#888' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} color="#c5a059" /> {q.phone}
                            </span>
                            <span>•</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {createdDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct Actions: WhatsApp & Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Status Select */}
                        <select
                          value={q.status}
                          onChange={(e) => handleStatusChange(q.id, e.target.value)}
                          style={{
                            background: q.status === 'nouveau'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : q.status === 'en_cours'
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(255, 255, 255, 0.06)',
                            border: q.status === 'nouveau'
                              ? '1px solid rgba(34, 197, 94, 0.4)'
                              : q.status === 'en_cours'
                              ? '1px solid rgba(245, 158, 11, 0.4)'
                              : '1px solid rgba(255, 255, 255, 0.15)',
                            color: q.status === 'nouveau'
                              ? '#86efac'
                              : q.status === 'en_cours'
                              ? '#fbbf24'
                              : '#d1d5db',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="nouveau" style={{ background: '#1c1917', color: '#86efac' }}>● Nouveau</option>
                          <option value="en_cours" style={{ background: '#1c1917', color: '#fbbf24' }}>● En cours</option>
                          <option value="traite" style={{ background: '#1c1917', color: '#9ca3af' }}>✓ Traité</option>
                          <option value="archive" style={{ background: '#1c1917', color: '#6b7280' }}>✕ Archivé</option>
                        </select>

                        {/* WhatsApp Button */}
                        <a
                          href={getClientWhatsAppUrl(q)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#16a34a',
                            color: '#ffffff',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
                          }}
                          title="Ouvrir la conversation WhatsApp avec message prérempli"
                        >
                          <ExternalLink size={13} />
                          <span>Discuter sur WhatsApp</span>
                        </a>

                        {/* Direct Call */}
                        <a
                          href={`tel:${q.phone.replace(/\D/g, '')}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#f7f3ea',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          <Phone size={13} color="#c5a059" />
                          <span>Appeler</span>
                        </a>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDelete(q.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#71717a',
                            padding: '8px',
                            cursor: 'pointer',
                            borderRadius: '6px'
                          }}
                          title="Supprimer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div style={{
                      background: 'rgba(17, 16, 15, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: '#d6cfc7',
                      lineHeight: '1.6',
                      marginBottom: '12px'
                    }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c5a059', marginBottom: '4px', fontWeight: 600 }}>
                        Détails & Message du projet :
                      </div>
                      {q.message ? q.message : <em style={{ color: '#777' }}>Aucun message textuel fourni (type de projet spécifié uniquement).</em>}
                    </div>

                    {/* Admin Notes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>Note interne :</span>
                      <input
                        type="text"
                        defaultValue={q.admin_notes || ''}
                        onBlur={(e) => handleNotesBlur(q.id, e.target.value)}
                        placeholder="Ex : Devis envoyé le 19/10, rappel prévu jeudi..."
                        style={{
                          flex: 1,
                          boxSizing: 'border-box',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '4px 6px',
                          color: '#f7f3ea',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERSONNALISATION DE LA SECTION DEVIS */}
      {activeTab === 'section' && (
        <div>
          {/* Notifications */}
          {saveSuccess && (
            <div style={{
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              color: '#86efac',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px'
            }}>
              <Check size={18} color="#22c55e" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {saveError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px'
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleSaveSection}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Form Fields Card */}
              <div style={{
                background: 'rgba(26, 24, 22, 0.85)',
                border: '1px solid rgba(197, 160, 89, 0.22)',
                borderRadius: '14px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Sparkles size={18} color="#c5a059" />
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                    Textes & Accroches de la Section Devis
                  </h2>
                </div>

                {/* Eyebrow */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Sur-titre (Eyebrow)
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.eyebrow}
                    onChange={(e) => setSectionForm({ ...sectionForm, eyebrow: e.target.value })}
                    placeholder="Devis sur mesure"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#f7f3ea',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Title Line */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Début du titre
                    </label>
                    <input
                      type="text"
                      required
                      value={sectionForm.title_prefix}
                      onChange={(e) => setSectionForm({ ...sectionForm, title_prefix: e.target.value })}
                      placeholder="Donnez vie à"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f7f3ea',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Emphase du titre (Italique doré)
                    </label>
                    <input
                      type="text"
                      value={sectionForm.title_emphasis || ''}
                      onChange={(e) => setSectionForm({ ...sectionForm, title_emphasis: e.target.value })}
                      placeholder="vos projets de pierre."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#c5a059',
                        fontStyle: 'italic',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Description / Proposition de valeur
                  </label>
                  <textarea
                    rows={3}
                    value={sectionForm.description || ''}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    placeholder="Partagez-nous les dimensions, surfaces et inspirations de votre ouvrage. Notre bureau d'études vous transmet une estimation détaillée et personnalisée."
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Arguments / Stats: 24h & Gratuit */}
                <div style={{
                  background: 'rgba(17, 16, 15, 0.6)',
                  border: '1px solid rgba(197, 160, 89, 0.2)',
                  borderRadius: '10px',
                  padding: '18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '12px', color: '#c5a059', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
                    Chiffres clés de confiance (Délai & Gratuité)
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Stat 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
                          Valeur 1
                        </label>
                        <input
                          type="text"
                          required
                          value={sectionForm.stat1_value}
                          onChange={(e) => setSectionForm({ ...sectionForm, stat1_value: e.target.value })}
                          placeholder="24h"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#c5a059',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
                          Libellé 1
                        </label>
                        <input
                          type="text"
                          required
                          value={sectionForm.stat1_label}
                          onChange={(e) => setSectionForm({ ...sectionForm, stat1_label: e.target.value })}
                          placeholder="Délai de réponse"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#f7f3ea',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
                          Valeur 2
                        </label>
                        <input
                          type="text"
                          required
                          value={sectionForm.stat2_value}
                          onChange={(e) => setSectionForm({ ...sectionForm, stat2_value: e.target.value })}
                          placeholder="Gratuit"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#c5a059',
                            fontWeight: 700,
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
                          Libellé 2
                        </label>
                        <input
                          type="text"
                          required
                          value={sectionForm.stat2_label}
                          onChange={(e) => setSectionForm({ ...sectionForm, stat2_label: e.target.value })}
                          placeholder="Étude & chiffrage"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.9)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '6px',
                            padding: '8px 10px',
                            color: '#f7f3ea',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Button & Note */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Texte du bouton d'envoi
                    </label>
                    <input
                      type="text"
                      value={sectionForm.button_text || ''}
                      onChange={(e) => setSectionForm({ ...sectionForm, button_text: e.target.value })}
                      placeholder="Envoyer via WhatsApp"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f7f3ea',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Note sous le formulaire
                    </label>
                    <input
                      type="text"
                      value={sectionForm.note_text || ''}
                      onChange={(e) => setSectionForm({ ...sectionForm, note_text: e.target.value })}
                      placeholder="Le message se prépare automatiquement dans WhatsApp, prêt à être expédié."
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#f7f3ea',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div style={{
                background: 'rgba(26, 24, 22, 0.85)',
                border: '1px solid rgba(197, 160, 89, 0.22)',
                borderRadius: '14px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                  <Eye size={18} color="#c5a059" />
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                    Aperçu en Direct de la Section Devis
                  </h2>
                </div>

                <div style={{
                  background: '#151311',
                  border: '1px solid rgba(197, 160, 89, 0.25)',
                  borderRadius: '12px',
                  padding: '36px 32px'
                }}>
                  <div style={{ maxWidth: '600px' }}>
                    <div style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em',
                      color: '#c5a059',
                      fontWeight: 700,
                      marginBottom: '12px'
                    }}>
                      {sectionForm.eyebrow}
                    </div>

                    <h2 style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '28px',
                      fontWeight: 500,
                      color: '#f7f3ea',
                      margin: '0 0 16px',
                      lineHeight: '1.25'
                    }}>
                      {sectionForm.title_prefix}{' '}
                      <em style={{ color: '#c5a059', fontStyle: 'italic' }}>
                        {sectionForm.title_emphasis}
                      </em>
                    </h2>

                    <p style={{
                      fontSize: '14px',
                      color: 'rgba(239, 232, 219, 0.7)',
                      lineHeight: '1.6',
                      margin: '0 0 24px'
                    }}>
                      {sectionForm.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: '40px',
                      paddingTop: '20px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#c5a059', fontFamily: "'Fraunces', Georgia, serif" }}>
                          {sectionForm.stat1_value}
                        </div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginTop: '2px' }}>
                          {sectionForm.stat1_label}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#c5a059', fontFamily: "'Fraunces', Georgia, serif" }}>
                          {sectionForm.stat2_value}
                        </div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#888', marginTop: '2px' }}>
                          {sectionForm.stat2_label}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '300px',
                right: '20px',
                maxWidth: '1180px',
                margin: '0 auto',
                zIndex: 80,
                background: 'rgba(26, 24, 22, 0.96)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(197, 160, 89, 0.35)',
                borderRadius: '12px',
                padding: '14px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.85)'
              }}>
                <div style={{ fontSize: '13px', color: '#a0988c' }}>
                  Modifications appliquées immédiatement sur la section Devis du site.
                </div>

                <button
                  type="submit"
                  disabled={savingSection}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #c5a059 0%, #9e7d3b 100%)',
                    color: '#11100f',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: savingSection ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
                    opacity: savingSection ? 0.7 : 1
                  }}
                >
                  {savingSection ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  <span>{savingSection ? 'Enregistrement...' : 'Enregistrer les éléments'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
