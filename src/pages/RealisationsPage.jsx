import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { REALISATIONS_DATA, WHATSAPP_PHONE } from '../data/content';

const CATEGORIES = [
  { key: 'all', label: 'Tous les projets' },
  { key: 'facade', label: 'Façades & Extérieurs' },
  { key: 'escalier', label: 'Escaliers & Sols' },
  { key: 'cuisine', label: 'Cuisines & Plans' },
  { key: 'salle-de-bain', label: 'Salles de bain & Vasques' },
  { key: 'piscine', label: 'Piscines & Terrasses' }
];

export default function RealisationsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeModalProject, setActiveModalProject] = useState(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

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

  const filteredProjects =
    selectedFilter === 'all'
      ? REALISATIONS_DATA
      : REALISATIONS_DATA.filter((p) => p.category === selectedFilter);

  const getCategoryCount = (catKey) => {
    if (catKey === 'all') return REALISATIONS_DATA.length;
    return REALISATIONS_DATA.filter((p) => p.category === catKey).length;
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

          <div className="eyebrow">Portfolio d'Exception · Maroc</div>
          <h1 style={{ marginTop: '20px' }}>
            Toutes nos <em>réalisations.</em>
          </h1>
          <p className="lead-text">
            Explorez l'ensemble de nos chantiers sur mesure : façades sculptées, escaliers hélicoïdaux, cuisines en granit, salles de bain en marbre et piscines en travertin partout au Maroc.
          </p>
        </div>
      </section>

      {/* ===== BARRE DE FILTRES PAR CATÉGORIES ===== */}
      <div className="filter-bar">
        <div className="wrap">
          <div className="filter-list" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                className={`filter-btn ${selectedFilter === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedFilter(cat.key)}
              >
                {cat.label} <span className="count">{getCategoryCount(cat.key)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== GRILLE DES PROJETS ===== */}
      <section className="projects-sec">
        <div className="wrap">
          <div className="projects-grid" id="grid">
            {filteredProjects.map((project) => (
              <article
                key={project.id}
                className="card"
                onClick={() => setActiveModalProject(project)}
              >
                <div className="card-media">
                  <span className="card-tag">{project.stone.split(' ')[0]}</span>
                  <span className="card-loc">📍 {project.loc.split(' ')[0]}</span>
                  <img src={project.img} alt={project.title} loading="lazy" />
                </div>
                <div className="card-body">
                  <span className="card-cat">{project.catLabel}</span>
                  <h3>{project.title}</h3>
                  <p>{project.shortDesc}</p>
                  <div className="card-foot">
                    <span>{project.finish}</span>
                    <span className="view-link">Voir le détail →</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION APPEL À L'ACTION ===== */}
      <section className="cta-sec">
        <div className="wrap">
          <h2>Un projet sur mesure <em>en pierre naturelle ?</em></h2>
          <p>
            Nos artisans tailleurs et maîtres poseurs se déplacent sur l'ensemble du Royaume pour vous conseiller, étudier vos plans et vous délivrer une proposition chiffrée détaillée sous 24h.
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
            <div className="modal-img-wrap">
              <img src={activeModalProject.img} alt={activeModalProject.title} />
            </div>
            <div className="modal-info">
              <div className="modal-eyebrow">{activeModalProject.catLabel}</div>
              <h2 className="modal-title">{activeModalProject.title}</h2>
              <p className="modal-desc">{activeModalProject.desc}</p>

              <div className="modal-specs">
                <div className="spec-item">
                  <small>Pierre sélectionnée</small>
                  <b>{activeModalProject.stone}</b>
                </div>
                <div className="spec-item">
                  <small>Finition de surface</small>
                  <b>{activeModalProject.finish}</b>
                </div>
                <div className="spec-item">
                  <small>Localisation du chantier</small>
                  <b>{activeModalProject.loc}</b>
                </div>
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
