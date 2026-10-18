import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_PHONE } from '../data/content';
import { getRealisationsContent } from '../api/realisations';

export default function RealisationsPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeModalProject, setActiveModalProject] = useState(null);
  const [activeModalImg, setActiveModalImg] = useState(null);

  // Scroll to top on mount & SEO title
  useEffect(() => {
    document.title = 'Nos Réalisations de Prestige | SUTRAVOMAR STONE LUXE Maroc';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      document.title = 'SUTRAVOMAR STONE LUXE | Marbre, Granit & Pierre Naturelle au Maroc';
    };
  }, []);

  const loadData = () => {
    setStatus('loading');
    getRealisationsContent()
      .then((res) => {
        setData(res);
        setStatus('ready');
      })
      .catch((err) => {
        console.error('Failed to load realisations:', err);
        setStatus('error');
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync activeModalImg when active project changes
  useEffect(() => {
    if (activeModalProject) {
      setActiveModalImg(activeModalProject.cover_image || activeModalProject.img);
    } else {
      setActiveModalImg(null);
    }
  }, [activeModalProject]);

  // Modal ESC key listener & body overflow
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModalProject(null);
      }
    };
    if (activeModalProject) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModalProject]);

  const section = data?.section || {};
  const categories = data?.categories || [];
  const items = data?.items || [];

  const filteredProjects =
    selectedFilter === 'all'
      ? items
      : items.filter((p) => p.category === selectedFilter || p.category_slug === selectedFilter);

  const getCategoryCount = (catKey) => {
    if (catKey === 'all') return items.length;
    return items.filter((p) => p.category === catKey || p.category_slug === catKey).length;
  };

  return (
    <main>
      {/* ===== HERO BANNER DE LA GALERIE ===== */}
      <section className="gallery-hero">
        <svg className="strata-bg" viewBox="0 0 1440 400" preserveAspectRatio="none" aria-hidden="true">
          <g fill="none" stroke="#efe8db" strokeWidth=".6">
            <path d="M0 80 C320 60 520 140 820 100 S1250 50 1440 90" />
            <path d="M0 180 C280 150 560 230 840 190 S1260 140 1440 180" />
            <path d="M0 290 C300 270 540 340 860 300 S1240 250 1440 280" />
          </g>
        </svg>

        <div className="wrap">
          <div className="breadcrumb">
            <Link to="/#accueil">Accueil</Link>
            <span>/</span>
            <span style={{ color: 'var(--ochre)' }}>Galerie Réalisations</span>
          </div>

          <div className="eyebrow">{section.hero_eyebrow || "Portfolio d'Exception · Maroc"}</div>
          <h1 style={{ marginTop: '20px' }}>
            {section.hero_title || 'Toutes nos'} <em>{section.hero_title_em || 'réalisations.'}</em>
          </h1>
          <p className="lead-text">
            {section.hero_description ||
              "Explorez l'ensemble de nos chantiers sur mesure : façades sculptées, escaliers hélicoïdaux, cuisines en granit, salles de bain en marbre et piscines en travertin partout au Maroc."}
          </p>
        </div>
      </section>

      {/* ===== BARRE DE FILTRES PAR CATÉGORIES ===== */}
      <div className="filter-bar">
        <div className="wrap">
          <div className="filter-list" role="tablist">
            <button
              className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              Tous les projets <span className="count">{getCategoryCount('all')}</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                className={`filter-btn ${selectedFilter === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedFilter(cat.slug)}
              >
                {cat.name} <span className="count">{getCategoryCount(cat.slug)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== GRILLE DES PROJETS ===== */}
      <section className="projects-sec">
        <div className="wrap">
          {status === 'loading' && (
            <div className="projects-grid" id="grid">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  className="card"
                  style={{
                    opacity: 0.6,
                    pointerEvents: 'none',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div
                    style={{
                      height: '220px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '8px 8px 0 0'
                    }}
                  />
                  <div style={{ padding: '20px' }}>
                    <div
                      style={{
                        width: '40%',
                        height: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        marginBottom: '12px'
                      }}
                    />
                    <div
                      style={{
                        width: '80%',
                        height: '18px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        marginBottom: '10px'
                      }}
                    />
                    <div
                      style={{
                        width: '100%',
                        height: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#f7f3ea' }}>
              <p style={{ color: '#e07a5f', fontSize: '16px', marginBottom: '16px' }}>
                Une erreur est survenue lors du chargement des réalisations.
              </p>
              <button
                type="button"
                className="btn btn-ochre"
                onClick={loadData}
                style={{ cursor: 'pointer' }}
              >
                Réessayer le chargement
              </button>
            </div>
          )}

          {status === 'ready' && filteredProjects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a0988c' }}>
              <p style={{ fontSize: '16px' }}>
                Aucune réalisation disponible dans cette catégorie pour le moment.
              </p>
            </div>
          )}

          {status === 'ready' && filteredProjects.length > 0 && (
            <div className="projects-grid" id="grid">
              {filteredProjects.map((project) => {
                const stoneTag = project.stone ? project.stone.split(' ')[0] : null;
                const locTag = (project.location || project.loc) ? (project.location || project.loc).split(' ')[0] : null;
                const cover = project.cover_image || project.img;
                const catBadge = project.catLabel || project.category_badge || project.category_name;
                const shortText = project.short_description || project.shortDesc;

                return (
                  <article
                    key={project.id}
                    className="card"
                    onClick={() => setActiveModalProject(project)}
                  >
                    <div className="card-media">
                      {stoneTag && <span className="card-tag">{stoneTag}</span>}
                      {locTag && <span className="card-loc">📍 {locTag}</span>}
                      <img src={cover} alt={project.title} loading="lazy" />
                    </div>
                    <div className="card-body">
                      {catBadge && <span className="card-cat">{catBadge}</span>}
                      <h3>{project.title}</h3>
                      {shortText && <p>{shortText}</p>}
                      <div className="card-foot">
                        <span>{project.finish || ''}</span>
                        <span className="view-link">Voir le détail →</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ===== SECTION APPEL À L'ACTION ===== */}
      <section className="cta-sec">
        <div className="wrap">
          <h2>
            {section.cta_title || 'Un projet sur mesure'} <em>{section.cta_title_em || 'en pierre naturelle ?'}</em>
          </h2>
          <p>
            {section.cta_description ||
              "Nos artisans tailleurs et maîtres poseurs se déplacent sur l'ensemble du Royaume pour vous conseiller, étudier vos plans et vous délivrer une proposition chiffrée détaillée sous 24h."}
          </p>
          <div className="cta-actions">
            <Link to="/#devis" className="btn btn-ochre">
              Demander mon devis gratuit <span className="ar">→</span>
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-line"
            >
              Discuter sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== MODALE LIGHTBOX PROJET ===== */}
      <div
        className={`modal-overlay ${activeModalProject ? 'open' : ''}`}
        id="modal"
        aria-hidden={!activeModalProject}
        onClick={(e) => {
          if (e.target.id === 'modal') setActiveModalProject(null);
        }}
      >
        {activeModalProject && (
          <div className="modal-card">
            <button
              className="modal-close"
              id="modalClose"
              aria-label="Fermer la fenêtre"
              onClick={() => setActiveModalProject(null)}
            >
              ✕
            </button>
            <div className="modal-img-wrap" style={{ display: 'flex', flexDirection: 'column' }}>
              <img
                src={activeModalImg || activeModalProject.cover_image || activeModalProject.img}
                alt={activeModalProject.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Galerie secondaire (vignettes) si disponible */}
              {activeModalProject.images && activeModalProject.images.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(17, 16, 15, 0.9)',
                    overflowX: 'auto',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveModalImg(activeModalProject.cover_image || activeModalProject.img)}
                    style={{
                      border:
                        activeModalImg === (activeModalProject.cover_image || activeModalProject.img)
                          ? '2px solid #c5a059'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                      padding: 0,
                      background: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      width: '56px',
                      height: '56px'
                    }}
                  >
                    <img
                      src={activeModalProject.cover_image || activeModalProject.img}
                      alt="Couverture"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                  {activeModalProject.images.map((gImg) => (
                    <button
                      key={gImg.id}
                      type="button"
                      onClick={() => setActiveModalImg(gImg.image_path)}
                      style={{
                        border:
                          activeModalImg === gImg.image_path
                            ? '2px solid #c5a059'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        width: '56px',
                        height: '56px'
                      }}
                    >
                      <img
                        src={gImg.image_path}
                        alt={gImg.caption || 'Vue'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-info">
              <div className="modal-eyebrow">
                {activeModalProject.catLabel || activeModalProject.category_badge || activeModalProject.category_name}
              </div>
              <h2 className="modal-title">{activeModalProject.title}</h2>
              <p className="modal-desc">
                {activeModalProject.description || activeModalProject.desc || activeModalProject.short_description || activeModalProject.shortDesc}
              </p>

              <div className="modal-specs">
                {activeModalProject.stone && (
                  <div className="spec-item">
                    <small>Pierre sélectionnée</small>
                    <b>{activeModalProject.stone}</b>
                  </div>
                )}
                {activeModalProject.finish && (
                  <div className="spec-item">
                    <small>Finition de surface</small>
                    <b>{activeModalProject.finish}</b>
                  </div>
                )}
                {(activeModalProject.location || activeModalProject.loc) && (
                  <div className="spec-item">
                    <small>Localisation du chantier</small>
                    <b>{activeModalProject.location || activeModalProject.loc}</b>
                  </div>
                )}
                {activeModalProject.materiaux && activeModalProject.materiaux.length > 0 && (
                  <div className="spec-item" style={{ gridColumn: 'span 2' }}>
                    <small>Matériau(x) associé(s)</small>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {activeModalProject.materiaux.map((m) => (
                        <span
                          key={m.id}
                          style={{
                            display: 'inline-block',
                            background: 'rgba(197, 160, 89, 0.15)',
                            border: '1px solid rgba(197, 160, 89, 0.3)',
                            color: '#c5a059',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link to="/#devis" className="btn btn-ochre" onClick={() => setActiveModalProject(null)}>
                  Demander un devis similaire <span className="ar">→</span>
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                    `Bonjour, je suis intéressé par votre réalisation : "${activeModalProject.title}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-line"
                  style={{ borderColor: 'var(--line-l)', color: 'var(--bone)' }}
                >
                  Parler à un conseiller
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
