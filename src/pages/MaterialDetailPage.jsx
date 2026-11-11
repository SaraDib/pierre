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
    loadMaterial();
  }, [loadMaterial]);

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
              className="mx-detail-hero"
              style={!heroSrc && material.fallbackGradient ? { background: material.fallbackGradient } : undefined}
            >
              {heroSrc && (
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
                {material.gallery.map((g, idx) => (
                  <figure className="mx-gallery-item" key={`${g.src}-${idx}`} style={{ margin: 0 }}>
                    <img
                      src={g.src}
                      alt={g.alt || `${material.name} ${material.variant || ''} – photo ${idx + 1}`.trim()}
                      loading="lazy"
                    />
                  </figure>
                ))}
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
    </main>
  );
}
