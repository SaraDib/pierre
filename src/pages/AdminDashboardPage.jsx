import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  LogOut,
  User,
  Shield,
  Layers,
  FileText,
  ExternalLink,
  CheckCircle2,
  Server,
  Key,
  RefreshCw,
  Sparkles,
  Database
} from 'lucide-react';
import { getMe } from '../api/auth';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [apiUserData, setApiUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

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
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navigation Bar */}
      <header style={{
        background: 'rgba(26, 24, 22, 0.95)',
        borderBottom: '1px solid rgba(197, 160, 89, 0.2)',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)'
      }}>
        {/* Left: Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <img
              src="/logo-gold.png"
              alt="Sutravomar Stone Luxe"
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
                CONSOLE D'ADMINISTRATION
              </div>
            </div>
          </Link>
        </div>

        {/* Right: User pill & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#a0988c',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Voir le site</span>
            <ExternalLink size={12} />
          </Link>

          {/* User profile capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 12px 5px 6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(197, 160, 89, 0.25)',
            borderRadius: '100px'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #c5a059, #9e7d3b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#11100f',
              fontWeight: 700,
              fontSize: '13px'
            }}>
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f7f3ea' }}>
                {user?.name || 'Administrateur'}
              </div>
              <div style={{ fontSize: '10px', color: '#c5a059', letterSpacing: '0.05em' }}>
                {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin'}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '36px 28px', flex: 1 }}>
        {/* Welcome Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '36px',
          paddingBottom: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
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
              <Shield size={14} /> Tableau de bord administrateur
            </div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '32px',
              fontWeight: 400,
              color: '#f7f3ea',
              margin: '0 0 8px'
            }}>
              Bienvenue, {user?.name || 'Administrateur'}
            </h1>
            <p style={{ fontSize: '14px', color: '#a0988c', margin: 0, maxWidth: '600px' }}>
              Vous êtes connecté à l'espace de gestion Sutravomar Stone Luxe. Vos sessions sont sécurisées par jetons Laravel Sanctum.
            </p>
          </div>

          <button
            onClick={checkBackendHealth}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
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
            <span>Actualiser le statut</span>
          </button>
        </div>

        {/* Status Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Card 1: Backend Connection */}
          <div style={{
            background: 'rgba(26, 24, 22, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a0988c', fontWeight: 600 }}>
                Serveur Laravel API
              </span>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: apiStatus === 'connected' ? '#10b981' : (apiStatus === 'checking' ? '#f59e0b' : '#ef4444'),
                boxShadow: apiStatus === 'connected' ? '0 0 10px #10b981' : 'none'
              }} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#f7f3ea', marginBottom: '6px' }}>
              {apiStatus === 'connected' ? 'Connecté (Opérationnel)' : (apiStatus === 'checking' ? 'Vérification...' : 'Déconnecté')}
            </div>
            <div style={{ fontSize: '12px', color: '#a0988c' }}>
              Route : <code style={{ color: '#c5a059' }}>POST /api/login</code>
            </div>
          </div>

          {/* Card 2: Compte Connecté */}
          <div style={{
            background: 'rgba(26, 24, 22, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a0988c', fontWeight: 600 }}>
                Compte Authentifié
              </span>
              <User size={18} color="#c5a059" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#f7f3ea', marginBottom: '6px', wordBreak: 'break-all' }}>
              {user?.email || 'admin@pierre.com'}
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Rôle : {user?.role || 'admin'}
            </div>
          </div>

          {/* Card 3: Réalisations */}
          <div style={{
            background: 'rgba(26, 24, 22, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a0988c', fontWeight: 600 }}>
                Catalogue Réalisations
              </span>
              <Layers size={18} color="#c5a059" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '6px' }}>
              6 Chantiers
            </div>
            <div style={{ fontSize: '12px', color: '#a0988c' }}>
              Taza, Calacatta, Carrare, Granit noir
            </div>
          </div>

          {/* Card 4: Demandes / Devis */}
          <div style={{
            background: 'rgba(26, 24, 22, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#a0988c', fontWeight: 600 }}>
                Demandes de Devis
              </span>
              <FileText size={18} color="#c5a059" />
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f7f3ea', marginBottom: '6px' }}>
              Actif
            </div>
            <div style={{ fontSize: '12px', color: '#a0988c' }}>
              Formulaire public en ligne
            </div>
          </div>
        </div>

        {/* Detailed System & Token Diagnostic */}
        <div style={{
          background: 'rgba(26, 24, 22, 0.8)',
          border: '1px solid rgba(197, 160, 89, 0.2)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '36px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Key size={18} color="#c5a059" />
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '20px',
              fontWeight: 400,
              color: '#f7f3ea',
              margin: 0
            }}>
              Jeton de Session Actif (Laravel Sanctum)
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', display: 'block', marginBottom: '6px' }}>
                Bearer Token (Tronqué pour sécurité)
              </label>
              <div style={{
                background: 'rgba(17, 16, 15, 0.9)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#c5a059',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                wordBreak: 'break-all'
              }}>
                {token ? `${token.substring(0, 24)}••••••••••••••••••••••••` : 'Aucun jeton'}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#7a7266', display: 'block', marginBottom: '6px' }}>
                Réponse de l'API (/api/me)
              </label>
              <div style={{
                background: 'rgba(17, 16, 15, 0.9)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#efe8db',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflowX: 'auto'
              }}>
                {apiUserData ? JSON.stringify(apiUserData, null, 2) : 'Chargement des données API...'}
              </div>
            </div>
          </div>
        </div>

        {/* Administration Navigation Quick Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            to="/realisations"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f7f3ea',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c5a059';
              e.currentTarget.style.color = '#c5a059';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#f7f3ea';
            }}
          >
            <Layers size={16} />
            <span>Voir les Réalisations en ligne</span>
          </Link>

          <Link
            to="/#devis"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f7f3ea',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#c5a059';
              e.currentTarget.style.color = '#c5a059';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#f7f3ea';
            }}
          >
            <FileText size={16} />
            <span>Tester le Formulaire Devis</span>
          </Link>
        </div>
      </main>

      {/* Admin Footer */}
      <footer style={{
        background: '#0d0c0b',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '18px 28px',
        fontSize: '12px',
        color: '#7a7266',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          © 2026 SUTRAVOMAR STONE LUXE · Système d'Administration
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0988c' }}>
          <Database size={13} color="#c5a059" />
          <span>Base de données MariaDB / MySQL & Laravel 13</span>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
