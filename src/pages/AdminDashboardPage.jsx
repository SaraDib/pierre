import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Sparkles,
  Layers,
  Boxes,
  ListChecks,
  HelpCircle,
  ExternalLink,
  LogOut,
  User,
  Shield,
  CheckCircle2,
  Key,
  RefreshCw,
  Database,
  Menu,
  X,
  FileText,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  Save,
  RotateCcw,
  Video,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Eye,
  Type,
  Hash,
  Play,
  Upload
} from 'lucide-react';
import { getMe } from '../api/auth';
import {
  getAcceuilContent,
  updateAcceuilContent,
  resetAcceuilContent,
  formatMediaUrl
} from '../api/acceuil';
import StoneTexture from '../components/StoneTexture';
import {
  MATERIALS_DATA,
  ALL_MATERIALS_DATA,
  EXPERTISE_LAYERS,
  REALISATIONS_DATA,
  FAQ_DATA
} from '../data/content';

const METHOD_STEPS = [
  {
    step: '01',
    title: 'Conseil & sélection des blocs',
    desc: 'Choix minutieux des carrières et des blocs de marbre ou pierre naturelle selon votre cahier des charges esthétique et technique.'
  },
  {
    step: '02',
    title: 'Relevé laser & calepinage 3D',
    desc: 'Prise de cotes millimétrique sur votre chantier avec scanner laser et élaboration des plans d\'appareillage sur mesure.'
  },
  {
    step: '03',
    title: 'Découpe numérique & finitions manuelles',
    desc: 'Usinage 5 axes de haute précision dans notre atelier, complété par le travail de taille et de polissage traditionnel de nos maîtres artisans.'
  },
  {
    step: '04',
    title: 'Pose d\'excellence & traitement protecteur',
    desc: 'Installation sur site avec joints invisibles, mise en place des ancrages et application d\'un traitement hydrofuge / oléofuge longue durée.'
  }
];

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('accueil');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [apiUserData, setApiUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Formulaire d'édition Accueil (Table acceuil)
  const [acceuilForm, setAcceuilForm] = useState({
    eyebrow: 'Marbre · Granit · Pierre naturelle — Maroc',
    title_line1: 'La pierre,',
    title_line2: 'taillée',
    title_line3: 'pour durer.',
    description: 'SUTRAVOMAR STONE LUXE sélectionne, façonne et pose des pierres nobles pour vos façades, escaliers, cuisines, piscines et espaces extérieurs. Du bloc brut à la finition parfaite.',
    video_url: '/videos/logo-reveal.mp4',
    arch_badge: 'Collection',
    arch_title: 'Beige de Taza, poli',
    arch_material: 'travertin',
    arch_image: '',
    stat1_number: '30+',
    stat1_label: 'Variétés de pierres',
    stat2_number: '100%',
    stat2_label: 'Sur mesure',
    stat3_number: 'Maroc',
    stat3_label: 'Livraison & pose',
    marquee_words: []
  });
  const [marqueeInput, setMarqueeInput] = useState('Pierre de Taza, Marbre, Granit, Travertin, Ardoise, Sur mesure, Pose & livraison');
  const [savingAcceuil, setSavingAcceuil] = useState(false);
  const [loadingAcceuil, setLoadingAcceuil] = useState(true);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [archImageFile, setArchImageFile] = useState(null);

  const sidebarItems = [
    {
      id: 'accueil',
      label: 'Accueil',
      path: '/#accueil',
      icon: Home,
      badge: 'Éditeur & Stats'
    },
    {
      id: 'savoir-faire',
      label: 'Savoir-faire',
      path: '/#savoir-faire',
      icon: Sparkles,
      badge: '5 expertises'
    },
    {
      id: 'materiaux',
      label: 'Matériaux',
      path: '/#materiaux',
      icon: Layers,
      badge: `${ALL_MATERIALS_DATA.length} roches`
    },
    {
      id: 'realisations',
      label: 'Réalisations',
      path: '/#realisations',
      icon: Boxes,
      badge: `${REALISATIONS_DATA.length} projets`
    },
    {
      id: 'methode',
      label: 'Méthode',
      path: '/#methode',
      icon: ListChecks,
      badge: '4 étapes'
    },
    {
      id: 'faq',
      label: 'FAQ',
      path: '/#faq',
      icon: HelpCircle,
      badge: `${FAQ_DATA.length} questions`
    }
  ];

  const checkBackendHealth = async () => {
    setRefreshing(true);
    try {
      const data = await getMe(token);
      setApiUserData(data.user || data);
      setApiStatus('connected');
    } catch (err) {
      console.error('Backend check failed:', err);
      setApiStatus('error');
    } finally {
      setRefreshing(false);
    }
  };

  const loadAcceuil = async () => {
    setLoadingAcceuil(true);
    try {
      const data = await getAcceuilContent();
      if (data) {
        setAcceuilForm((prev) => ({ ...prev, ...data }));
        if (Array.isArray(data.marquee_words)) {
          setMarqueeInput(data.marquee_words.join(', '));
        }
      }
    } catch (err) {
      console.error('Failed to load acceuil content:', err);
    } finally {
      setLoadingAcceuil(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    loadAcceuil();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const handleSaveAcceuil = async (e) => {
    e.preventDefault();
    setSavingAcceuil(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const formData = new FormData();
      Object.keys(acceuilForm).forEach((key) => {
        if (key !== 'marquee_words' && key !== 'arch_image') {
          formData.append(key, acceuilForm[key] ?? '');
        }
      });

      if (acceuilForm.arch_image && !archImageFile) {
        formData.append('arch_image', acceuilForm.arch_image);
      }

      // Format marquee words array
      const words = marqueeInput.split(',').map((w) => w.trim()).filter(Boolean);
      formData.append('marquee_words', JSON.stringify(words));

      // Append files if uploaded
      if (videoFile) {
        formData.append('video_file', videoFile);
      }
      if (archImageFile) {
        formData.append('arch_image_file', archImageFile);
      }

      const updated = await updateAcceuilContent(formData, token);
      if (updated) {
        setAcceuilForm((prev) => ({ ...prev, ...updated }));
        if (Array.isArray(updated.marquee_words)) {
          setMarqueeInput(updated.marquee_words.join(', '));
        }
        setVideoFile(null);
        setArchImageFile(null);
      }

      setSaveMessage('✓ Modifications enregistrées avec succès !');
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setSavingAcceuil(false);
    }
  };

  const handleResetAcceuil = async () => {
    if (!window.confirm('Confirmez-vous la réinitialisation de tout le contenu d\'accueil aux valeurs par défaut ?')) {
      return;
    }

    setSavingAcceuil(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const reset = await resetAcceuilContent(token);
      if (reset) {
        setAcceuilForm((prev) => ({ ...prev, ...reset }));
        if (Array.isArray(reset.marquee_words)) {
          setMarqueeInput(reset.marquee_words.join(', '));
        }
        setVideoFile(null);
        setArchImageFile(null);
      }
      setSaveMessage('✓ Contenu réinitialisé avec succès aux valeurs d\'origine.');
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setSavingAcceuil(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#11100f',
      color: '#efe8db',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex'
    }}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 90,
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside style={{
        width: '280px',
        background: '#181614',
        borderRight: '1px solid rgba(197, 160, 89, 0.18)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }} className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link
            to="/admin"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}
            onClick={() => setActiveSection('accueil')}
          >
            <img
              src="/logo-gold.png"
              alt="Sutravomar"
              style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: '18px',
                fontWeight: 600,
                color: '#f7f3ea',
                letterSpacing: '0.04em'
              }}>
                SUTRAVOMAR
              </div>
              <div style={{
                fontSize: '9px',
                letterSpacing: '0.22em',
                color: '#c5a059',
                textTransform: 'uppercase',
                fontWeight: 600
              }}>
                STONE LUXE · ADMIN
              </div>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'none',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              borderRadius: '8px',
              color: '#c5a059',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-close-btn"
            aria-label="Fermer le menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Category Label */}
        <div style={{
          padding: '20px 20px 10px',
          fontSize: '10px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#7a7266',
          fontWeight: 700
        }}>
          Gestion des sections
        </div>

        {/* Sidebar Navigation Items */}
        <div className="admin-nav-section" style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: '10px',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(197, 160, 89, 0.16) 0%, rgba(197, 160, 89, 0.05) 100%)'
                        : 'transparent',
                      border: isActive ? '1px solid rgba(197, 160, 89, 0.35)' : '1px solid transparent',
                      transition: 'all 0.2s ease',
                      paddingRight: '6px'
                    }}
                  >
                    <button
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 12px',
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: isActive ? '#f7f3ea' : '#b3aba0',
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Icon
                        size={17}
                        color={isActive ? '#c5a059' : '#8a8276'}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '100px',
                          background: isActive ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: isActive ? '#c5a059' : '#7a7266',
                          fontWeight: 600
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </button>

                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Voir la section ${item.label} sur le site public`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        color: '#7a7266',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#c5a059';
                        e.currentTarget.style.background = 'rgba(197, 160, 89, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#7a7266';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer User Capsule */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(17, 16, 15, 0.6)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c5a059, #9e7d3b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#11100f',
              fontWeight: 700,
              fontSize: '14px',
              flexShrink: 0
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f7f3ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrateur'}
              </div>
              <div style={{ fontSize: '11px', color: '#7a7266', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'admin@pierre.com'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.22)',
              color: '#fca5a5',
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.22)';
            }}
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }} className="admin-main">
        {/* Top Navbar */}
        <div style={{
          background: 'rgba(24, 22, 20, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 80
        }}>
          {/* Left: Mobile hamburger & Section Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#efe8db',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              className="mobile-hamburger"
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>

            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c5a059', fontWeight: 600 }}>
                Administration Sutravomar
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f7f3ea', textTransform: 'capitalize' }}>
                {sidebarItems.find(s => s.id === activeSection)?.label || 'Tableau de bord'}
              </div>
            </div>
          </div>

          {/* Right: Visit Live Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            <a
              href={`/#${activeSection === 'accueil' ? 'accueil' : activeSection}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                color: '#c5a059',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(197, 160, 89, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(197, 160, 89, 0.12)';
              }}
            >
              <span>Voir sur le site public</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Dynamic Section Content */}
        <main style={{ flex: 1, padding: '32px 36px', maxWidth: '1280px', width: '100%', boxSizing: 'border-box' }}>
          {/* SECTION 1: ACCUEIL - GESTION DU CONTENU (TABLE ACCEUIL) */}
          {activeSection === 'accueil' && (
            <div>
              {/* Header banner */}
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h1 style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 400,
                    color: '#f7f3ea',
                    margin: '0 0 8px'
                  }}>
                    Gestion du Contenu · Page d'Accueil
                  </h1>
                  <p style={{ fontSize: '14px', color: '#a0988c', margin: 0, maxWidth: '720px' }}>
                    Modifiez en temps réel les textes d'accroche, la vidéo hero, la carte de collection de pierre, les chiffres clés et le ruban doré.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleResetAcceuil}
                    disabled={savingAcceuil}
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
                      cursor: savingAcceuil ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#f7f3ea'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#a0988c'; }}
                  >
                    <RotateCcw size={14} />
                    <span>Réinitialiser par défaut</span>
                  </button>

                  <a
                    href="/#accueil"
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
                      textDecoration: 'none'
                    }}
                  >
                    <Eye size={14} />
                    <span>Aperçu en direct ↗</span>
                  </a>
                </div>
              </div>

              {/* Success / Error Notification */}
              {saveMessage && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#6ee7b7',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <Check size={18} />
                  <span>{saveMessage}</span>
                </div>
              )}

              {saveError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertCircle size={18} />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Main Content Form */}
              <form onSubmit={handleSaveAcceuil}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '28px' }}>

                  {/* CARD 1: TITRES & DESCRIPTION */}
                  <div style={{
                    background: 'rgba(26, 24, 22, 0.85)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <Type size={18} color="#c5a059" />
                      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                        1. Accroche & Titres Principaux
                      </h2>
                    </div>

                    {/* Accroche (eyebrow) */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                        Texte d'accroche supérieur (Eyebrow)
                      </label>
                      <input
                        type="text"
                        value={acceuilForm.eyebrow}
                        onChange={(e) => setAcceuilForm({ ...acceuilForm, eyebrow: e.target.value })}
                        placeholder="Marbre · Granit · Pierre naturelle — Maroc"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          background: 'rgba(17, 16, 15, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f7f3ea',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Titre 3 lignes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                          Titre Ligne 1
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.title_line1}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, title_line1: e.target.value })}
                          placeholder="La pierre,"
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
                        <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059', marginBottom: '6px', fontWeight: 600 }}>
                          Titre Ligne 2 (Doré)
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.title_line2}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, title_line2: e.target.value })}
                          placeholder="taillée"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(197, 160, 89, 0.4)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            color: '#c5a059',
                            fontWeight: 600,
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                          Titre Ligne 3
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.title_line3}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, title_line3: e.target.value })}
                          placeholder="pour durer."
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

                    {/* Description Paragraph */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                        Texte Descriptif Principal (Lead)
                      </label>
                      <textarea
                        rows={4}
                        value={acceuilForm.description}
                        onChange={(e) => setAcceuilForm({ ...acceuilForm, description: e.target.value })}
                        placeholder="SUTRAVOMAR STONE LUXE sélectionne, façonne et pose des pierres nobles..."
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          background: 'rgba(17, 16, 15, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f7f3ea',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>

                  {/* CARD 2: VIDÉO HERO */}
                  <div style={{
                    background: 'rgba(26, 24, 22, 0.85)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <Video size={18} color="#c5a059" />
                      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                        2. Vidéo d'Arrière-Plan (Hero)
                      </h2>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                        Chemin ou URL de la vidéo (.mp4)
                      </label>
                      <input
                        type="text"
                        value={acceuilForm.video_url}
                        onChange={(e) => setAcceuilForm({ ...acceuilForm, video_url: e.target.value })}
                        placeholder="/videos/logo-reveal.mp4"
                        style={{
                          width: '100%',
                          boxSizing: 'border-box',
                          background: 'rgba(17, 16, 15, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#f7f3ea',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                      <span style={{ fontSize: '11px', color: '#7a7266', display: 'block', marginTop: '4px' }}>
                        Par défaut : <code>/videos/logo-reveal.mp4</code>
                      </span>
                    </div>

                    <div style={{
                      padding: '14px',
                      background: 'rgba(17, 16, 15, 0.5)',
                      border: '1px dashed rgba(197, 160, 89, 0.3)',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <Upload size={20} color="#c5a059" style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '12px', color: '#efe8db', marginBottom: '6px' }}>
                        Ou importer une nouvelle vidéo depuis votre ordinateur :
                      </div>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => setVideoFile(e.target.files[0] || null)}
                        style={{ fontSize: '12px', color: '#a0988c' }}
                      />
                      {videoFile && (
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px' }}>
                          Fichier sélectionné : {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} Mo)
                        </div>
                      )}
                    </div>

                    {/* Live Video Player Preview */}
                    {(videoFile || acceuilForm.video_url) && (
                      <div style={{ marginTop: '16px' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#c5a059', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                          Aperçu du lecteur vidéo :
                        </span>
                        <div style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(197, 160, 89, 0.3)',
                          background: '#000',
                          position: 'relative'
                        }}>
                          <video
                            key={videoFile ? videoFile.name : formatMediaUrl(acceuilForm.video_url)}
                            src={videoFile ? URL.createObjectURL(videoFile) : formatMediaUrl(acceuilForm.video_url)}
                            controls
                            muted
                            playsInline
                            style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CARD 3: CARTE ARCHE (VISUEL DE LA PIERRE) */}
                  <div style={{
                    background: 'rgba(26, 24, 22, 0.85)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <ImageIcon size={18} color="#c5a059" />
                      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                        3. Carte Arche (Collection & Texture)
                      </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                          Badge supérieur
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.arch_badge}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, arch_badge: e.target.value })}
                          placeholder="Collection"
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
                          Nom de la pierre
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.arch_title}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, arch_title: e.target.value })}
                          placeholder="Beige de Taza, poli"
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

                    {/* Choix de texture */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                        Texture minérale de l'arche
                      </label>
                      <select
                        value={acceuilForm.arch_material || 'travertin'}
                        onChange={(e) => setAcceuilForm({ ...acceuilForm, arch_material: e.target.value })}
                        style={{
                          width: '100%',
                          background: 'rgba(17, 16, 15, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: '#f7f3ea',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      >
                        <option value="travertin">Travertin romain (Teinte miel/beige strié)</option>
                        <option value="marbre">Marbre Calacatta (Blanc veiné noble)</option>
                        <option value="granit">Granit noir absolu (Grain minéral sombre)</option>
                        <option value="taza">Pierre de Taza (Calcaire doux doré)</option>
                        <option value="ardoise">Ardoise naturelle (Anthracite clivé)</option>
                      </select>
                    </div>

                    {/* Image optionnelle pour l'arche */}
                    <div style={{
                      padding: '12px',
                      background: 'rgba(17, 16, 15, 0.5)',
                      border: '1px dashed rgba(197, 160, 89, 0.25)',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#c5a059', fontWeight: 600, marginBottom: '6px' }}>
                        Image personnalisée (remplace la texture SVG si renseignée) :
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setArchImageFile(e.target.files[0] || null)}
                        style={{ fontSize: '12px', color: '#a0988c', marginBottom: '8px' }}
                      />
                      {(archImageFile || acceuilForm.arch_image) && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={archImageFile ? URL.createObjectURL(archImageFile) : formatMediaUrl(acceuilForm.arch_image)}
                            alt="Aperçu arche"
                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(197, 160, 89, 0.3)' }}
                          />
                          <span style={{ fontSize: '11px', color: '#10b981' }}>
                            {archImageFile ? `Image sélectionnée : ${archImageFile.name}` : 'Image personnalisée active'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 4: STATISTIQUES HERO */}
                  <div style={{
                    background: 'rgba(26, 24, 22, 0.85)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                      <Hash size={18} color="#c5a059" />
                      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                        4. Statistiques & Compteurs (3 Colonnes)
                      </h2>
                    </div>

                    {/* Stat 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Chiffre 1
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat1_number}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat1_number: e.target.value })}
                          placeholder="30+"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#c5a059',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Libellé 1
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat1_label}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat1_label: e.target.value })}
                          placeholder="Variétés de pierres"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#f7f3ea',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Stat 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px', marginBottom: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Chiffre 2
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat2_number}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat2_number: e.target.value })}
                          placeholder="100%"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#c5a059',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Libellé 2
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat2_label}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat2_label: e.target.value })}
                          placeholder="Sur mesure"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#f7f3ea',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>

                    {/* Stat 3 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Chiffre 3
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat3_number}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat3_number: e.target.value })}
                          placeholder="Maroc"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#c5a059',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', color: '#7a7266', marginBottom: '4px' }}>
                          Libellé 3
                        </label>
                        <input
                          type="text"
                          value={acceuilForm.stat3_label}
                          onChange={(e) => setAcceuilForm({ ...acceuilForm, stat3_label: e.target.value })}
                          placeholder="Livraison & pose"
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            background: 'rgba(17, 16, 15, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            padding: '8px 10px',
                            color: '#f7f3ea',
                            fontSize: '13px'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 5: RUBAN DÉFILANT DORÉ (MARQUEE) */}
                  <div style={{
                    gridColumn: '1 / -1',
                    background: 'rgba(26, 24, 22, 0.85)',
                    border: '1px solid rgba(197, 160, 89, 0.22)',
                    borderRadius: '14px',
                    padding: '24px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Sparkles size={18} color="#c5a059" />
                      <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                        5. Mots du Ruban Défilant Doré (Marquee)
                      </h2>
                    </div>

                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Mots-clés défilants (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={marqueeInput}
                      onChange={(e) => setMarqueeInput(e.target.value)}
                      placeholder="Pierre de Taza, Marbre, Granit, Travertin, Ardoise, Sur mesure, Pose & livraison"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        color: '#f7f3ea',
                        fontSize: '13px',
                        marginBottom: '14px',
                        outline: 'none'
                      }}
                    />

                    {/* Badge Preview */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {marqueeInput.split(',').map((w, idx) => {
                        const trimmed = w.trim();
                        if (!trimmed) return null;
                        return (
                          <span
                            key={idx}
                            style={{
                              background: 'rgba(197, 160, 89, 0.15)',
                              border: '1px solid rgba(197, 160, 89, 0.35)',
                              color: '#c5a059',
                              padding: '4px 10px',
                              borderRadius: '100px',
                              fontSize: '11px',
                              fontWeight: 600,
                              letterSpacing: '0.04em'
                            }}
                          >
                            ★ {trimmed}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit Action Bar */}
                <div style={{
                  position: 'sticky',
                  bottom: '20px',
                  zIndex: 70,
                  background: 'rgba(26, 24, 22, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
                }}>
                  <div style={{ fontSize: '13px', color: '#a0988c' }}>
                    Les modifications sont appliquées immédiatement sur le site public.
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      disabled={savingAcceuil}
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
                        cursor: savingAcceuil ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
                        opacity: savingAcceuil ? 0.7 : 1
                      }}
                    >
                      <Save size={16} />
                      <span>{savingAcceuil ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: SAVOIR-FAIRE */}
          {activeSection === 'savoir-faire' && (
            <div>
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
                    Savoir-faire & Domaines d'Intervention
                  </h1>
                  <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
                    Les 5 spécialités d'excellence affichées sur la section <a href="/#savoir-faire" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#savoir-faire</a>.
                  </p>
                </div>
                <a
                  href="/#savoir-faire"
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
                  Ouvrir #savoir-faire ↗
                </a>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {EXPERTISE_LAYERS.map((item) => (
                  <div
                    key={item.n}
                    style={{
                      background: 'rgba(26, 24, 22, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px',
                      transition: 'border-color 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <span style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: '22px',
                        color: '#c5a059',
                        fontWeight: 300
                      }}>
                        {item.n}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(197, 160, 89, 0.1)',
                        color: '#c5a059'
                      }}>
                        {item.matKey}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f7f3ea', margin: '0 0 10px' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#a0988c', lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: MATÉRIAUX */}
          {activeSection === 'materiaux' && (
            <div>
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
                    Matériaux d'Exception
                  </h1>
                  <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
                    Les pierres nobles et marbres présentés sur la section <a href="/#materiaux" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#materiaux</a>.
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {ALL_MATERIALS_DATA.map((mat) => (
                  <div
                    key={mat.k}
                    style={{
                      background: 'rgba(26, 24, 22, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ fontSize: '20px', fontFamily: "'Fraunces', Georgia, serif", color: '#f7f3ea', margin: 0 }}>
                        {mat.t}
                      </h3>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#c5a059'
                      }}>
                        {mat.s}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#a0988c', lineHeight: 1.6, marginBottom: '18px' }}>
                      {mat.d}
                    </p>

                    <div>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', display: 'block', marginBottom: '8px' }}>
                        Finitions disponibles :
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {mat.f.map((fin) => (
                          <span
                            key={fin}
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(197, 160, 89, 0.12)',
                              color: '#efe8db',
                              border: '1px solid rgba(197, 160, 89, 0.2)'
                            }}
                          >
                            {fin}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: RÉALISATIONS */}
          {activeSection === 'realisations' && (
            <div>
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
                    Chantiers & Réalisations d'Exception
                  </h1>
                  <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
                    Les {REALISATIONS_DATA.length} projets répertoriés sur la section <a href="/#realisations" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#realisations</a> et la page <Link to="/realisations" style={{ color: '#c5a059' }}>/realisations</Link>.
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
                    Section #realisations ↗
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
                    Page Complète ↗
                  </Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
                {REALISATIONS_DATA.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      background: 'rgba(26, 24, 22, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          color: '#c5a059',
                          fontWeight: 700
                        }}>
                          {proj.catLabel}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#a0988c',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <MapPin size={12} color="#c5a059" /> {proj.loc}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f7f3ea', margin: '0 0 10px', lineHeight: 1.3 }}>
                        {proj.title}
                      </h3>

                      <p style={{ fontSize: '13px', color: '#a0988c', lineHeight: 1.6, marginBottom: '16px' }}>
                        {proj.desc}
                      </p>
                    </div>

                    <div style={{
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}>
                      <span style={{ color: '#c5a059' }}>{proj.stone}</span>
                      <span style={{ color: '#7a7266' }}>{proj.finish}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: MÉTHODE */}
          {activeSection === 'methode' && (
            <div>
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
                    Méthode de Travail & Processus
                  </h1>
                  <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
                    Les 4 étapes du protocole d'artisanat présentées sur la section <a href="/#methode" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#methode</a>.
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {METHOD_STEPS.map((step) => (
                  <div
                    key={step.step}
                    style={{
                      background: 'rgba(26, 24, 22, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <div style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '28px',
                      color: '#c5a059',
                      fontWeight: 300,
                      marginBottom: '10px'
                    }}>
                      {step.step}
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f7f3ea', margin: '0 0 10px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#a0988c', lineHeight: 1.6, margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: FAQ */}
          {activeSection === 'faq' && (
            <div>
              <div style={{
                marginBottom: '28px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '28px', fontWeight: 400, color: '#f7f3ea', margin: '0 0 6px' }}>
                    Foire Aux Questions (FAQ)
                  </h1>
                  <p style={{ fontSize: '13px', color: '#a0988c', margin: 0 }}>
                    Les {FAQ_DATA.length} réponses aux questions fréquentes sur la section <a href="/#faq" target="_blank" rel="noopener noreferrer" style={{ color: '#c5a059' }}>#faq</a>.
                  </p>
                </div>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {FAQ_DATA.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(26, 24, 22, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '24px'
                    }}
                  >
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#f7f3ea',
                      margin: '0 0 10px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}>
                      <span style={{ color: '#c5a059', fontWeight: 700 }}>Q{idx + 1}.</span>
                      <span>{item.q}</span>
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#a0988c',
                      lineHeight: 1.6,
                      margin: 0,
                      paddingLeft: '32px'
                    }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%) !important;
            width: min(300px, 86vw) !important;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.85) !important;
            z-index: 1000 !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .mobile-hamburger {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .mobile-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .admin-nav-section {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
}
