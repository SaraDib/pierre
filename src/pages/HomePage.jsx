import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import StoneTexture from '../components/StoneTexture';
import { getAcceuilContent, formatMediaUrl } from '../api/acceuil';
import {
  MATERIALS_DATA,
  ALL_MATERIALS_DATA,
  EXPERTISE_LAYERS,
  REALISATIONS_DATA,
  FAQ_DATA,
  MARQUEE_WORDS,
  WHATSAPP_PHONE
} from '../data/content';

export default function HomePage() {
  // Contenu d'accueil dynamique (depuis la table acceuil)
  const [homeContent, setHomeContent] = useState({
    eyebrow: 'Marbre · Granit · Pierre naturelle — Maroc',
    title_line1: 'La pierre,',
    title_line2: 'taillée',
    title_line3: 'pour durer.',
    description: 'SUTRAVOMAR STONE LUXE sélectionne, façonne et pose des pierres nobles pour vos façades, escaliers, cuisines, piscines et espaces extérieurs. Du bloc brut à la finition parfaite.',
    video_url: '/videos/logo-reveal.mp4',
    arch_badge: 'Collection',
    arch_title: 'Beige de Taza, poli',
    arch_material: 'travertin',
    arch_image: null,
    stat1_number: '30+',
    stat1_label: 'Variétés de pierres',
    stat2_number: '100%',
    stat2_label: 'Sur mesure',
    stat3_number: 'Maroc',
    stat3_label: 'Livraison & pose',
    marquee_words: MARQUEE_WORDS
  });

  useEffect(() => {
    getAcceuilContent().then((data) => {
      if (data) {
        setHomeContent((prev) => ({ ...prev, ...data }));
      }
    });
  }, []);
  // Matériaux interactifs
  const [currentMatIndex, setCurrentMatIndex] = useState(0);
  const [currentFinIndex, setCurrentFinIndex] = useState(0);
  const [slabFading, setSlabFading] = useState(false);
  const [slabRevealed, setSlabRevealed] = useState(false);

  // FAQ accordéon
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Formulaire Devis
  const [formData, setFormData] = useState({
    nm: '',
    tl: '',
    tp: 'Façade',
    ms: ''
  });

  // Strate de progression latérale
  const [currentSectionLabel, setCurrentSectionLabel] = useState('Strate 01 — Accueil');
  const [railProgress, setRailProgress] = useState(0);

  // Vidéo ready
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  // Animation compteurs
  const [counts, setCounts] = useState({ varieties: 0, custom: 0 });
  const countsAnimated = useRef(false);

  // Initialisation et lecture fluide de la vidéo Hero
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setVideoReady(true))
          .catch(() => setVideoReady(true));
      } else {
        setVideoReady(true);
      }
    }
  }, [homeContent.video_url]);

  // Défilement fluide vers ancres si URL avec hash
  useEffect(() => {
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, []);

  // IntersectionObserver pour les sections, reveals et compteurs
  useEffect(() => {
    // Reveal animation
    const reveals = document.querySelectorAll('.rv');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            entry.target.setAttribute('data-in', 'true');
            if (entry.target.id === 'slab') {
              setSlabRevealed(true);
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));

    // Strate rail tracker
    const sections = Array.from(document.querySelectorAll('section[data-label]'));
    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.indexOf(entry.target);
            if (index !== -1) {
              const label = entry.target.getAttribute('data-label');
              setCurrentSectionLabel(`Strate 0${index + 1} — ${label}`);
              setRailProgress((index / (sections.length - 1)) * 100);
            }
          }
        });
      },
      { threshold: 0.45 }
    );
    sections.forEach((s) => so.observe(s));

    // Compteurs de stats
    const statsElem = document.querySelector('.stats');
    if (statsElem) {
      const co = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !countsAnimated.current) {
              countsAnimated.current = true;
              co.unobserve(entry.target);
              const duration = 1400;
              const start = performance.now();

              const animate = (time) => {
                const progress = Math.min((time - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCounts({
                  varieties: Math.round(30 * eased),
                  custom: Math.round(100 * eased)
                });
                if (progress < 1) requestAnimationFrame(animate);
              };
              requestAnimationFrame(animate);
            }
          });
        },
        { threshold: 0.5 }
      );
      co.observe(statsElem);
    }

    return () => {
      io.disconnect();
      so.disconnect();
    };
  }, []);

  const handleSelectMaterial = (index) => {
    setSlabFading(true);
    setTimeout(() => {
      setCurrentMatIndex(index);
      setCurrentFinIndex(0);
      setSlabFading(false);
    }, 220);
  };

  const handleSelectFinish = (fIndex) => {
    setSlabFading(true);
    setTimeout(() => {
      setCurrentFinIndex(fIndex);
      setSlabFading(false);
    }, 220);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const text = `Bonjour SUTRAVOMAR STONE LUXE,\nJe souhaite un devis.\nNom : ${formData.nm}\nTéléphone : ${formData.tl}\nProjet : ${formData.tp}\nMessage : ${formData.ms}`;
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const currentMat = MATERIALS_DATA[currentMatIndex] || MATERIALS_DATA[0];
  const activeFinish = currentMat?.f?.[currentFinIndex] || currentMat?.f?.[0] || '';
  const isPoli = activeFinish === 'Poli';

  return (
    <>
      {/* Rail latéral minéral */}
      <div className="rail" aria-hidden="true">
        <span id="railTxt">{currentSectionLabel}</span>
        <i id="railBar" style={{ '--p': `${railProgress}%` }} />
      </div>

      <main>
        {/* ===== HERO SECTION ===== */}
        <section className="hero" id="accueil" data-label="Accueil">
          <video
            key={formatMediaUrl(homeContent.video_url)}
            ref={videoRef}
            className={`hero-video ${videoReady ? 'ready' : ''}`}
            id="heroVideo"
            src={formatMediaUrl(homeContent.video_url) || "/videos/logo-reveal.mp4"}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex="-1"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
            onPlay={() => setVideoReady(true)}
          />

          <svg className="strata-lines" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
            <g fill="none" stroke="#efe8db" strokeWidth=".6">
              <path d="M0 220 C300 180 500 280 800 230 S1250 160 1440 210" />
              <path d="M0 330 C260 300 560 390 820 340 S1260 280 1440 320" />
              <path d="M0 450 C300 420 520 510 860 460 S1240 400 1440 440" />
              <path d="M0 580 C280 550 560 640 840 590 S1250 530 1440 570" />
              <path d="M0 710 C300 680 540 770 860 720 S1240 660 1440 700" />
            </g>
          </svg>

          <div className="wrap hero-grid">
            <div>
              <div className="eyebrow rv">{homeContent.eyebrow}</div>
              <h1 className="rv d1" style={{ marginTop: '28px' }}>
                <span>{homeContent.title_line1}</span>
                <span className="l2"><em>{homeContent.title_line2}</em></span>
                <span>{homeContent.title_line3}</span>
              </h1>
              <p className="lead rv d2">
                {homeContent.description}
              </p>

              <div className="hero-actions rv d3">
                <Link to="/realisations" className="btn btn-ochre">
                  Voir nos réalisations <span className="ar">→</span>
                </Link>
                <a href="#devis" className="btn btn-line">
                  Demander un devis
                </a>
              </div>

              <div className="stats rv d3">
                <div>
                  <b>{counts.varieties ? `${counts.varieties}+` : (homeContent.stat1_number || '30+')}</b>
                  <small>{homeContent.stat1_label || 'Variétés de pierres'}</small>
                </div>
                <div>
                  <b>{counts.custom ? `${counts.custom}%` : (homeContent.stat2_number || '100%')}</b>
                  <small>{homeContent.stat2_label || 'Sur mesure'}</small>
                </div>
                <div>
                  <b>{homeContent.stat3_number || 'Maroc'}</b>
                  <small>{homeContent.stat3_label || 'Livraison & pose'}</small>
                </div>
              </div>
            </div>

            <div className="arch-wrap rv d2">
              <div className="arch-outline" />
              <div className="arch">
                {homeContent.arch_image ? (
                  <img
                    src={formatMediaUrl(homeContent.arch_image)}
                    alt={homeContent.arch_title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                  />
                ) : (
                  <StoneTexture
                    material={MATERIALS_DATA.find((m) => m.k === (homeContent.arch_material || 'travertin')) || MATERIALS_DATA[2]}
                    className="tex"
                    style={{ position: 'absolute', inset: 0 }}
                  />
                )}
                <div className="sheen" />
              </div>
              <div className="tag">
                <small>{homeContent.arch_badge || 'Collection'}</small>
                <b>{homeContent.arch_title || 'Beige de Taza, poli'}</b>
              </div>
            </div>
          </div>

          <div className="scroll">Défiler</div>
        </section>

        {/* ===== MARQUEE ===== */}
        <div className="marquee" aria-hidden="true">
          <div>
            {(() => {
              const words = Array.isArray(homeContent.marquee_words) && homeContent.marquee_words.length > 0
                ? homeContent.marquee_words
                : MARQUEE_WORDS;
              return [...words, ...words, ...words, ...words].map((word, idx) => (
                <span key={idx}>{word}</span>
              ));
            })()}
          </div>
        </div>

        {/* ===== SAVOIR-FAIRE ===== */}
        <section className="sec" id="savoir-faire" data-label="Savoir-faire">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow rv">Notre expertise</div>
                <h2 className="rv d1">
                  Cinq métiers, <em>une seule exigence.</em>
                </h2>
              </div>
              <p className="rv d2">
                De la sélection du bloc à la dernière jointure, nous maîtrisons chaque couche du projet.
              </p>
            </div>

            <div className="strata">
              {EXPERTISE_LAYERS.map((item) => {
                const mat = ALL_MATERIALS_DATA.find((m) => m.k === item.matKey);
                return (
                  <div key={item.n} className="layer rv">
                    <div className="bg">
                      {mat && (
                        <StoneTexture
                          material={mat}
                          className="tex"
                          style={{ position: 'absolute', inset: 0 }}
                        />
                      )}
                    </div>
                    <span className="n">{item.n}</span>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    <span className="go">→</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== MATÉRIAUX ===== */}
        <section className="sec mat" id="materiaux" data-label="Matériaux">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow rv">Collections</div>
                <h2 className="rv d1">
                  Choisissez votre <em>matière.</em>
                </h2>
              </div>
              <p className="rv d2">
                Touchez, comparez, imaginez. Sélectionnez une pierre puis une finition pour la visualiser.
              </p>
            </div>

            <div className="mat-grid">
              <div className="rv">
                <div className="tabs" id="tabs">
                  {MATERIALS_DATA.map((mat, idx) => (
                    <button
                      key={mat.k}
                      className={`tab ${idx === currentMatIndex ? 'on' : ''}`}
                      onClick={() => handleSelectMaterial(idx)}
                    >
                      {mat.t}
                      <small>{mat.s}</small>
                    </button>
                  ))}
                </div>

                <p className="info" id="info">{currentMat.d}</p>

                <div className="chips" id="chips">
                  {currentMat.f.map((fin, fIdx) => (
                    <button
                      key={fin}
                      className={`chip ${fIdx === currentFinIndex ? 'on' : ''}`}
                      onClick={() => handleSelectFinish(fIdx)}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`slab rv d1 ${slabRevealed ? 'in' : ''} ${isPoli ? 'poli' : ''}`}
                id="slab"
                data-in={slabRevealed ? 'true' : undefined}
              >
                <div
                  id="slabTex"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: slabFading ? 0 : 1,
                    transition: 'opacity .22s ease'
                  }}
                >
                  <StoneTexture
                    key={`${currentMat.k}_${currentFinIndex}`}
                    material={currentMat}
                    seedOffset={currentFinIndex * 2}
                  />
                </div>
                <div className="gloss" />
                <div className="cap">
                  <b id="slabName">{currentMat.t}</b>
                  <small id="slabFin">Finition · {activeFinish}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== RÉALISATIONS (BENTO) ===== */}
        <section className="sec" id="realisations" data-label="Réalisations">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow rv">Réalisations</div>
                <h2 className="rv d1">
                  Des projets qui <em>portent notre signature.</em>
                </h2>
              </div>
              <p className="rv d2">
                Découvrez une sélection de nos chantiers d'exception réalisés sur mesure partout au Maroc.
              </p>
            </div>

            <div className="bento">
              <article className="tile t1 rv">
                <img
                  className="tex"
                  src="/images/realisation-facade-taza.jpg"
                  alt="Villa en pierre de Taza éclatée au Maroc"
                  loading="lazy"
                />
                <div className="t">
                  <small>Façade · Pierre de Taza</small>
                  <b>Villa en pierre de Taza éclatée</b>
                </div>
              </article>

              <article className="tile t2 rv d1">
                <img
                  className="tex"
                  src="/images/realisation-escalier-marbre.jpg"
                  alt="Escalier suspendu en marbre Calacatta veiné"
                  loading="lazy"
                />
                <div className="t">
                  <small>Escalier · Marbre noble</small>
                  <b>Marbre veiné, nez de marche poli</b>
                </div>
              </article>

              <article className="tile t3 rv d2">
                <img
                  className="tex"
                  src="/images/realisation-cuisine-granit.jpg"
                  alt="Îlot de cuisine en granit noir absolu poli"
                  loading="lazy"
                />
                <div className="t">
                  <small>Cuisine · Granit absolu</small>
                  <b>Plan de travail en granit noir</b>
                </div>
              </article>

              <article className="tile t4 rv">
                <img
                  className="tex"
                  src="/images/realisation-salle-de-bain.jpg"
                  alt="Vasque sculptée et murs en ardoise naturelle"
                  loading="lazy"
                />
                <div className="t">
                  <small>Salle de bain · Ardoise</small>
                  <b>Ardoise & vasque monolithique sculptée</b>
                </div>
              </article>

              <article className="tile t5 rv d1">
                <img
                  className="tex"
                  src="/images/realisation-piscine-travertin.jpg"
                  alt="Plage de piscine et terrasse en travertin romain"
                  loading="lazy"
                />
                <div className="t">
                  <small>Extérieur · Travertin</small>
                  <b>Terrasse et plage de piscine antidérapantes</b>
                </div>
              </article>
            </div>

            <div style={{ textAlign: 'center', marginTop: '54px' }} className="rv d2">
              <Link to="/realisations" className="btn btn-dark">
                Voir toutes nos réalisations <span className="ar">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== MÉTHODE ===== */}
        <section className="sec method" id="methode" data-label="Méthode">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow rv">Notre méthode</div>
                <h2 className="rv d1">
                  Du bloc brut <em>à l'ouvrage fini.</em>
                </h2>
              </div>
            </div>

            <div className="steps">
              <div className="step rv">
                <div className="dot">1</div>
                <h3>Visite & métrage</h3>
                <p>Nous étudions votre projet sur place et relevons chaque dimension.</p>
              </div>

              <div className="step rv d1">
                <div className="dot">2</div>
                <h3>Devis & choix</h3>
                <p>Devis détaillé et sélection des pierres et finitions avec vous.</p>
              </div>

              <div className="step rv d2">
                <div className="dot">3</div>
                <h3>Taille en atelier</h3>
                <p>Découpe, façonnage et contrôle qualité de chaque pièce.</p>
              </div>

              <div className="step rv d3">
                <div className="dot">4</div>
                <h3>Livraison & pose</h3>
                <p>Transport sécurisé et pose soignée, joints et finitions inclus.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="sec" id="faq" data-label="FAQ">
          <div className="wrap faq-grid">
            <div className="sticky">
              <div className="eyebrow rv">Questions fréquentes</div>
              <h2 className="rv d1" style={{ marginTop: '20px' }}>
                Tout ce que vous <em>devez savoir.</em>
              </h2>
              <p className="rv d2" style={{ marginTop: '20px', color: 'var(--muted)' }}>
                Vous hésitez sur le choix de votre pierre ? Contactez directement nos tailleurs de pierre pour un conseil sur mesure.
              </p>
              <div style={{ marginTop: '30px' }} className="rv d3">
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ochre"
                >
                  Poser une question <span className="ar">→</span>
                </a>
              </div>
            </div>

            <div className="qa rv d1">
              {FAQ_DATA.map((item, idx) => (
                <div key={idx} className={`item ${openFaqIndex === idx ? 'o' : ''}`}>
                  <div className="q" onClick={() => toggleFaq(idx)}>
                    <h3>{item.q}</h3>
                    <span>+</span>
                  </div>
                  <div
                    className="a"
                    style={{
                      maxHeight: openFaqIndex === idx ? '260px' : '0'
                    }}
                  >
                    <div>{item.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DEVIS / CONTACT ===== */}
        <section className="sec quote" id="devis" data-label="Devis">
          <div className="wrap quote-grid">
            <div>
              <div className="eyebrow rv">Devis sur mesure</div>
              <h2 className="rv d1" style={{ marginTop: '20px' }}>
                Donnez vie à <em>vos projets de pierre.</em>
              </h2>
              <p className="rv d2" style={{ marginTop: '24px', color: 'rgba(239, 232, 219, .7)' }}>
                Partagez-nous les dimensions, surfaces et inspirations de votre ouvrage. Notre bureau d'études vous transmet une estimation détaillée et personnalisée.
              </p>

              <div className="stats rv d3" style={{ borderTopColor: 'var(--line-l)' }}>
                <div>
                  <b style={{ color: 'var(--ochre)' }}>24h</b>
                  <small>Délai de réponse</small>
                </div>
                <div>
                  <b style={{ color: 'var(--ochre)' }}>Gratuit</b>
                  <small>Étude & chiffrage</small>
                </div>
              </div>
            </div>

            <div className="rv d1">
              <form id="qf" onSubmit={handleFormSubmit}>
                <div className="row2">
                  <div className="f">
                    <label htmlFor="nm">Votre nom complet</label>
                    <input
                      id="nm"
                      type="text"
                      required
                      placeholder="M. / Mme El Amrani"
                      value={formData.nm}
                      onChange={(e) => setFormData({ ...formData, nm: e.target.value })}
                    />
                  </div>
                  <div className="f">
                    <label htmlFor="tl">Numéro WhatsApp / Téléphone</label>
                    <input
                      id="tl"
                      type="tel"
                      required
                      placeholder="06 XX XX XX XX"
                      value={formData.tl}
                      onChange={(e) => setFormData({ ...formData, tl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="f">
                  <label htmlFor="tp">Type de projet</label>
                  <select
                    id="tp"
                    value={formData.tp}
                    onChange={(e) => setFormData({ ...formData, tp: e.target.value })}
                  >
                    <option>Façade</option>
                    <option>Escalier</option>
                    <option>Cuisine / salle de bain</option>
                    <option>Sol intérieur</option>
                    <option>Terrasse / piscine</option>
                    <option>Autre aménagement</option>
                  </select>
                </div>

                <div className="f">
                  <label htmlFor="ms">Votre message & détails</label>
                  <textarea
                    id="ms"
                    placeholder="Surface approximative, ville du chantier, matériau souhaité…"
                    value={formData.ms}
                    onChange={(e) => setFormData({ ...formData, ms: e.target.value })}
                  />
                </div>

                <button className="btn btn-ochre" type="submit" style={{ justifyContent: 'center' }}>
                  Envoyer via WhatsApp <span className="ar">→</span>
                </button>
                <p className="note">Le message se prépare automatiquement dans WhatsApp, prêt à être expédié.</p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
