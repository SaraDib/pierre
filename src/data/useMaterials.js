import { useCallback, useEffect, useState } from 'react';
import { getCatalogueCategories, getCatalogueMateriaux } from '../api/catalogue';
import { formatMediaUrl } from '../api/acceuil';

export const normalizeCategory = (c) => {
  if (!c) return null;
  return {
    ...c,
    isCategory: true,
    variant: c.display_subtitle || c.subtitle || `${c.materials_count || 0} variétés`,
    image: formatMediaUrl(c.image),
    hero: c.hero ? formatMediaUrl(c.hero) : null,
  };
};

export const normalizeMaterial = (m) => {
  if (!m) return null;
  return {
    ...m,
    image: formatMediaUrl(m.image),
    hero: m.hero ? formatMediaUrl(m.hero) : null,
    gallery: (m.gallery || []).map((g) => ({ ...g, src: formatMediaUrl(g.src) })),
    specs: {
      origin: m.specs?.origin || m.origin || '',
      finish: m.specs?.finish || m.finish || '',
      thickness: m.specs?.thickness || m.thickness || '',
      uses: Array.isArray(m.specs?.uses) ? m.specs.uses : Array.isArray(m.uses) ? m.uses : [],
      maintenance: m.specs?.maintenance || m.maintenance || '',
    },
  };
};

/**
 * Hook de chargement des types de matériaux (/api/catalogue-categories) et des variétés (/api/catalogue-materiaux).
 */
export function useMaterials() {
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return Promise.all([getCatalogueCategories(), getCatalogueMateriaux()])
      .then(([catRes, matRes]) => {
        setCategories((catRes.items || []).map(normalizeCategory));
        setMaterials((matRes.items || []).map(normalizeMaterial));
        if (catRes.section || matRes.section) {
          setSection(catRes.section || matRes.section);
        }
      })
      .catch((err) => {
        setError(err.message || 'Échec du chargement des matériaux');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, materials, section, loading, error, reload: load };
}

/** Chemin de la page d'un type de matériau (ex: /detailsmateriaux/marbre) */
export const categoryPath = (category) => `/detailsmateriaux/${category.slug}`;

/** Chemin de la fiche détail d'une variété (ex: /detailsmateriaux/marbre/marbre-calacatta) */
export const materialPath = (material) => {
  if (!material) return '/detailsmateriaux';
  if (material.isCategory) return categoryPath(material);
  const catSlug = material.category?.slug || material.category_slug;
  return catSlug
    ? `/detailsmateriaux/${catSlug}/${material.slug}`
    : `/detailsmateriaux/${material.slug}`;
};

export const getMaterialBySlug = (list, slug) => list.find((m) => m.slug === slug) || null;

/** Types uniques, dans l'ordre d'apparition (onglets de filtre) */
export const getMaterialTypes = (list) => [...new Set(list.map((m) => m.type).filter(Boolean))];

/** Matériau précédent / suivant (navigation circulaire) */
export function getAdjacentMaterials(list, slug) {
  const i = list.findIndex((m) => m.slug === slug);
  if (i === -1 || list.length === 0) return { prev: null, next: null };
  return {
    prev: list[(i - 1 + list.length) % list.length],
    next: list[(i + 1) % list.length],
  };
}
