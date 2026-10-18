import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { formatCompanyMediaUrl } from '../api/company';

export default function Header() {
  const { company } = useCompany();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleNavClick = (anchorId) => {
    closeMenu();
    if (location.pathname === '/') {
      const elem = document.querySelector(anchorId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`${scrolled ? 's' : ''} ${menuOpen ? 'menu-open' : ''}`} id="hd">
      <div className="wrap nav">
        <Link to="/#accueil" className="logo" aria-label={`${company.name} ${company.tagline || ''}`} onClick={() => handleNavClick('#accueil')}>
          <img
            src={formatCompanyMediaUrl(company.logo_url) || "/logo-gold.png"}
            alt={`${company.name} ${company.tagline || ''}`}
            className="logo-img"
            onError={(e) => { e.currentTarget.src = '/logo-gold.png'; }}
          />
          <span className="logo-text">
            <span className="logo-name">{company.name}</span>
            {company.tagline && <span className="logo-tagline">{company.tagline}</span>}
          </span>
        </Link>

        <nav id="nav" className={menuOpen ? 'o' : ''}>
          <ul>
            <li>
              <Link to="/#accueil" onClick={() => handleNavClick('#accueil')}>
                Accueil
              </Link>
            </li>
            <li>
              <Link to="/#savoir-faire" onClick={() => handleNavClick('#savoir-faire')}>
                Savoir-faire
              </Link>
            </li>
            <li>
              <Link to="/#materiaux" onClick={() => handleNavClick('#materiaux')}>
                Matériaux
              </Link>
            </li>
            <li>
              <Link to="/#realisations" onClick={() => handleNavClick('#realisations')}>
                Réalisations
              </Link>
            </li>
            <li>
              <Link to="/#methode" onClick={() => handleNavClick('#methode')}>
                Méthode
              </Link>
            </li>
            <li>
              <Link to="/#faq" onClick={() => handleNavClick('#faq')}>
                FAQ
              </Link>
            </li>
          </ul>
        </nav>

        <Link to="/#devis" className="btn btn-ochre" onClick={() => handleNavClick('#devis')}>
          Devis gratuit <span className="ar">→</span>
        </Link>

        <button
          className={`burger ${menuOpen ? 'o' : ''}`}
          id="bg"
          aria-label="Menu"
          onClick={toggleMenu}
        >
          <i />
          <i />
        </button>
      </div>
    </header>
  );
}
