import React from 'react';
import { Link } from 'react-router-dom';
import { materialPath } from '../data/useMaterials';

/**
 * Carte matériau unique, utilisée dans le carrousel de l'accueil, la grille des types (/detailsmateriaux)
 * ET la grille des variétés d'un type (/detailsmateriaux/:typeSlug).
 */
export default function MaterialCard({ material, layout = 'carousel', to }) {
  const href = to || materialPath(material);
  const subtitle = material.display_subtitle || material.variant || '';

  return (
    <Link
      to={href}
      className={`material-card material-card--${layout}`}
      title={`${material.name}${subtitle ? ` · ${subtitle}` : ''}`}
      aria-label={`${material.name} ${subtitle} – voir le matériau`.trim()}
      style={
        !material.image && material.fallbackGradient
          ? { background: material.fallbackGradient }
          : undefined
      }
    >
      {material.image && (
        <img
          src={material.image}
          alt={`Texture ${material.name} ${subtitle}`.trim()}
          className="material-card__img"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (material.fallbackGradient) {
              e.currentTarget.parentElement.style.background = material.fallbackGradient;
            }
          }}
        />
      )}
      <span className="material-card__overlay" aria-hidden="true" />
      <span className="material-card__caption">
        <b className="material-card__name">{material.name}</b>
        {subtitle && <span className="material-card__variant">{subtitle}</span>}
      </span>
    </Link>
  );
}
