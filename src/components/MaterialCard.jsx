import React from 'react';
import { Link } from 'react-router-dom';
import { materialPath } from '../data/useMaterials';

/**
 * Carte matériau unique, utilisée dans le carrousel de l'accueil ET dans la grille /detailsmateriaux.
 * Toute la mise en forme (ratio, rayon, dégradé, typographie, survol) vient de `.material-card`
 * dans index.css : une nouvelle entrée de `materials` donne automatiquement une carte identique.
 *
 * @param {object} material  entrée du tableau `materials`
 * @param {'carousel'|'grid'} [layout] contexte (ne change que la largeur de la carte)
 */
export default function MaterialCard({ material, layout = 'carousel' }) {
  return (
    <Link
      to={materialPath(material)}
      className={`material-card material-card--${layout}`}
      title={`${material.name} · ${material.variant}`}
      aria-label={`${material.name} ${material.variant} – voir le matériau`}
    >
      <img
        src={material.image}
        alt={`Texture ${material.name} ${material.variant}`}
        className="material-card__img"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          if (material.fallbackGradient) e.currentTarget.parentElement.style.background = material.fallbackGradient;
        }}
      />
      <span className="material-card__overlay" aria-hidden="true" />
      <span className="material-card__caption">
        <b className="material-card__name">{material.name}</b>
        <span className="material-card__variant">{material.variant}</span>
      </span>
    </Link>
  );
}

