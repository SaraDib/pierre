import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="big" aria-hidden="true">
          SUTRAVOMAR
        </div>

        <div className="fgrid">
          <div>
            <img
              src="/logo-gold.png"
              alt="SUTRAVOMAR STONE LUXE"
              className="footer-logo"
            />
            <h4>SUTRAVOMAR STONE LUXE</h4>
            <p style={{ maxWidth: '300px', fontSize: '14px' }}>
              Marbre, granit et pierre naturelle : sélection, taille, vente et pose partout au Maroc.
            </p>
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
              <li>+212 6 00 00 00 00</li>
              <li>contact@sutravomar-stone.ma</li>
              <li>Atelier & Showroom, Maroc</li>
              <li style={{ color: 'var(--ochre)' }}>Intervention dans tout le Maroc</li>
            </ul>
          </div>
        </div>

        <div className="fbot">
          <span>© 2026 SUTRAVOMAR STONE LUXE. Tous droits réservés.</span>
          <span>Marbre · Granit · Pierre naturelle</span>
        </div>
      </div>
    </footer>
  );
}
