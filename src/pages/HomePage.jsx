import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StoneTexture from '../components/StoneTexture';
import { getAcceuilContent, formatMediaUrl, DEFAULT_FEATURES_BAR } from '../api/acceuil';
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
import MaterialCard from '../components/MaterialCard';
import { useMaterials } from '../data/useMaterials';
import {
  getPourquoiChoisir,
  DEFAULT_POURQUOI_CHOISIR,
  DEFAULT_POURQUOI_CATEGORIES,
  formatPourquoiMediaUrl,
} from '../api/pourquoiChoisir';
import { renderPourquoiCategorySvg } from '../components/PourquoiChoisirAdmin';
import { useSeo, setJsonLd } from '../seo/useSeo';

export default function HomePage() {
  const { company } = useCompany();
  useSeo({ path: '/' });
  const { categories, materials, section: matSection } = useMaterials();
  const carouselItems = categories.length > 0 ? categories : materials;
  // Contenu d'accueil dynamique (depuis la table acceuil)
  const [homeContent, setHomeContent] = useState({
    eyebrow: 'SUTRAVOMAR STONE LUXE',
    title_line1: 'La pierre,',
    title_line2: 'un art de vivre.',
    title_line3: '',
    description: "Des pierres naturelles d'exception pour sublimer vos espaces. Élégance, durabilité et savoir-faire au service de vos projets.",
    hero_image: '/images/hero-luxury-living.jpg',
    video_url: null,
    arch_badge: 'Collection',
    arch_title: 'Beige de Taza, poli',
    arch_material: 'travertin',
    arch_image: null,
    stat1_number: '+500',
    stat1_label: 'Projets réalisés',
    stat2_number: '100%',
    stat2_label: 'Clients satisfaits',
    stat3_number: '15 ans',
    stat3_label: "d'expérience",
    marquee_words: MARQUEE_WORDS,
    features_bar: DEFAULT_FEATURES_BAR,
  });

  useEffect(() => {
    getAcceuilContent().then((data) => {
      if (data) {
        setHomeContent((prev) => ({
          ...prev,
          ...data,
          features_bar:
            Array.isArray(data.features_bar) && data.features_bar.length > 0
              ? data.features_bar
              : prev.features_bar,
        }));
      }
    });
  }, []);

  // Contenu Pourquoi nous choisir (depuis la table pourquoi_choisir_sections)
  const [pourquoiChoisir, setPourquoiChoisir] = useState(DEFAULT_POURQUOI_CHOISIR);
  const [savoirFaire, setSavoirFaire] = useState(null);
  const [savoirFaireStatus, setSavoirFaireStatus] = useState('ready'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;
    getPourquoiChoisir()
      .then((data) => {
        if (cancelled || !data) return;
        setPourquoiChoisir((prev) => ({
          ...prev,
          ...data,
          categories:
            Array.isArray(data.categories) && data.categories.length > 0
              ? data.categories
              : prev.categories,
        }));
      })
      .catch(() => {});

    getSavoirFaireContent()
      .then((data) => {
        if (cancelled) return;
        setSavoirFaire(data);
        setSavoirFaireStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setSavoirFaireStatus('ready');
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

  // Données structurées FAQPage générées depuis la FAQ réelle (BDD)
  useEffect(() => {
    const entities = (faq?.items || [])
      .map((item) => ({ q: item.question || item.q, a: item.answer || item.a }))
      .filter((it) => it.q && it.a)
      .map((it) => ({
        '@type': 'Question',
        name: String(it.q).trim(),
        acceptedAnswer: { '@type': 'Answer', text: String(it.a).trim() },
      }));
    setJsonLd(
      'ld-faq',
      entities.length
        ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities }
        : null
    );
    return () => setJsonLd('ld-faq', null);
  }, [faq]);

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

  // Mat cards scroll offset
  const matCardsRef = useRef(null);
  const realRowRef = useRef(null);

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

    // Compteurs de stats dans la section savoir-faire
    const sfStats = document.querySelector('.sf-stats');
    if (sfStats) {
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
                  varieties: Math.round(500 * eased),
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
      co.observe(sfStats);
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

  // Scroll mat cards
  const scrollMatCards = (dir) => {
    if (matCardsRef.current) {
      matCardsRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  // Scroll realisations cards
  const scrollRealRow = (dir) => {
    if (realRowRef.current) {
      realRowRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

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
          {/* Image de fond ultra-luxe (salon contemporain avec cheminée et marbre) */}
          <div className="hero-bg-wrap">
            <img
              src={formatMediaUrl(homeContent.hero_image) || "/images/hero-luxury-living.jpg"}
              alt="SUTRAVOMAR STONE LUXE — Marbre et Pierre d'exception"
              className="hero-bg-img"
              loading="eager"
              onError={(e) => {
                console.error('[Hero Image Error] Impossible de charger l\'image:', e.currentTarget.src);
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/hero-luxury-living.jpg";
              }}
            />
            <div className="hero-overlay" />
          </div>

          <div className="wrap hero-grid">
            <div className="hero-content">
              {/* Badge supérieur avec étincelle */}
              <div className="hero-badge rv">
                <span className="hero-badge-spark">✦</span>
                <span className="hero-badge-text">
                  {homeContent.eyebrow || 'SUTRAVOMAR STONE LUXE'}
                </span>
              </div>

              {/* Titre principal */}
              <h1 className="hero-title rv d1">
                <span className="hero-title-l1">{homeContent.title_line1 || 'La pierre,'}</span>
                <span className="hero-title-em">
                  <em>{homeContent.title_line2 || 'un art de vivre.'}</em>
                </span>
                {homeContent.title_line3 && (
                  <span className="hero-title-l3">{homeContent.title_line3}</span>
                )}
              </h1>

              {/* Description */}
              <p className="hero-desc rv d2">
                {homeContent.description || "Des pierres naturelles d'exception pour sublimer vos espaces. Élégance, durabilité et savoir-faire au service de vos projets."}
              </p>

              {/* Bouton CTA Pilule doré */}
              <div className="hero-actions rv d3">
                <Link to="/realisations" className="hero-btn-pill">
                  Découvrir notre univers <span className="ar">→</span>
                </Link>
              </div>

              {/* Localisation */}
              <div className="hero-location rv d3">
                <svg className="hero-pin-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span>{company.city || 'Taza, Maroc'}</span>
              </div>
            </div>
          </div>

          {/* Indicateur Scroll Découvrir en bas à droite */}
          <a href="#features" className="hero-scroll-indicator" aria-label="Défiler pour découvrir">
            <div className="hero-scroll-label">
              <span>SCROLL</span>
              <span>DÉCOUVRIR</span>
            </div>
            <div className="hero-mouse-pill">
              <span className="hero-mouse-wheel" />
            </div>
          </a>
        </section>

        {/* ===== FEATURES BAR ===== */}
        <div className="features-bar" id="features">
          <div className="wrap features-grid">
            {(Array.isArray(homeContent.features_bar) && homeContent.features_bar.length > 0
              ? homeContent.features_bar
              : DEFAULT_FEATURES_BAR
            ).map((feat, idx) => (
              <div key={idx} className="feature-item">
                {feat.icon === 'shield' ? (
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ) : feat.icon === 'arrow' ? (
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                ) : feat.icon === 'clock' ? (
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                  </svg>
                ) : (
                  <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
                <div>
                  <b>{feat.title}</b>
                  <small>{feat.subtitle}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

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

        {/* ===== SAVOIR-FAIRE — "Pourquoi nous choisir" ===== */}
        <section className="sec sec-why" id="savoir-faire" data-label="Pourquoi nous choisir">
          <div className="wrap">
            <div className="why-grid">
              {/* COLONNE 1 : TEXTE & STATS */}
              <div className="why-text-col">
                <div className="why-eyebrow rv">
                  <span className="why-eyebrow-line" />
                  <span>{pourquoiChoisir.eyebrow || 'POURQUOI NOUS CHOISIR ?'}</span>
                </div>

                <h2 className="why-title rv d1">
                  {pourquoiChoisir.title_line1 || "L'excellence"}
                  <br />
                  {pourquoiChoisir.title_line2 || 'au cœur de chaque projet.'}
                </h2>

                <p className="why-desc rv d2">
                  {pourquoiChoisir.description ||
                    savoirFaire?.section?.description ||
                    "Chez SUTRAVOMAR, nous ne vendons pas seulement des pierres, nous créons des espaces intemporels. Chaque projet est une rencontre entre la nature, l'architecture et votre vision."}
                </p>

                {/* 3 Chiffres clés */}
                <div className="why-stats rv d2">
                  <div className="why-stat-item">
                    <b className="why-stat-num">
                      {pourquoiChoisir.stat1_number || homeContent.stat1_number || '+500'}
                    </b>
                    <span className="why-stat-lbl">
                      {pourquoiChoisir.stat1_label || homeContent.stat1_label || 'Projets réalisés'}
                    </span>
                  </div>
                  <div className="why-stat-divider" />
                  <div className="why-stat-item">
                    <b className="why-stat-num">
                      {pourquoiChoisir.stat2_number || homeContent.stat2_number || '100%'}
                    </b>
                    <span className="why-stat-lbl">
                      {pourquoiChoisir.stat2_label || homeContent.stat2_label || 'Clients satisfaits'}
                    </span>
                  </div>
                  <div className="why-stat-divider" />
                  <div className="why-stat-item">
                    <b className="why-stat-num">
                      {pourquoiChoisir.stat3_number || homeContent.stat3_number || '15 ans'}
                    </b>
                    <span className="why-stat-lbl">
                      {pourquoiChoisir.stat3_label || homeContent.stat3_label || "D'expérience"}
                    </span>
                  </div>
                </div>

                <div className="why-btn-wrap rv d3">
                  <a href={pourquoiChoisir.button_link || '#materiaux'} className="why-btn">
                    <span>{pourquoiChoisir.button_text || 'En savoir plus'}</span>
                    <span className="why-btn-ar">→</span>
                  </a>
                </div>
              </div>

              {/* COLONNE 2 : IMAGE ESCALIER MARBRE AVEC CITATION */}
              <div className="why-img-col rv d1">
                <div className="why-img-card">
                  <img
                    src={
                      formatPourquoiMediaUrl(pourquoiChoisir.image) ||
                      '/images/pourquoi-nous-choisir-escalier.jpg'
                    }
                    alt={
                      pourquoiChoisir.image_alt ||
                      'Escalier monumental en marbre avec éclairage LED sous chaque marche'
                    }
                    className="why-img"
                    loading="lazy"
                  />
                  <div className="why-quote-overlay">
                    <p className="why-quote-text">
                      {pourquoiChoisir.quote_line1 || 'La pierre'}
                      <br />
                      {pourquoiChoisir.quote_line2 || 'révèle le caractère'}
                      <br />
                      {pourquoiChoisir.quote_line3 || 'de vos espaces'}
                    </p>
                  </div>
                </div>
              </div>

              {/* COLONNE 3 : CATÉGORIES AVEC ICÔNES CIRCULAIRES */}
              <div className="why-categories-col rv d2">
                {(Array.isArray(pourquoiChoisir.categories) && pourquoiChoisir.categories.length > 0
                  ? pourquoiChoisir.categories
                  : DEFAULT_POURQUOI_CATEGORIES
                )
                  .filter((cat) => cat.is_active !== false)
                  .map((cat, idx) => (
                    <div key={cat.id || idx} className="why-cat-row">
                      <div className="why-cat-icon-circle">
                        {renderPourquoiCategorySvg(cat.icon)}
                      </div>
                      <div className="why-cat-label">
                        <span>{cat.line1}</span>
                        <span>{cat.line2}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== SECTION "NOS MATÉRIAUX" (FOND CLAIR) ===== */}
        <section className="sec sec-mat-light" id="materiaux" data-label="Matériaux">
          <div className="wrap mat-light-wrap">
            {/* GAUCHE : TEXTE & BOUTON */}
            <div className="mat-left-col">
              <div className="mat-eyebrow rv">
                <span className="mat-eyebrow-line" />
                <span>{matSection?.eyebrow || 'NOS MATÉRIAUX'}</span>
              </div>

              <h2 className="mat-title rv d1">
                {matSection?.title || "Une sélection d'exception"}{' '}
                {matSection?.title_em && <em>{matSection.title_em}</em>}
              </h2>

              <p className="mat-desc rv d2">
                {matSection?.description ||
                  'Marbre, granit, pierre naturelle... Des matériaux nobles, soigneusement sélectionnés pour leur beauté, leur résistance et leur durabilité.'}
              </p>

              <div className="mat-btn-wrap rv d3">
                <Link to="/detailsmateriaux" className="mat-btn">
                  <span>Voir tous les matériaux</span>
                  <span className="mat-btn-ar">→</span>
                </Link>
              </div>
            </div>

            {/* DROITE : 5 DALLES DE PIERRE VERTICALES + FLÈCHES */}
            <div className="mat-right-col rv d1">
              <div className="mat-slabs-container" ref={matCardsRef}>
                {carouselItems.map((m) => (
                  <MaterialCard key={`${m.isCategory ? 'cat' : 'mat'}-${m.id}`} material={m} layout="carousel" />
                ))}
              </div>

              {/* Flèches de navigation empilées à droite */}
              <div className="mat-arrows-stack">
                <button
                  type="button"
                  className="mat-arrow-btn"
                  onClick={() => scrollMatCards(-1)}
                  aria-label="Précédent"
                >
                  ←
                </button>
                <button
                  type="button"
                  className="mat-arrow-btn"
                  onClick={() => scrollMatCards(1)}
                  aria-label="Suivant"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== RÉALISATIONS — Slider horizontal de projets ===== */}
        <section className="sec sec-real" id="realisations" data-label="Réalisations">
          <div className="wrap">
            <div className="real-header">
              <div>
                <div className="real-eyebrow rv">
                  <span className="real-eyebrow-line" />
                  <span>RÉALISATIONS</span>
                </div>
                <h2 className="real-title rv d1">
                  Des espaces qui<br />
                  racontent une histoire
                </h2>
              </div>
              <div className="real-view-all rv d2">
                <Link to="/realisations" className="real-link-all">
                  <span>Voir tous les projets</span>
                  <span className="ar">→</span>
                </Link>
              </div>
            </div>

            {/* Slider avec flèches latérales */}
            <div className="real-slider-wrap rv d1">
              {/* Flèche gauche */}
              <button
                type="button"
                className="real-nav-arrow real-arrow-left"
                onClick={() => scrollRealRow(-1)}
                aria-label="Projets précédents"
              >
                ←
              </button>

              {/* Rangée de cartes de projets */}
              <div className="real-row" ref={realRowRef}>
                {((realisations?.items && realisations.items.length > 0)
                  ? realisations.items
                  : [
                    { id: 1, cover_image: '/images/realisation-facade-taza.jpg', title: 'Villa privée', city: 'Taza' },
                    { id: 2, cover_image: '/images/realisation-cuisine-granit.jpg', title: 'Cuisine haut de gamme', city: 'Taza' },
                    { id: 3, cover_image: '/images/pourquoi-nous-choisir-escalier.jpg', title: 'Escalier en marbre', city: 'Taza' },
                    { id: 4, cover_image: '/images/realisation-piscine-travertin.jpg', title: 'Piscine & terrasse', city: 'Taza' },
                    { id: 5, cover_image: '/images/realisation-salle-de-bain.jpg', title: 'Salle de bain marbre', city: 'Taza' },
                  ]
                ).map((proj) => {
                  const cover = proj.cover_image || proj.img;
                  const title = proj.short_title || proj.title;
                  const city = proj.city || proj.location || 'Taza';

                  return (
                    <article key={proj.id} className="real-card">
                      {cover ? (
                        <img
                          src={cover}
                          alt={title}
                          loading="lazy"
                          className="real-card-img"
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2a2520, #1a1816)' }} />
                      )}
                      <div className="real-card-gradient" />
                      <div className="real-card-info">
                        <b className="real-card-title">{title}</b>
                        <small className="real-card-city">{city}</small>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Flèche droite */}
              <button
                type="button"
                className="real-nav-arrow real-arrow-right"
                onClick={() => scrollRealRow(1)}
                aria-label="Projets suivants"
              >
                →
              </button>
            </div>

            {/* Pagination tirets discrets */}
            <div className="real-dots-wrap" aria-hidden="true">
              <span className="real-dot active" />
              <span className="real-dot" />
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
              <p className="rv d2" style={{ marginTop: '20px', color: 'rgba(240,233,220,.6)' }}>
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
                <div style={{ padding: '24px 0', color: 'rgba(240,233,220,.5)', fontSize: '14px' }}>
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
                  <label htmlFor="ms">Votre message &amp; détails</label>
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
