import React, { useState, useEffect } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe,
  Upload,
  RefreshCw,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Eye,
  MessageSquare
} from 'lucide-react';

function InstagramIcon({ size = 15, color = '#e1306c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 15, color = '#1877f2' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
import {
  getCompanyInfo,
  updateCompanyInfo,
  resetCompanyInfo,
  formatCompanyMediaUrl,
  DEFAULT_COMPANY
} from '../api/company';
import { useCompany } from '../context/CompanyContext';
import LuxuryLoader from './LuxuryLoader';

export default function CompanyAdmin({ token }) {
  const { updateCompanyState } = useCompany();

  const [form, setForm] = useState(DEFAULT_COMPANY);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'contacts' | 'location' | 'social' | 'preview'

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const data = await getCompanyInfo();
        if (isMounted && data) {
          setForm((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données de l\'entreprise:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [token]);

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide (PNG, SVG, JPG, WEBP).');
        return;
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleRemoveSelectedLogo = () => {
    setLogoFile(null);
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview);
      setLogoPreview(null);
    }
  };

  // Submit updates
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined) {
          formData.append(key, val);
        }
      });

      if (logoFile) {
        formData.append('logo_file', logoFile);
      }

      const updated = await updateCompanyInfo(formData, token);
      if (updated) {
        setForm((prev) => ({ ...prev, ...updated }));
        updateCompanyState(updated);
        setLogoFile(null);
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
          setLogoPreview(null);
        }
      }

      setSaveSuccess('Les informations de l\'entreprise et le logo ont été mis à jour avec succès !');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveError(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  // Reset to initial defaults
  const handleReset = async () => {
    if (!window.confirm('Confirmez-vous la réinitialisation de toutes les informations de l\'entreprise aux valeurs par défaut ?')) {
      return;
    }

    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const reset = await resetCompanyInfo(token);
      if (reset) {
        setForm((prev) => ({ ...prev, ...reset }));
        updateCompanyState(reset);
        setLogoFile(null);
        if (logoPreview) {
          URL.revokeObjectURL(logoPreview);
          setLogoPreview(null);
        }
      }
      setSaveSuccess('Toutes les informations ont été réinitialisées aux valeurs initiales.');
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err) {
      setSaveError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setSaving(false);
    }
  };

  const currentDisplayLogo = logoPreview || formatCompanyMediaUrl(form.logo_url) || '/logo-gold.png';

  if (loading) {
    return <LuxuryLoader size={70} minHeight="300px" />;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Header Banner */}
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
            <Building2 size={28} />
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
                Gestionnaire Entreprise & Marque
              </h1>
              <span style={{
                background: 'rgba(197, 160, 89, 0.15)',
                border: '1px solid rgba(197, 160, 89, 0.35)',
                color: '#c5a059',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 9px',
                borderRadius: '100px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                Global
              </span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#a0988c', maxWidth: '600px' }}>
              Configurez le logo, le nom, le slogan, les numéros de téléphone/WhatsApp, email, adresses et réseaux sociaux. Les changements sont reflétés en temps réel sur le Header, le Footer et les boutons de contact.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={saving}
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
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
          title="Rétablir les paramètres par défaut"
        >
          <RotateCcw size={14} />
          <span>Réinitialiser</span>
        </button>
      </div>

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

      {/* Nav Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'general', label: '1. Identité & Logo', icon: Sparkles },
          { id: 'contacts', label: '2. Téléphone & WhatsApp', icon: Phone },
          { id: 'location', label: '3. Adresse & Horaires', icon: MapPin },
          { id: 'social', label: '4. Réseaux Sociaux', icon: Globe },
          { id: 'preview', label: '5. Aperçu en Direct', icon: Eye },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '8px 8px 0 0',
                background: isActive ? 'rgba(197, 160, 89, 0.14)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #c5a059' : '2px solid transparent',
                color: isActive ? '#f7f3ea' : '#a0988c',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} color={isActive ? '#c5a059' : '#7a7266'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: IDENTITÉ & LOGO */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Card Logo */}
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Sparkles size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Logo Officiel de l'Entreprise
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(220px, 300px) 1fr',
                gap: '24px',
                alignItems: 'center'
              }}>
                {/* Logo Box Preview */}
                <div style={{
                  background: 'radial-gradient(circle at center, #24201c 0%, #151311 100%)',
                  border: '1px dashed rgba(197, 160, 89, 0.4)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '180px'
                }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(197, 160, 89, 0.2)',
                    marginBottom: '12px',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={currentDisplayLogo}
                      alt={form.name || 'Logo Entreprise'}
                      style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = '/logo-gold.png';
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#c5a059', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {logoFile ? 'Nouveau logo sélectionné' : 'Logo en vigueur'}
                  </span>
                </div>

                {/* Upload Controls */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '8px', fontWeight: 600 }}>
                    Téléverser un nouveau logo (PNG, SVG, WebP)
                  </label>
                  <p style={{ fontSize: '12px', color: '#888', margin: '0 0 14px' }}>
                    Recommandation : format transparent PNG ou SVG, fond transparent, résolution minimale de 300x300 px pour un rendu net sur écran Retina.
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.25) 0%, rgba(197, 160, 89, 0.1) 100%)',
                      border: '1px solid rgba(197, 160, 89, 0.4)',
                      color: '#f7f3ea',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      <Upload size={16} color="#c5a059" />
                      <span>Choisir un fichier image...</span>
                      <input
                        type="file"
                        accept="image/png,image/svg+xml,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {logoFile && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedLogo}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#fca5a5',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Annuler la sélection
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7266', marginBottom: '6px' }}>
                      Ou chemin / URL absolue du logo
                    </label>
                    <input
                      type="text"
                      value={form.logo_url || ''}
                      onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                      placeholder="/logo-gold.png ou https://..."
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '9px 12px',
                        color: '#f7f3ea',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card Brand Names */}
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Building2 size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Nom de Marque & Présentation
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="SUTRAVOMAR"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                    Affiché dans la barre de navigation et les en-têtes
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    value={form.tagline || ''}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    placeholder="STONE LUXE"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#c5a059',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                    Sous-titre élégant sous le logo
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                  Description de l'activité (Pied de page)
                </label>
                <textarea
                  rows={3}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Marbre, granit et pierre naturelle : sélection, taille, vente et pose partout au Maroc."
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

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                  Mentions légales / Copyright
                </label>
                <input
                  type="text"
                  value={form.copyright || ''}
                  onChange={(e) => setForm({ ...form, copyright: e.target.value })}
                  placeholder={`© ${new Date().getFullYear()} SUTRAVOMAR STONE LUXE. Tous droits réservés.`}
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
        )}

        {/* TAB 2: TÉLÉPHONE & WHATSAPP */}
        {activeTab === 'contacts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Phone size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Numéros de Contact & Ligne Directe
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Téléphone principal (Format d'affichage) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+212 6 00 00 00 00"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                    Tel qu'il s'affiche dans le footer et les textes publics
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Téléphone secondaire (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={form.phone_secondary || ''}
                    onChange={(e) => setForm({ ...form, phone_secondary: e.target.value })}
                    placeholder="+212 5 22 00 00 00"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                    Ligne fixe ou second contact atelier
                  </span>
                </div>
              </div>

              {/* WhatsApp Config */}
              <div style={{
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <MessageSquare size={17} color="#22c55e" />
                  <h3 style={{ fontSize: '15px', color: '#86efac', margin: 0, fontWeight: 600 }}>
                    Lien WhatsApp & Formulaire de Devis
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                      Numéro WhatsApp (Format numérique international sans le signe +) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.whatsapp_number}
                      onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value.replace(/\D/g, '') })}
                      placeholder="212600000000"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.85)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        borderRadius: '8px',
                        padding: '11px 12px',
                        color: '#86efac',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                      Exemple : 212600000000 (utilisé par le bouton WhatsApp flottant et l'envoi de devis direct)
                    </span>
                  </div>

                  <a
                    href={`https://wa.me/${form.whatsapp_number}?text=Bonjour%20${encodeURIComponent(form.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 18px',
                      borderRadius: '8px',
                      background: '#16a34a',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginTop: '18px',
                      boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Tester le lien</span>
                  </a>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                  Adresse Email officielle *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#c5a059" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@sutravomar-stone.ma"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px 11px 38px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#7a7266', marginTop: '4px', display: 'block' }}>
                  Email de contact affiché dans le footer et les correspondances
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADRESSE & HORAIRES */}
        {activeTab === 'location' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <MapPin size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Localisation & Disponibilité
                </h2>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                  Adresse Showroom & Atelier *
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Atelier & Showroom, Route de Rabat, Casablanca, Maroc"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(17, 16, 15, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#f7f3ea',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Ville / Région
                  </label>
                  <input
                    type="text"
                    value={form.city || ''}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Casablanca"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Pays
                  </label>
                  <input
                    type="text"
                    value={form.country || ''}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Maroc"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Horaires d'ouverture
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={16} color="#c5a059" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      value={form.opening_hours || ''}
                      onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                      placeholder="Lun - Sam : 08h30 - 18h30"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(17, 16, 15, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        borderRadius: '8px',
                        padding: '11px 12px 11px 38px',
                        color: '#f7f3ea',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    Zone de livraison / intervention
                  </label>
                  <input
                    type="text"
                    value={form.intervention_zone || ''}
                    onChange={(e) => setForm({ ...form, intervention_zone: e.target.value })}
                    placeholder="Intervention dans tout le Maroc"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#c5a059',
                      fontWeight: 600,
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                  Lien Google Maps ou itinéraire
                </label>
                <input
                  type="text"
                  value={form.maps_url || ''}
                  onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: 'rgba(17, 16, 15, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '11px 12px',
                    color: '#f7f3ea',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RÉSEAUX SOCIAUX */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Globe size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Présence en Ligne & Réseaux Sociaux
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    <InstagramIcon size={14} color="#e1306c" />
                    <span>Lien Instagram</span>
                  </label>
                  <input
                    type="url"
                    value={form.instagram_url || ''}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    placeholder="https://www.instagram.com/sutravomar"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a0988c', marginBottom: '6px', fontWeight: 600 }}>
                    <FacebookIcon size={14} color="#1877f2" />
                    <span>Lien Facebook</span>
                  </label>
                  <input
                    type="url"
                    value={form.facebook_url || ''}
                    onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                    placeholder="https://www.facebook.com/sutravomar"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(17, 16, 15, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '11px 12px',
                      color: '#f7f3ea',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 5: APERÇU EN DIRECT */}
        {activeTab === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Preview Card */}
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Eye size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Aperçu de la Barre de Navigation (Header)
                </h2>
              </div>

              <div style={{
                background: '#151311',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                borderRadius: '12px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={currentDisplayLogo}
                    alt={form.name}
                    style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{
                      fontFamily: "'Fraunces', Georgia, serif",
                      fontSize: '19px',
                      fontWeight: 600,
                      color: '#f7f3ea',
                      letterSpacing: '0.04em',
                      lineHeight: 1.1
                    }}>
                      {form.name || 'SUTRAVOMAR'}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      letterSpacing: '0.22em',
                      color: '#c5a059',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      marginTop: '3px'
                    }}>
                      {form.tagline || 'STONE LUXE'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#a0988c' }}>Accueil · Savoir-faire · Matériaux</span>
                  <div style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #c5a059 0%, #9e7d3b 100%)',
                    color: '#11100f',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    Devis gratuit →
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Preview Card */}
            <div style={{
              background: 'rgba(26, 24, 22, 0.85)',
              border: '1px solid rgba(197, 160, 89, 0.22)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Eye size={18} color="#c5a059" />
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '18px', color: '#f7f3ea', margin: 0 }}>
                  Aperçu du Pied de Page (Footer)
                </h2>
              </div>

              <div style={{
                background: '#0d0c0b',
                border: '1px solid rgba(197, 160, 89, 0.25)',
                borderRadius: '12px',
                padding: '28px',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '44px',
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: 'rgba(197, 160, 89, 0.08)',
                  marginBottom: '16px',
                  userSelect: 'none'
                }}>
                  {form.name || 'SUTRAVOMAR'}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  fontSize: '13px',
                  color: '#a0988c'
                }}>
                  <div>
                    <img
                      src={currentDisplayLogo}
                      alt={form.name}
                      style={{ height: '36px', marginBottom: '12px', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
                    />
                    <h4 style={{ color: '#f7f3ea', margin: '0 0 6px', fontSize: '14px' }}>
                      {form.name} {form.tagline}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: '#888' }}>
                      {form.description}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: '#c5a059', margin: '0 0 10px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Contact direct
                    </h4>
                    <p style={{ margin: '4px 0', color: '#f7f3ea', fontWeight: 600 }}>{form.phone}</p>
                    {form.phone_secondary && (
                      <p style={{ margin: '4px 0', color: '#a0988c' }}>{form.phone_secondary}</p>
                    )}
                    <p style={{ margin: '4px 0', color: '#c5a059' }}>{form.email}</p>
                    <p style={{ margin: '4px 0' }}>{form.address}</p>
                    <p style={{ margin: '6px 0 0', color: '#22c55e', fontSize: '12px' }}>
                      WhatsApp : +{form.whatsapp_number}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ color: '#c5a059', margin: '0 0 10px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Chantiers & Horaires
                    </h4>
                    <p style={{ margin: '4px 0', color: '#c5a059', fontWeight: 600 }}>{form.intervention_zone}</p>
                    <p style={{ margin: '4px 0' }}>{form.opening_hours}</p>
                    <p style={{ margin: '4px 0' }}>{form.city}, {form.country}</p>
                  </div>
                </div>

                <div style={{
                  marginTop: '24px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                  color: '#666'
                }}>
                  <span>{(form.copyright || `© ${new Date().getFullYear()} ${form.name || 'SUTRAVOMAR'}. Tous droits réservés.`).replace(/\b20\d{2}\b/, new Date().getFullYear())}</span>
                  <span>{form.name} · {form.tagline}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Action Bar */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '300px',
          right: '20px',
          maxWidth: '1100px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#a0988c' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span>Mise à jour instantanée du Header, Footer et boutons de contact</span>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={saving}
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
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              <span>{saving ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
