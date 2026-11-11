import React, { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  getCatalogueCategory,
  getCatalogueCategories,
  getCatalogueMaterialBySlug,
} from '../api/catalogue';
import {
  normalizeCategory,
  normalizeMaterial,
  categoryPath,
  materialPath,
} from '../data/useMaterials';
import MaterialCard from '../components/MaterialCard';
import LuxuryLoader from '../components/LuxuryLoader';
import { useSeo } from '../seo/useSeo';
import NotFoundPage from './NotFoundPage';
import './MaterialsPages.css';

export default function MaterialTypePage() {
  const { typeSlug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [varieties, setVarieties] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [adjacent, setAdjacent] = useState({ prev: null, next: null });
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'not_found' | 'error'

  const loadType = useCallback(() => {
    if (!typeSlug) {
      setStatus('not_found');
      return;
    }
    setStatus('loading');

    getCatalogueCategories()
      .then(({ items }) => setAllCategories((items || []).map(normalizeCategory)))
      .catch(() => {});

    getCatalogueCategory(typeSlug)
      .then(({ category: rawCat, materials: rawMats, prev, next }) => {
        if (!rawCat) {
          setStatus('not_found');
          return;
        }
        setCategory(normalizeCategory(rawCat));
        setVarieties((rawMats || []).map(normalizeMaterial));
        setAdjacent({ prev, next });
        setStatus('ready');
      })
      .catch((err) => {
        if (err?.status === 404) {
          // Compatibilité descendante : si l'URL est un ancien slug de variété (/detailsmateriaux/marbre-calacatta),
          // redirige automatiquement vers /detailsmateriaux/{typeSlug}/{slug}
          getCatalogueMaterialBySlug(typeSlug)
            .then(({ material }) => {
              const catSlug = material?.category?.slug;
              if (catSlug && material?.slug) {
                navigate(`/detailsmateriaux/${catSlug}/${material.slug}`, { replace: true });
              } else {
                setStatus('not_found');
              }
            })
            .catch(() => setStatus('not_found'));
        } else {
          setStatus('error');
        }
      });
  }, [typeSlug, navigate]);

  useEffect(() => {
    loadType();
  }, [loadType]);

  useSeo(
    category
      ? {
          title: `${category.name} — Toutes nos variétés | SUTRAVOMAR STONE LUXE`,
          description:
            category.description ||
            `Découvrez toutes nos variétés de ${category.name} : textures, origines, finitions et fiches techniques détaillées.`,
          path: categoryPath(category),
        }
      : status === 'not_found'
        ? { title: 'Type de matériau introuvable (404) | SUTRAVOMAR', noindex: true }
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

  if (status === 'error' || !category) {
    return (
      <main className="mx-hero" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div className="wrap">
          <p style={{ color: '#fca5a5', marginBottom: '18px' }}>
            Impossible de charger les variétés de ce matériau pour le moment.
          </p>
          <button type="button" className="btn btn-ochre" onClick={loadType}>
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const { prev, next } = adjacent;

  return (
    <main>
      <section className="mx-hero">
        <div className="wrap">
          <Link to="/detailsmateriaux" className="mx-back">
            ← Tous les types de matériaux
          </Link>
          <div className="mx-eyebrow">
            COLLECTION · {varieties.length} {varieties.length > 1 ? 'VARIÉTÉS DISPONIBLES' : 'VARIÉTÉ DISPONIBLE'}
          </div>
          <h1>{category.name}</h1>
          <p>
            {category.description ||
              `Sélectionnez une variété de ${category.name.toLowerCase()} ci-dessous pour consulter sa fiche technique complète, ses finitions et ses applications.`}
          </p>
        </div>
      </section>

      <section className="mx-body">
        <div className="wrap">
          {allCategories.length > 1 && (
            <div className="mx-tabs" role="navigation" aria-label="Changer de type de matériau">
              <Link to="/detailsmateriaux" className="mx-tab" style={{ textDecoration: 'none' }}>
                Tous les types
              </Link>
              {allCategories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={categoryPath(cat)}
                  className={`mx-tab ${cat.slug === category.slug ? 'active' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  {cat.name} ({cat.materials_count || 0})
                </Link>
              ))}
            </div>
          )}

          {varieties.length > 0 ? (
            <div className="mx-grid">
              {varieties.map((m) => (
                <MaterialCard
                  key={m.id || m.slug}
                  material={{
                    ...m,
                    name: m.variant || m.name,
                    variant: m.variant ? m.name : '',
                  }}
                  to={materialPath({
                    ...m,
                    category: m.category || { slug: category.slug, name: category.name },
                  })}
                  layout="grid"
                />
              ))}
            </div>
          ) : (
            <p className="mx-empty">Aucune variété disponible dans cette catégorie pour le moment.</p>
          )}

          <nav className="mx-pager" aria-label="Navigation entre types de matériaux">
            {prev && (
              <Link to={`/detailsmateriaux/${prev.slug}`} className="prev">
                <small>← Type précédent</small>
                <span>{prev.name}</span>
              </Link>
            )}
            {next && (
              <Link to={`/detailsmateriaux/${next.slug}`} className="next">
                <small>Type suivant →</small>
                <span>{next.name}</span>
              </Link>
            )}
          </nav>

          <div className="mx-cta" style={{ marginTop: 40, marginBottom: 24 }}>
            <Link to="/#devis" className="btn btn-ochre">
              Demander un devis <span className="ar">→</span>
            </Link>
          </div>

          <Link to="/detailsmateriaux" className="mx-back-bottom">
            ← Retour aux types de matériaux
          </Link>
        </div>
      </section>
    </main>
  );
}

