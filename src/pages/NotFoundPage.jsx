import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import { useSeo } from '../seo/useSeo';

export default function NotFoundPage() {
  useSeo({
    title: 'Page introuvable (404) | SUTRAVOMAR STONE LUXE',
    description: 'La page demandée est introuvable ou a été déplacée.',
    noindex: true,
  });

  return (
    <main
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 20px 80px',
        position: 'relative',
        background: 'radial-gradient(ellipse at top, #1c1916 0%, #11100f 70%)',
        color: '#f7f3ea',
      }}
    >
      <div
        style={{
          maxWidth: '620px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(90px, 15vw, 150px)',
            fontWeight: 400,
            lineHeight: 1,
            display: 'block',
            background: 'linear-gradient(135deg, #c9a96e 0%, #ede5d8 50%, #8c7343 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
            marginBottom: '10px',
          }}
        >
          404
        </span>

        <div
          style={{
            display: 'inline-block',
            padding: '4px 16px',
            border: '1px solid rgba(201, 169, 110, 0.3)',
            borderRadius: '999px',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#c9a96e',
            marginBottom: '24px',
          }}
        >
          Bloc introuvable
        </div>

        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(24px, 4vw, 34px)',
            fontWeight: 400,
            marginBottom: '16px',
            color: '#f7f3ea',
          }}
        >
          Cette page n’a pas été sculptée dans notre atelier.
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#b0a89c',
            lineHeight: 1.7,
            maxWidth: '500px',
            margin: '0 auto 36px',
          }}
        >
          Le lien que vous avez suivi est peut-être erroné, ou la réalisation recherchée a été déplacée. Nous vous invitons à regagner l'accueil ou à explorer notre portfolio d'exception.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/"
            className="btn btn-ochre"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 26px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '0.06em',
            }}
          >
            <Home size={15} />
            Retour à l'accueil
          </Link>

          <Link
            to="/realisations"
            className="btn btn-line"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '13px 24px',
              textDecoration: 'none',
              fontSize: '13px',
              letterSpacing: '0.06em',
            }}
          >
            <Compass size={15} />
            Explorer nos réalisations
          </Link>
        </div>
      </div>
    </main>
  );
}
