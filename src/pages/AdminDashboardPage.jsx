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
  ArrowUpRight
} from 'lucide-react';
import { getMe } from '../api/auth';
import {
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

  const sidebarItems = [
    {
      id: 'accueil',
      label: 'Accueil',
      path: '/#accueil',
      icon: Home,
      badge: 'Général'
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

  useEffect(() => {
    checkBackendHealth();
  }, [token]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
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
        transform: mobileMenuOpen ? 'translateX(0)' : undefined,
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
                    {/* Main section tab selector button */}
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

                    {/* Quick jump to live site anchor */}
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
          {/* User Profile Mini */}
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

          {/* Logout Button */}
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

          {/* Right: API Server Status & Visit Live Site */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Live API Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: '#efe8db'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: apiStatus === 'connected' ? '#10b981' : (apiStatus === 'checking' ? '#f59e0b' : '#ef4444'),
                boxShadow: apiStatus === 'connected' ? '0 0 8px #10b981' : 'none'
              }} />
              <span>Laravel API : {apiStatus === 'connected' ? 'Connecté' : (apiStatus === 'checking' ? 'Vérification...' : 'Erreur')}</span>
            </div>

            {/* Visit Live Website */}
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
          {/* SECTION 1: ACCUEIL / TABLEAU DE BORD */}
          {activeSection === 'accueil' && (
            <div>
              {/* Header banner */}
              <div style={{
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#c5a059',
                    fontSize: '11px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}>
                    <Shield size={14} /> Espace d'administration central
                  </div>
                  <h1 style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '32px',
                    fontWeight: 400,
                    color: '#f7f3ea',
                    margin: '0 0 8px'
                  }}>
                    Vue d'ensemble · Accueil
                  </h1>
                  <p style={{ fontSize: '14px', color: '#a0988c', margin: 0, maxWidth: '640px' }}>
                    Gérez et visualisez l'ensemble des modules du site Sutravomar Stone Luxe depuis votre barre latérale de navigation.
                  </p>
                </div>

                <button
                  onClick={checkBackendHealth}
                  disabled={refreshing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'rgba(197, 160, 89, 0.1)',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    color: '#c5a059',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: refreshing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Tester l'API Laravel</span>
                </button>
              </div>

              {/* 4 Metric Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
              }}>
                <div style={{
                  background: 'rgba(26, 24, 22, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '22px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', fontWeight: 600 }}>
                      Savoir-faire
                    </span>
                    <Sparkles size={16} color="#c5a059" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '4px' }}>
                    {EXPERTISE_LAYERS.length} Piliers
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0988c' }}>
                    Revêtements, vasques, façades...
                  </div>
                </div>

                <div style={{
                  background: 'rgba(26, 24, 22, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '22px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', fontWeight: 600 }}>
                      Matériaux
                    </span>
                    <Layers size={16} color="#c5a059" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '4px' }}>
                    {ALL_MATERIALS_DATA.length} Roches Nobles
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0988c' }}>
                    Marbre, Granit, Travertin, Taza, Ardoise
                  </div>
                </div>

                <div style={{
                  background: 'rgba(26, 24, 22, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '22px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', fontWeight: 600 }}>
                      Réalisations
                    </span>
                    <Boxes size={16} color="#c5a059" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '4px' }}>
                    {REALISATIONS_DATA.length} Projets
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0988c' }}>
                    Casablanca, Rabat, Marrakech...
                  </div>
                </div>

                <div style={{
                  background: 'rgba(26, 24, 22, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '22px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', fontWeight: 600 }}>
                      FAQ Clientèle
                    </span>
                    <HelpCircle size={16} color="#c5a059" />
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '4px' }}>
                    {FAQ_DATA.length} Réponses
                  </div>
                  <div style={{ fontSize: '12px', color: '#a0988c' }}>
                    Choix, délais, entretien, pose
                  </div>
                </div>
              </div>

              {/* Laravel Sanctum & Session Diagnostic */}
              <div style={{
                background: 'rgba(26, 24, 22, 0.8)',
                border: '1px solid rgba(197, 160, 89, 0.2)',
                borderRadius: '14px',
                padding: '24px',
                marginBottom: '28px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Key size={17} color="#c5a059" />
                  <h3 style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: '18px',
                    fontWeight: 400,
                    color: '#f7f3ea',
                    margin: 0
                  }}>
                    Jeton de session actif (Laravel Sanctum)
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', display: 'block', marginBottom: '6px' }}>
                      Token d'authentification
                    </span>
                    <div style={{
                      background: 'rgba(17, 16, 15, 0.9)',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#c5a059',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      wordBreak: 'break-all'
                    }}>
                      {token ? `${token.substring(0, 28)}••••••••••••••••••••••••` : 'Aucun jeton'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', display: 'block', marginBottom: '6px' }}>
                      Réponse profil API (/api/me)
                    </span>
                    <div style={{
                      background: 'rgba(17, 16, 15, 0.9)',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#efe8db',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflowX: 'auto'
                    }}>
                      {apiUserData ? JSON.stringify(apiUserData, null, 2) : 'Interrogation de l\'API...'}
                    </div>
                  </div>
                </div>
              </div>
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
