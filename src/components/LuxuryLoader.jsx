import React from 'react';
import { useCompany } from '../context/CompanyContext';
import { formatCompanyMediaUrl } from '../api/company';

/**
 * LuxuryLoader - Anneau d'or fin minimaliste tournant autour du logo de l'entreprise
 * Logo synchronisé en temps réel avec la base de données via CompanyContext.
 */
export default function LuxuryLoader({
  size = 64,
  fullScreen = false,
  minHeight = '180px',
  style = {}
}) {
  const { company } = useCompany();
  const logoUrl = formatCompanyMediaUrl(company?.logo_url) || '/logo-gold.png';

  // Proportions calculées
  const ringSize = size;
  const logoSize = Math.round(size * 0.52);

  const content = (
    <div
      style={{
        position: 'relative',
        width: `${ringSize}px`,
        height: `${ringSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Anneau de fond subtil (orbite minérale) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid rgba(197, 160, 89, 0.14)',
          boxSizing: 'border-box'
        }}
      />

      {/* Anneau doré fin en rotation continue */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1.5px solid transparent',
          borderTopColor: '#c5a059',
          borderRightColor: 'rgba(197, 160, 89, 0.55)',
          boxSizing: 'border-box',
          animation: 'spinLuxuryRing 1.1s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite'
        }}
      />

      {/* Deuxième anneau intérieur à contre-sens très discret pour effet haute joaillerie */}
      <div
        style={{
          position: 'absolute',
          inset: '3px',
          borderRadius: '50%',
          border: '1px solid transparent',
          borderBottomColor: 'rgba(197, 160, 89, 0.35)',
          boxSizing: 'border-box',
          animation: 'spinLuxuryRingReverse 2s linear infinite'
        }}
      />

      {/* Logo officiel centré depuis la base de données */}
      <div
        style={{
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulseLuxuryLogo 2.4s ease-in-out infinite'
        }}
      >
        <img
          src={logoUrl}
          alt={company?.name || 'Sutravomar'}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(197, 160, 89, 0.3))'
          }}
          onError={(e) => {
            e.currentTarget.src = '/logo-gold.png';
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      role="status"
      aria-label="Chargement"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullScreen ? '60vh' : minHeight,
        width: '100%',
        animation: 'fadeLuxuryIn 0.35s ease-out forwards',
        ...style
      }}
    >
      {content}

      <style>{`
        @keyframes spinLuxuryRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinLuxuryRingReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseLuxuryLogo {
          0%, 100% { transform: scale(0.96); opacity: 0.9; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes fadeLuxuryIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
