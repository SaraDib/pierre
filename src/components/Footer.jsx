import React from 'react';
import { Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { formatCompanyMediaUrl } from '../api/company';

export default function Footer() {
  const { company } = useCompany();
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      <div className="wrap">
        <div className="big" aria-hidden="true">
          {company.name || 'SUTRAVOMAR'}
        </div>

        <div className="fgrid">
          <div>
            <img
              src={formatCompanyMediaUrl(company.logo_url) || '/logo-gold.png'}
              alt={`${company.name} ${company.tagline || ''}`}
              className="footer-logo"
              onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
            />
            <h4>{company.name} {company.tagline}</h4>
            <p style={{ maxWidth: '300px', fontSize: '14px', lineHeight: '1.6' }}>
              {company.description || 'Marbre, granit et pierre naturelle : sélection, taille, vente et pose partout au Maroc.'}
            </p>

            {/* Social links if configured */}
            {(company.instagram_url || company.facebook_url) && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                {company.instagram_url && (
                  <a
                    href={company.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    style={{ color: '#c5a059', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Instagram ↗
                  </a>
                )}
                {company.facebook_url && (
                  <a
                    href={company.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    style={{ color: '#c5a059', fontSize: '13px', textDecoration: 'none' }}
                  >
                    Facebook ↗
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/#savoir-faire">Savoir-faire</Link></li>
              <li><Link to="/#materiaux">Matériaux</Link></li>
              <li><Link to="/#realisations">Réalisations</Link></li>
              <li><Link to="/#methode">Méthode</Link></li>
              <li><Link to="/#faq">FAQ</Link></li>
              <li><Link to="/#devis">Devis gratuit</Link></li>
            </ul>
          </div>

          <div>
            <h4>Matériaux d'exception</h4>
            <ul>
              <li><Link to="/#materiaux">Pierre de Taza</Link></li>
              <li><Link to="/#materiaux">Marbre Calacatta & Carrare</Link></li>
              <li><Link to="/#materiaux">Granit noir absolu</Link></li>
              <li><Link to="/#materiaux">Travertin romain</Link></li>
              <li><Link to="/#materiaux">Ardoise naturelle</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact & Chantiers</h4>
            <ul>
              {company.phone && (
                <li>
                  <a href={`tel:${company.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {company.phone}
                  </a>
                </li>
              )}
              {company.phone_secondary && (
                <li style={{ color: '#a0988c' }}>{company.phone_secondary}</li>
              )}
              {company.email && (
                <li>
                  <a href={`mailto:${company.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {company.email}
                  </a>
                </li>
              )}
              {company.address && <li>{company.address}</li>}
              {company.opening_hours && (
                <li style={{ fontSize: '12px', color: '#a0988c' }}>{company.opening_hours}</li>
              )}
              {company.intervention_zone && (
                <li style={{ color: 'var(--ochre)' }}>{company.intervention_zone}</li>
              )}
            </ul>
          </div>
        </div>

        <div className="fbot">
          <span>
            {company.copyright
              ? company.copyright.replace(/\b20\d{2}\b/, currentYear)
              : `© ${currentYear} ${company.name || 'SUTRAVOMAR'}. Tous droits réservés.`}
          </span>
          <span>{company.name} · {company.tagline || 'Marbre · Granit · Pierre naturelle'}</span>
        </div>
      </div>
    </footer>
  );
}
