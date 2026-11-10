import React from 'react';
import { Link } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { formatCompanyMediaUrl } from '../api/company';

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="footer-social-icon">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-social-icon">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const { company } = useCompany();
  const currentYear = new Date().getFullYear();

  const baseName = (company.name || 'SUTRAVOMAR').trim();
  const tagline = (company.tagline || 'STONE LUXE').trim();
  const fullBrandName = baseName.toUpperCase().includes('STONE LUXE')
    ? baseName
    : `${baseName} ${tagline}`.trim();

  const displayPhone =
    company.phone && !company.phone.includes('00 00 00')
      ? company.phone
      : '+212 6 12 34 56 78';

  const displayAddress =
    company.address && company.address !== 'Atelier & Showroom, Maroc'
      ? company.address
      : 'Taza, Maroc';

  const copyright = company.copyright && company.copyright.trim()
    ? company.copyright.replace(/\b20\d{2}\b/, currentYear)
    : `${fullBrandName} © ${currentYear}. Tous droits réservés.`;

  return (
    <footer className="compact">
      <div className="wrap">
        {/* ===== TOP ROW: brand | CTA button | contact + socials ===== */}
        <div className="footer-top">
          {/* Brand */}
          <Link to="/#accueil" className="footer-brand">
            <img
              src={formatCompanyMediaUrl(company.logo_footer_url || company.logo_url) || '/logo-gold.png'}
              alt={fullBrandName}
              className="footer-logo"
              onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
            />
            <div className="footer-brand-text">
              <div className="footer-brand-name">{fullBrandName}</div>
              <div className="footer-brand-tagline">{company.description && company.description.trim() ? company.description : 'Votre projet mérite le meilleur.'}</div>
            </div>
          </Link>

          {/* CTA button */}
          <Link to="/#devis" className="btn btn-ochre footer-cta-btn">
            <span>Demander un devis</span>
            <span className="ar">→</span>
          </Link>

          {/* Contact + socials */}
          <div className="footer-contact">
            {/* Phone */}
            <div className="footer-contact-item">
              <span className="footer-contact-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <div className="footer-contact-meta">
                <a href={`tel:${displayPhone.replace(/\s+/g, '')}`}>
                  {displayPhone}
                </a>
                <small>Disponible 7j/7</small>
              </div>
            </div>

            {/* Location */}
            <div className="footer-contact-item">
              <a
                className="footer-contact-icon-wrap"
                href={company.maps_url || undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Voir sur Google Maps"
                title="Voir sur Google Maps"
                style={company.maps_url ? undefined : { pointerEvents: 'none' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="footer-contact-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </a>
              <div className="footer-contact-meta">
                {company.maps_url ? (
                  <a href={company.maps_url} target="_blank" rel="noopener noreferrer">{displayAddress}</a>
                ) : (
                  <span>{displayAddress}</span>
                )}
                <small>Intervention nationale</small>
              </div>
            </div>

            {/* Socials logos */}
            <div className="footer-socials">
              <a
                href={company.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social-link"
              >
                <InstagramIcon />
              </a>

              <a
                href={company.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="footer-social-link"
              >
                <FacebookIcon />
              </a>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ROW: copyright | tagline ===== */}
        <div className="footer-bottom">
          <span>{copyright}</span>
          <span className="footer-signature">
            <span className="footer-sig-sep">|</span> Naturellement unique.
          </span>
        </div>
      </div>
    </footer>
  );
}
