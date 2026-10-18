import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StoneTexture from '../components/StoneTexture';
import { getAcceuilContent, formatMediaUrl } from '../api/acceuil';
import { getSavoirFaireContent } from '../api/savoirFaire';
import { getMateriauxContent, toStoneMaterial } from '../api/materiaux';
import { getRealisationsContent } from '../api/realisations';
import { getMethodeContent } from '../api/methode';
import { getFaqContent } from '../api/faq';
import {
  MARQUEE_WORDS,
  WHATSAPP_PHONE
} from '../data/content';
import { useCompany } from '../context/CompanyContext';
import { getDevisSection, submitDevis, DEFAULT_DEVIS_SECTION } from '../api/devis';
import LuxuryLoader from '../components/LuxuryLoader';

export default function HomePage() {
  const { company } = useCompany();
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

  // Contenu Savoir-faire (depuis les tables savoir_faire_*)
  const [savoirFaire, setSavoirFaire] = useState(null);
  const [savoirFaireStatus, setSavoirFaireStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getSavoirFaireContent()
      .then((data) => {
        if (cancelled) return;
        setSavoirFaire(data);
        setSavoirFaireStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setSavoirFaireStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Contenu Matériaux (depuis les tables materiaux_*)
  const [materiaux, setMateriaux] = useState(null);
  const [materiauxStatus, setMateriauxStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getMateriauxContent()
      .then((data) => {
        if (cancelled) return;
        setMateriaux(data);
        setMateriauxStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setMateriauxStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Contenu Réalisations (depuis les tables realisations_*)
  const [realisations, setRealisations] = useState(null);
  const [realisationsStatus, setRealisationsStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getRealisationsContent({ featured: true })
      .then((data) => {
        if (cancelled) return;
        setRealisations(data);
        setRealisationsStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setRealisationsStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Contenu Méthode (depuis la table methode_*)
  const [methode, setMethode] = useState(null);
  const [methodeStatus, setMethodeStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getMethodeContent()
      .then((data) => {
        if (cancelled) return;
        setMethode(data);
        setMethodeStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setMethodeStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Contenu FAQ (depuis les tables faq_*)
  const [faq, setFaq] = useState(null);
  const [faqStatus, setFaqStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getFaqContent()
      .then((data) => {
        if (cancelled) return;
        setFaq(data);
        setFaqStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setFaqStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Textures de toutes les pierres (y compris celles masquées du sélecteur), indexées par slug.
  // Utilisées par la carte d'accueil et les couches Savoir-faire.
  const stoneBySlug = useMemo(() => {
    const map = {};
    (materiaux?.textures || []).forEach((t) => {
      map[t.slug] = toStoneMaterial(t);
    });
    return map;
  }, [materiaux]);

  // Matériaux interactifs
  const [currentMatIndex, setCurrentMatIndex] = useState(0);
  const [currentFinIndex, setCurrentFinIndex] = useState(0);
  const [slabFading, setSlabFading] = useState(false);
  const [slabRevealed, setSlabRevealed] = useState(false);

  // Révéler les éléments .rv rendus après le chargement des contenus Savoir-faire / Matériaux / Réalisations / Méthode / FAQ
  useEffect(() => {
    if (
      savoirFaireStatus !== 'ready' &&
      materiauxStatus !== 'ready' &&
      realisationsStatus !== 'ready' &&
      methodeStatus !== 'ready' &&
      faqStatus !== 'ready'
    )
      return undefined;
    const els = document.querySelectorAll(
      '#savoir-faire .rv:not(.in), #materiaux .rv:not(.in), #realisations .rv:not(.in), #methode .rv:not(.in), #faq .rv:not(.in)'
    );
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
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [savoirFaireStatus, materiauxStatus, realisationsStatus, methodeStatus, faqStatus]);

  // FAQ accordéon
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Formulaire Devis
  const [formData, setFormData] = useState({
    nm: '',
    tl: '',
    tp: 'Façade',
    ms: ''
  });

  // Contenu dynamique de la section Devis
  const [devisSection, setDevisSection] = useState(DEFAULT_DEVIS_SECTION);

  useEffect(() => {
    getDevisSection().then((data) => {
      if (data) setDevisSection((prev) => ({ ...prev, ...data }));
    });
  }, []);

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const brandName = `${company?.name || 'SUTRAVOMAR'} ${company?.tagline || 'STONE LUXE'}`.trim();
    const text = `Bonjour ${brandName},\nJe souhaite un devis.\nNom : ${formData.nm}\nTéléphone : ${formData.tl}\nProjet : ${formData.tp}\nMessage : ${formData.ms}`;
    const wa = company?.whatsapp_number || WHATSAPP_PHONE;

    // Enregistrement de la trace en base de données
    await submitDevis({
      name: formData.nm,
      phone: formData.tl,
      project_type: formData.tp,
      message: formData.ms
    });

    // Ouverture de WhatsApp
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const matItems = materiaux?.items ?? [];
  const safeMatIndex = currentMatIndex < matItems.length ? currentMatIndex : 0;
  const currentMat = matItems[safeMatIndex];
  const currentStone = currentMat ? stoneBySlug[currentMat.slug] : null;
  const activeFinish = currentMat?.finishes?.[currentFinIndex] || currentMat?.finishes?.[0] || '';
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
                  stoneBySlug[homeContent.arch_material || 'travertin'] && (
                    <StoneTexture
                      material={stoneBySlug[homeContent.arch_material || 'travertin']}
                      className="tex"
                      style={{ position: 'absolute', inset: 0 }}
                    />
                  )
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
            {savoirFaireStatus === 'loading' && (
              <LuxuryLoader size={64} minHeight="160px" />
            )}

            {savoirFaireStatus === 'error' && (
              <p className="lead" role="alert">
                Impossible de charger cette section pour le moment. Veuillez réessayer plus tard.
              </p>
            )}

            {savoirFaireStatus === 'ready' && savoirFaire && (
              <>
                <div className="sec-head">
                  <div>
                    {savoirFaire.section.eyebrow && (
                      <div className="eyebrow rv">{savoirFaire.section.eyebrow}</div>
                    )}
                    <h2 className="rv d1">
                      {savoirFaire.section.title}{' '}
                      {savoirFaire.section.title_em && <em>{savoirFaire.section.title_em}</em>}
                    </h2>
                  </div>
                  {savoirFaire.section.description && (
                    <p className="rv d2">{savoirFaire.section.description}</p>
                  )}
                </div>

                {savoirFaire.items.length === 0 ? (
                  <p className="lead">Aucune expertise à afficher pour le moment.</p>
                ) : (
                  <div className="strata">
                    {savoirFaire.items.map((item, idx) => {
                      const mat = stoneBySlug[item.mat_key];
                      return (
                        <div key={item.id} className="layer rv">
                          <div className="bg">
                            {item.image ? (
                              <img
                                src={formatMediaUrl(item.image)}
                                alt={item.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                              />
                            ) : (
                              mat && (
                                <StoneTexture
                                  material={mat}
                                  className="tex"
                                  style={{ position: 'absolute', inset: 0 }}
                                />
                              )
                            )}
                          </div>
                          <span className="n">{String(idx + 1).padStart(2, '0')}</span>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          <span className="go">→</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ===== MATÉRIAUX ===== */}
        <section className="sec mat" id="materiaux" data-label="Matériaux">
          <div className="wrap">
            {materiauxStatus === 'loading' && (
              <LuxuryLoader size={64} minHeight="160px" />
            )}

            {materiauxStatus === 'error' && (
              <p className="lead" role="alert">
                Impossible de charger cette section pour le moment. Veuillez réessayer plus tard.
              </p>
            )}

            {materiauxStatus === 'ready' && materiaux && (
              <>
                <div className="sec-head">
                  <div>
                    {materiaux.section?.eyebrow && (
                      <div className="eyebrow rv">{materiaux.section.eyebrow}</div>
                    )}
                    <h2 className="rv d1">
                      {materiaux.section?.title}{' '}
                      {materiaux.section?.title_em && <em>{materiaux.section.title_em}</em>}
                    </h2>
                  </div>
                  {materiaux.section?.description && (
                    <p className="rv d2">{materiaux.section.description}</p>
                  )}
                </div>

                {matItems.length === 0 ? (
                  <p className="lead">Aucun matériau disponible pour le moment.</p>
                ) : (
                  <div className="mat-grid">
                    <div className="rv">
                      <div className="tabs" id="tabs">
                        {matItems.map((mat, idx) => (
                          <button
                            key={mat.id || mat.slug}
                            className={`tab ${idx === safeMatIndex ? 'on' : ''}`}
                            onClick={() => handleSelectMaterial(idx)}
                          >
                            {mat.name}
                            {mat.category_name && <small>{mat.category_name}</small>}
                          </button>
                        ))}
                      </div>

                      {currentMat && (
                        <p className="info" id="info">{currentMat.description}</p>
                      )}

                      {currentMat?.finishes && currentMat.finishes.length > 0 && (
                        <div className="chips" id="chips">
                          {currentMat.finishes.map((fin, fIdx) => (
                            <button
                              key={fin}
                              className={`chip ${fIdx === currentFinIndex ? 'on' : ''}`}
                              onClick={() => handleSelectFinish(fIdx)}
                            >
                              {fin}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {currentMat && (
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
                          {currentMat.image ? (
                            <img
                              src={formatMediaUrl(currentMat.image)}
                              alt={currentMat.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                            />
                          ) : currentStone ? (
                            <StoneTexture
                              key={`${currentMat.slug}_${currentFinIndex}`}
                              material={currentStone}
                              seedOffset={currentFinIndex * 2}
                            />
                          ) : null}
                        </div>
                        <div className="gloss" />
                        <div className="cap">
                          <b id="slabName">{currentMat.name}</b>
                          {activeFinish && <small id="slabFin">Finition · {activeFinish}</small>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ===== RÉALISATIONS (BENTO) ===== */}
        <section className="sec" id="realisations" data-label="Réalisations">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <div className="eyebrow rv">
                  {realisations?.section?.bento_eyebrow || 'Réalisations'}
                </div>
                <h2 className="rv d1">
                  {realisations?.section?.bento_title || 'Des projets qui'}{' '}
                  <em>{realisations?.section?.bento_title_em || 'portent notre signature.'}</em>
                </h2>
              </div>
              <p className="rv d2">
                {realisations?.section?.bento_description ||
                  "Découvrez une sélection de nos chantiers d'exception réalisés sur mesure partout au Maroc."}
              </p>
            </div>

            <div className="bento">
              {((realisations?.items && realisations.items.length > 0)
                ? realisations.items.slice(0, 5)
                : [
                    { id: 1, grid_class: 't1', cover_image: '/images/realisation-facade-taza.jpg', subtitle: 'Façade · Pierre de Taza', short_title: 'Villa en pierre de Taza éclatée' },
                    { id: 2, grid_class: 't2', cover_image: '/images/realisation-escalier-marbre.jpg', subtitle: 'Escalier · Marbre noble', short_title: 'Marbre veiné, nez de marche poli' },
                    { id: 3, grid_class: 't3', cover_image: '/images/realisation-cuisine-granit.jpg', subtitle: 'Cuisine · Granit absolu', short_title: 'Plan de travail en granit noir' },
                    { id: 4, grid_class: 't4', cover_image: '/images/realisation-salle-de-bain.jpg', subtitle: 'Salle de bain · Ardoise', short_title: 'Ardoise & vasque monolithique sculptée' },
                    { id: 5, grid_class: 't5', cover_image: '/images/realisation-piscine-travertin.jpg', subtitle: 'Extérieur · Travertin', short_title: 'Terrasse et plage de piscine antidérapantes' }
                  ]
              ).map((proj, idx) => {
                const gClass = proj.grid_class || proj.gridClass || `t${idx + 1}`;
                const delayClass = idx === 1 || idx === 4 ? 'd1' : idx === 2 ? 'd2' : '';
                const cover = proj.cover_image || proj.img;
                const subtitle = proj.subtitle || `${proj.category_name || 'Projet'} · ${proj.stone || ''}`;
                const shortTitle = proj.short_title || proj.shortTitle || proj.title;

                return (
                  <article key={proj.id} className={`tile ${gClass} rv ${delayClass}`}>
                    <img
                      className="tex"
                      src={cover}
                      alt={proj.title || shortTitle}
                      loading="lazy"
                    />
                    <div className="t">
                      <small>{subtitle}</small>
                      <b>{shortTitle}</b>
                    </div>
                  </article>
                );
              })}
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
                <div className="eyebrow rv">{methode?.section?.eyebrow || 'Notre méthode'}</div>
                <h2 className="rv d1">
                  {methode?.section?.title || 'Du bloc brut'}{' '}
                  <em>{methode?.section?.title_em || "à l'ouvrage fini."}</em>
                </h2>
              </div>
              {methode?.section?.description && (
                <p className="rv d2" style={{ maxWidth: '540px' }}>
                  {methode.section.description}
                </p>
              )}
            </div>

            <div className="steps">
              {((methode?.items && methode.items.length > 0)
                ? methode.items
                : [
                    { id: 1, position: 1, title: 'Visite & métrage', short_description: 'Nous étudions votre projet sur place et relevons chaque dimension.' },
                    { id: 2, position: 2, title: 'Devis & choix', short_description: 'Devis détaillé et sélection des pierres et finitions avec vous.' },
                    { id: 3, position: 3, title: 'Taille en atelier', short_description: 'Découpe, façonnage et contrôle qualité de chaque pièce.' },
                    { id: 4, position: 4, title: 'Livraison & pose', short_description: 'Transport sécurisé et pose soignée, joints et finitions inclus.' }
                  ]
              ).map((step, idx) => {
                const delayClass = idx === 1 ? 'd1' : idx === 2 ? 'd2' : idx >= 3 ? 'd3' : '';
                const dotNumber = step.step_number ? parseInt(step.step_number, 10) || idx + 1 : idx + 1;
                return (
                  <div key={step.id} className={`step rv ${delayClass}`}>
                    <div className="dot">{dotNumber}</div>
                    <h3>{step.title}</h3>
                    <p>{step.short_description || step.desc || step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="sec" id="faq" data-label="FAQ">
          <div className="wrap faq-grid">
            <div className="sticky">
              <div className="eyebrow rv">{faq?.section?.eyebrow || 'Questions fréquentes'}</div>
              <h2 className="rv d1" style={{ marginTop: '20px' }}>
                {faq?.section?.title || 'Tout ce que vous'}{' '}
                <em>{faq?.section?.title_em || 'devez savoir.'}</em>
              </h2>
              <p className="rv d2" style={{ marginTop: '20px', color: 'var(--muted)' }}>
                {faq?.section?.description !== undefined && faq?.section?.description !== null && faq?.section?.description !== ''
                  ? faq.section.description
                  : 'Vous hésitez sur le choix de votre pierre ? Contactez directement nos tailleurs de pierre pour un conseil sur mesure.'}
              </p>
              <div style={{ marginTop: '30px' }} className="rv d3">
                <a
                  href={faq?.section?.cta_link || `https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ochre"
                >
                  {faq?.section?.cta_text || 'Poser une question'} <span className="ar">→</span>
                </a>
              </div>
            </div>

            <div className="qa rv d1">
              {(faq?.items && faq.items.length > 0) ? (
                faq.items.map((item, idx) => (
                  <div key={item.id || idx} className={`item ${openFaqIndex === idx ? 'o' : ''}`}>
                    <div className="q" onClick={() => toggleFaq(idx)}>
                      <h3>{item.question || item.q}</h3>
                      <span>+</span>
                    </div>
                    <div
                      className="a"
                      style={{
                        maxHeight: openFaqIndex === idx ? '360px' : '0'
                      }}
                    >
                      <div style={{ whiteSpace: 'pre-line' }}>{item.answer || item.a}</div>
                    </div>
                  </div>
                ))
              ) : faqStatus === 'loading' ? (
                <LuxuryLoader size={54} minHeight="120px" />
              ) : (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: '14px' }}>
                  Aucune question disponible pour le moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== DEVIS / CONTACT ===== */}
        <section className="sec quote" id="devis" data-label="Devis">
          <div className="wrap quote-grid">
            <div>
              <div className="eyebrow rv">{devisSection.eyebrow}</div>
              <h2 className="rv d1" style={{ marginTop: '20px' }}>
                {devisSection.title_prefix}{' '}
                {devisSection.title_emphasis && <em>{devisSection.title_emphasis}</em>}
              </h2>
              <p className="rv d2" style={{ marginTop: '24px', color: 'rgba(239, 232, 219, .7)' }}>
                {devisSection.description}
              </p>

              <div className="stats rv d3" style={{ borderTopColor: 'var(--line-l)' }}>
                <div>
                  <b style={{ color: 'var(--ochre)' }}>{devisSection.stat1_value}</b>
                  <small>{devisSection.stat1_label}</small>
                </div>
                <div>
                  <b style={{ color: 'var(--ochre)' }}>{devisSection.stat2_value}</b>
                  <small>{devisSection.stat2_label}</small>
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
                  {devisSection.button_text || 'Envoyer via WhatsApp'} <span className="ar">→</span>
                </button>
                <p className="note">{devisSection.note_text || 'Le message se prépare automatiquement dans WhatsApp, prêt à être expédié.'}</p>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
