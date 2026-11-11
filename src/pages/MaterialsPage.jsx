import React from 'react';
import { Link } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import LuxuryLoader from '../components/LuxuryLoader';
import { useMaterials, categoryPath } from '../data/useMaterials';
import { useSeo } from '../seo/useSeo';
import './MaterialsPages.css';

export default function MaterialsPage() {
  const { categories, materials, section, loading, error, reload } = useMaterials();

  useSeo({
    title: 'Nos Matériaux | Marbre, Granit, Onyx, Travertin & Pierre naturelle – SUTRAVOMAR',
    description:
      section?.description ||
      'Découvrez nos familles de matériaux nobles : marbre, granit, pierre naturelle, onyx et travertin. Choisissez un type de pierre pour explorer toutes ses variétés.',
    path: '/detailsmateriaux',
  });

  const displayList = categories.length > 0 ? categories : materials;

  return (
    <main>
      <section className="mx-hero">
        <div className="wrap">
          <Link to="/" className="mx-back">
            ← Retour à l'accueil
          </Link>
          <div className="mx-eyebrow">{section?.eyebrow || 'NOS MATÉRIAUX'}</div>
          <h1>
            {section?.title || 'Nos matériaux'}{' '}
            {section?.title_em && <em>{section.title_em}</em>}
          </h1>
          <p>
            {section?.description ||
              'Marbre, granit, pierre naturelle, onyx, travertin… Sélectionnez une famille de pierre pour découvrir toutes ses variétés et consulter leurs fiches techniques.'}
          </p>
        </div>
      </section>

      <section className="mx-body">
        <div className="wrap">
          {loading ? (
            <LuxuryLoader size={70} minHeight="280px" />
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p className="mx-empty" style={{ marginBottom: '16px' }}>{error}</p>
              <button type="button" className="btn btn-ochre" onClick={reload}>
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div className="mx-tabs" role="navigation" aria-label="Accès rapide par type de matériau">
                  <span className="mx-tab active">Tous les types ({categories.length})</span>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id || cat.slug}
                      to={categoryPath(cat)}
                      className="mx-tab"
                      style={{ textDecoration: 'none' }}
                    >
                      {cat.name} ({cat.materials_count || 0})
                    </Link>
                  ))}
                </div>
              )}

              {displayList.length ? (
                <div className="mx-grid">
                  {displayList.map((item) => (
                    <MaterialCard
                      key={`${item.isCategory ? 'cat' : 'mat'}-${item.id || item.slug}`}
                      material={item}
                      layout="grid"
                    />
                  ))}
                </div>
              ) : (
                <p className="mx-empty">Aucun matériau disponible pour le moment.</p>
              )}
            </>
          )}

          <div className="mx-cta" style={{ marginTop: 56, marginBottom: 24 }}>
            <Link to="/#devis" className="btn btn-ochre">
              Demander un devis <span className="ar">→</span>
            </Link>
          </div>

          <Link to="/" className="mx-back-bottom">
            ← Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
