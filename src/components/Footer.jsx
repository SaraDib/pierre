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

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-social-icon">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .67.06.97.17V9.32a6.34 6.34 0 0 0-.97-.08 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.06a8.28 8.28 0 0 0 4.76 1.5V7.11a4.83 4.83 0 0 1-1-.42z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="footer-social-icon">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#0d0c0b" />
    </svg>
  );
}

export default function Footer() {
  const { company } = useCompany();
  const currentYear = new Date().getFullYear();

  const copyright = company.copyright
    ? company.copyright.replace(/\b20\d{2}\b/, currentYear)
    : `SUTRAVOMAR STONE LUXE © ${currentYear}. Tous droits réservés.`;

  return (
    <footer className="compact">
      <div className="wrap">
        {/* ===== TOP ROW: brand | CTA button | contact ===== */}
        <div className="footer-top">
          {/* Brand */}
          <div className="footer-brand">
            <img
              src={formatCompanyMediaUrl(company.logo_url) || '/logo-gold.png'}
              alt={`${company.name} ${company.tagline || ''}`}
              className="footer-logo"
              onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
            />
            <div className="footer-brand-text">
              <div className="footer-brand-name">{company.name || 'SUTRAVOMAR STONE LUXE'}</div>
              <div className="footer-brand-tagline">Votre projet mérite le meilleur.</div>
            </div>
          </div>

          {/* CTA button */}
          <Link to="/#devis" className="btn btn-ochre footer-cta-btn">
            Demander un devis <span className="ar">→</span>
          </Link>

          {/* Contact + socials */}
          <div className="footer-contact">
            {/* Phone */}
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="footer-contact-icon">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <a href={`tel:${(company.phone || '+212 6 12 34 56 78').replace(/\s+/g, '')}`}>
                  {company.phone || '+212 6 12 34 56 78'}
                </a>
                <small>Disponible 7j/7</small>
              </div>
            </div>

            {/* Location */}
            <div className="footer-contact-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="footer-contact-icon">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <div>
                <span>{company.address || 'Taza, Maroc'}</span>
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

              <a
                href={company.tiktok_url || 'https://tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="footer-social-link"
              >
                <TikTokIcon />
              </a>

              <a
                href={company.youtube_url || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="footer-social-link"
              >
                <YouTubeIcon />
              </a>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ROW: copyright | tagline ===== */}
        <div className="footer-bottom">
          <span>{copyright}</span>
          <span className="footer-signature">| Naturellement unique.</span>
        </div>
      </div>
    </footer>
  );
}
