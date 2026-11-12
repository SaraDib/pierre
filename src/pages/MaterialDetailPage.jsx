import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCatalogueMaterial } from '../api/catalogue';
import { normalizeMaterial, materialPath } from '../data/useMaterials';
import LuxuryLoader from '../components/LuxuryLoader';
import { useSeo, SITE_URL } from '../seo/useSeo';
import NotFoundPage from './NotFoundPage';
import './MaterialsPages.css';

const SPEC_LABELS = [
  ['origin', 'Origine'],
  ['finish', 'Finition'],
  ['thickness', 'Épaisseur'],
  ['uses', 'Usages'],
  ['maintenance', 'Entretien'],
];

export default function MaterialDetailPage() {
  const { typeSlug, slug } = useParams();
  const [material, setMaterial] = useState(null);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [adjacent, setAdjacent] = useState({ prev: null, next: null });
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not_found' | 'error'
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const loadMaterial = useCallback(() => {
    if (!typeSlug || !slug) {
      setStatus('not_found');
      return;
    }
    setStatus('loading');
    getCatalogueMaterial(typeSlug, slug)
      .then(({ material: raw, category, prev, next }) => {
        if (!raw) {
          setStatus('not_found');
          return;
        }
        setMaterial(normalizeMaterial(raw));
        setCategoryInfo(category || raw.category || { slug: typeSlug, name: raw.type || raw.name });
        setAdjacent({ prev, next });
        setStatus('ready');
      })
      .catch((err) => {
        if (err?.status === 404) {
          setStatus('not_found');
        } else {
          setStatus('error');
        }
      });
  }, [typeSlug, slug]);

  useEffect(() => {
    setLightboxIndex(null);
    loadMaterial();
  }, [loadMaterial]);

  // Build unified list of photos (hero + gallery) for the lightbox
  const lightboxPhotos = React.useMemo(() => {
    if (!material) return [];
    const list = [];
    const mainSrc = material.hero || material.image;
    const fullTitle = `${material.name} ${material.variant || ''}`.trim();
    if (mainSrc) {
      list.push({
        src: mainSrc,
        alt: `${fullTitle} – vue d'ensemble`,
      });
    }
    if (Array.isArray(material.gallery)) {
      material.gallery.forEach((g, idx) => {
        if (g?.src) {
          list.push({
            src: g.src,
            alt: g.alt || `${fullTitle} – photo ${idx + 1}`,
          });
        }
      });
    }
    return list;
  }, [material]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight' && lightboxPhotos.length > 1) {
        setLightboxIndex((prevIdx) => (prevIdx + 1) % lightboxPhotos.length);
      } else if (e.key === 'ArrowLeft' && lightboxPhotos.length > 1) {
        setLightboxIndex((prevIdx) => (prevIdx - 1 + lightboxPhotos.length) % lightboxPhotos.length);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, lightboxPhotos.length]);

  useSeo(
    material
      ? {
          title: `${material.name} ${material.variant || ''} | ${categoryInfo?.name || 'Matériaux'} – SUTRAVOMAR`.trim(),
          description: material.description,
          path: materialPath(material),
          image: (material.hero || material.image)?.startsWith('http')
            ? material.hero || material.image
            : `${SITE_URL}${material.hero || material.image}`,
        }
      : status === 'not_found'
        ? { title: 'Matériau introuvable (404) | SUTRAVOMAR STONE LUXE', noindex: true }
        : { title: 'Nos matériaux | SUTRAVOMAR STONE LUXE' }
  );

  if (status === 'loading') {
    return (
      <main className="mx-hero" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center' }}>
        <LuxuryLoader size={80} minHeight="280px" />
      </main>
    );
  }

  if (status === 'not_found') {
    return <NotFoundPage />;
  }

  if (status === 'error' || !material) {
    return (
      <main className="mx-hero" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div className="wrap">
          <p style={{ color: '#fca5a5', marginBottom: '18px' }}>
            Impossible de charger la fiche du matériau depuis le serveur.
          </p>
          <button type="button" className="btn btn-ochre" onClick={loadMaterial}>
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const { prev, next } = adjacent;
  const heroSrc = material.hero || material.image;
  const parentSlug = categoryInfo?.slug || typeSlug;
  const parentName = categoryInfo?.name || material.type || 'matériaux';

  return (
    <main>
      <section className="mx-hero">
        <div className="wrap">
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
            <Link to="/detailsmateriaux" className="mx-back" style={{ marginBottom: 0 }}>
              Matériaux
            </Link>
            <span style={{ opacity: 0.4 }}>/</span>
            <Link to={`/detailsmateriaux/${parentSlug}`} className="mx-back" style={{ marginBottom: 0 }}>
              ← Toutes les variétés de {parentName}
            </Link>
          </div>
          <div className="mx-eyebrow">{material.type}</div>
          <h1>
            {material.name} {material.variant && <em>{material.variant}</em>}
          </h1>
        </div>
      </section>

      <section className="mx-body">
        <div className="wrap">
          {(heroSrc || material.fallbackGradient) && (
            <div
              className={`mx-detail-hero${heroSrc ? ' is-clickable' : ''}`}
              style={!heroSrc && material.fallbackGradient ? { background: material.fallbackGradient } : undefined}
              onClick={heroSrc ? () => setLightboxIndex(0) : undefined}
              role={heroSrc ? 'button' : undefined}
              tabIndex={heroSrc ? 0 : undefined}
              aria-label={heroSrc ? 'Agrandir la photo principale' : undefined}
              onKeyDown={
                heroSrc
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLightboxIndex(0);
                      }
                    }
                  : undefined
              }
            >
              {heroSrc && (
                <>
                  <img
                    src={heroSrc}
                    alt={`${material.name} ${material.variant || ''} – vue d'ensemble`.trim()}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (material.fallbackGradient) {
                        e.currentTarget.parentElement.style.background = material.fallbackGradient;
                      }
                    }}
                  />
                  <span className="mx-zoom-badge" aria-hidden="true">
                    ⤢ Agrandir
                  </span>
                </>
              )}
            </div>
          )}

          <div className="mx-detail-cols">
            <div>
              <h2 className="mx-h2">Présentation</h2>
              <p className="mx-lead">{material.description}</p>
              <div className="mx-cta" style={{ marginBottom: 0 }}>
                <Link to="/#devis" className="btn btn-ochre">
                  Demander un devis <span className="ar">→</span>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="mx-h2">Caractéristiques techniques</h2>
              <dl className="mx-specs">
                {SPEC_LABELS.filter(([key]) => {
                  const val = material.specs?.[key];
                  return Array.isArray(val) ? val.length > 0 : Boolean(val);
                }).map(([key, label]) => {
                  const value = material.specs[key];
                  return (
                    <div className="mx-specs-row" key={key}>
                      <dt>{label}</dt>
                      <dd>{Array.isArray(value) ? value.join(', ') : value}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          {material.gallery?.length > 0 && (
            <>
              <h2 className="mx-h2">Galerie</h2>
              <div className="mx-gallery">
                {material.gallery.map((g, idx) => {
                  const photoIdx = (heroSrc ? 1 : 0) + idx;
                  return (
                    <figure
                      className="mx-gallery-item is-clickable"
                      key={`${g.src}-${idx}`}
                      style={{ margin: 0 }}
                      onClick={() => setLightboxIndex(photoIdx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Agrandir la photo ${idx + 1} de la galerie`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setLightboxIndex(photoIdx);
                        }
                      }}
                    >
                      <img
                        src={g.src}
                        alt={g.alt || `${material.name} ${material.variant || ''} – photo ${idx + 1}`.trim()}
                        loading="lazy"
                      />
                      <span className="mx-zoom-badge" aria-hidden="true">
                        ⤢
                      </span>
                    </figure>
                  );
                })}
              </div>
            </>
          )}

          <nav className="mx-pager" aria-label={`Autres variétés de ${parentName}`}>
            {prev && (
              <Link to={`/detailsmateriaux/${parentSlug}/${prev.slug}`} className="prev">
                <small>← Variété précédente ({parentName})</small>
                <span>
                  {prev.name} {prev.variant}
                </span>
              </Link>
            )}
            {next && (
              <Link to={`/detailsmateriaux/${parentSlug}/${next.slug}`} className="next">
                <small>Variété suivante ({parentName}) →</small>
                <span>
                  {next.name} {next.variant}
                </span>
              </Link>
            )}
          </nav>

          <Link to={`/detailsmateriaux/${parentSlug}`} className="mx-back-bottom">
            ← Retour aux variétés de {parentName}
          </Link>
        </div>
      </section>

      {lightboxIndex !== null && lightboxPhotos[lightboxIndex] && (
        <div
          className="mx-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu de la photo en plein écran"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            className="mx-lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            aria-label="Fermer l'aperçu"
            title="Fermer (Échap)"
          >
            ✕
          </button>

          {lightboxPhotos.length > 1 && (
            <button
              type="button"
              className="mx-lightbox-nav prev"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length);
              }}
              aria-label="Photo précédente"
              title="Photo précédente (←)"
            >
              ‹
            </button>
          )}

          <figure className="mx-lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhotos[lightboxIndex].src}
              alt={lightboxPhotos[lightboxIndex].alt}
            />
            <figcaption className="mx-lightbox-caption">
              <span>{lightboxPhotos[lightboxIndex].alt}</span>
              {lightboxPhotos.length > 1 && (
                <small>
                  {lightboxIndex + 1} / {lightboxPhotos.length}
                </small>
              )}
            </figcaption>
          </figure>

          {lightboxPhotos.length > 1 && (
            <button
              type="button"
              className="mx-lightbox-nav next"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((lightboxIndex + 1) % lightboxPhotos.length);
              }}
              aria-label="Photo suivante"
              title="Photo suivante (→)"
            >
              ›
            </button>
          )}
        </div>
      )}
    </main>
  );
}
