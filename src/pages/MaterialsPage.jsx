import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MaterialCard from '../components/MaterialCard';
import LuxuryLoader from '../components/LuxuryLoader';
import { useMaterials, getMaterialTypes } from '../data/useMaterials';
import { useSeo } from '../seo/useSeo';
import './MaterialsPages.css';

export default function MaterialsPage() {
  const [filter, setFilter] = useState('all');
  const { materials, section, loading, error, reload } = useMaterials();
  const materialTypes = getMaterialTypes(materials);

  useSeo({
    title: 'Nos Matériaux | Marbre, Granit, Onyx, Travertin & Pierre naturelle – SUTRAVOMAR',
    description:
      section?.description ||
      'Découvrez notre sélection de matériaux nobles : marbre Calacatta, granit Noir Absolu, pierre naturelle, onyx et travertin. Fiches techniques et devis sur mesure.',
    path: '/detailsmateriaux',
  });

  const visible = filter === 'all' ? materials : materials.filter((m) => m.type === filter);

  return (
    <main>
      <section className="mx-hero">
        <div className="wrap">
          <div className="mx-eyebrow">{section?.eyebrow || 'NOS MATÉRIAUX'}</div>
          <h1>
            {section?.title || 'Nos matériaux'}{' '}
            {section?.title_em && <em>{section.title_em}</em>}
          </h1>
          <p>
            {section?.description ||
              'Marbre, granit, pierre naturelle, onyx, travertin… Des matériaux nobles, soigneusement sélectionnés pour leur beauté, leur résistance et leur durabilité. Choisissez une pierre pour découvrir sa fiche détaillée.'}
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
              <div className="mx-tabs" role="tablist" aria-label="Filtrer par type de matériau">
                {['all', ...materialTypes].map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={filter === t}
                    className={`mx-tab ${filter === t ? 'active' : ''}`}
                    onClick={() => setFilter(t)}
                  >
                    {t === 'all' ? 'Tous' : t}
                  </button>
                ))}
              </div>

              {visible.length ? (
                <div className="mx-grid">
                  {visible.map((m) => (
                    <MaterialCard key={m.id || m.slug} material={m} layout="grid" />
                  ))}
                </div>
              ) : (
                <p className="mx-empty">Aucun matériau dans cette catégorie.</p>
              )}
            </>
          )}

          <div className="mx-cta" style={{ marginTop: 56, marginBottom: 0 }}>
            <Link to="/#devis" className="btn btn-ochre">
              Demander un devis <span className="ar">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
