import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { formatCompanyMediaUrl } from '../api/company';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const { company } = useCompany();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #221f1b 0%, #11100f 75%, #0b0a0a 100%)',
      color: '#efe8db',
      fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow & subtle grid */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(197, 160, 89, 0.12) 0%, rgba(197, 160, 89, 0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Top Brand Link */}
      <div style={{ position: 'relative', zIndex: 1, marginBottom: '28px', textAlign: 'center' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#a0988c',
            fontSize: '13px',
            textDecoration: 'none',
            marginBottom: '20px',
            padding: '6px 14px',
            borderRadius: '100px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#c5a059';
            e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a0988c';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
          }}
        >
          <ArrowLeft size={14} /> Retour au site public
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <img
            src={formatCompanyMediaUrl(company?.logo_url) || "/logo-gold.png"}
            alt={company?.name || "Sutravomar Stone Luxe"}
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: '20px',
              letterSpacing: '0.06em',
              fontWeight: 500,
              color: '#f7f3ea'
            }}>
              {company?.name || 'SUTRAVOMAR'}
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#c5a059',
              fontWeight: 600
            }}>
              {company?.tagline || 'STONE LUXE'} · ADMIN
            </div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(26, 24, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(197, 160, 89, 0.22)',
        borderRadius: '16px',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px rgba(197, 160, 89, 0.05)'
      }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(197, 160, 89, 0.1)',
            color: '#c5a059',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '12px',
            border: '1px solid rgba(197, 160, 89, 0.25)'
          }}>
            <ShieldCheck size={14} /> Espace d'administration
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: '26px',
            fontWeight: 400,
            color: '#f7f3ea',
            margin: '0 0 6px'
          }}>
            Connexion
          </h1>
          <p style={{ fontSize: '13px', color: '#9e9587', margin: 0 }}>
            Connectez-vous pour piloter le contenu et les demandes.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(185, 28, 28, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '12px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              color: '#d4cbbe',
              marginBottom: '8px'
            }}>
              Adresse e-mail
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7a7266'
                }}
              />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@pierre.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  boxSize: 'border-box',
                  background: 'rgba(17, 16, 15, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px 12px 42px',
                  color: '#f7f3ea',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c5a059';
                  e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 89, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 600,
                color: '#d4cbbe'
              }}>
                Mot de passe
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#7a7266'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  boxSize: 'border-box',
                  background: 'rgba(17, 16, 15, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 42px 12px 42px',
                  color: '#f7f3ea',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#c5a059';
                  e.target.style.boxShadow = '0 0 0 3px rgba(197, 160, 89, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#7a7266',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '13px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #c5a059 0%, #9e7d3b 100%)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#11100f',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.04em',
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px rgba(197, 160, 89, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
              opacity: submitting ? 0.75 : 1
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(197, 160, 89, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(197, 160, 89, 0.25)';
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Connexion en cours...
              </>
            ) : (
              <>
                <span>Accéder à l'administration</span>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>→</span>
              </>
            )}
          </button>
        </form>


      </div>

      {/* Footer copyright note */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '24px',
        fontSize: '12px',
        color: '#655e54',
        textAlign: 'center'
      }}>
        © {new Date().getFullYear()} SUTRAVOMAR STONE LUXE · Système d'administration sécurisé
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
