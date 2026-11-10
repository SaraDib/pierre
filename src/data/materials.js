/**
 * Point d'entrée des helpers matériaux.
 * Toutes les données des matériaux sont désormais chargées dynamiquement depuis le backend
 * (/api/catalogue-materiaux et /api/catalogue-materiaux/:slug) et administrées depuis
 * le tableau de bord Admin.
 */
export {
  useMaterials,
  normalizeMaterial,
  materialPath,
  getMaterialBySlug,
  getMaterialTypes,
  getAdjacentMaterials,
} from './useMaterials';
