export const ALL_MATERIALS_DATA = [
  {
    k: 'marbre',
    t: 'Marbre',
    s: 'Intérieur',
    d: "Veines profondes et brillance noble : le choix des escaliers, sols de réception, vasques et plans de travail d'exception.",
    f: ['Poli', 'Adouci', 'Brossé'],
    type: 'veins',
    base: '#e9e4da',
    vein: '#5d5a55',
    tone: '#bfb7a6',
    freq: '0.007 0.016',
    seed: 4
  },
  {
    k: 'granit',
    t: 'Granit',
    s: 'Int. & ext.',
    d: "Extrêmement dur et résistant. Idéal pour les cuisines, les seuils, les marches et tous les usages intensifs.",
    f: ['Poli', 'Flammé', 'Bouchardé'],
    type: 'granit',
    base: '#2a2a2c',
    vein: '#d8d4cc',
    tone: '#4a4a4e',
    freq: '0.9',
    seed: 8
  },
  {
    k: 'travertin',
    t: 'Travertin',
    s: 'Int. & ext.',
    d: "Teintes chaudes et stries horizontales douces. Parfait pour murs, salles de bain, terrasses et margelles.",
    f: ['Brossé', 'Adouci', 'Vieilli'],
    type: 'bands',
    base: '#dccbad',
    vein: '#a98e66',
    tone: '#efe3cb',
    freq: '0.004 0.085',
    seed: 2
  },
  {
    k: 'taza',
    t: 'Pierre de Taza',
    s: 'Façades',
    d: "Calcaire compact aux nuances beige et gris, très résistant aux intempéries : façades, piscines, escaliers et dallages.",
    f: ['Bouchardé', 'Poli', 'Éclaté', 'Vieilli'],
    type: 'grain',
    base: '#cdb591',
    vein: '#7d6445',
    tone: '#e3d2b3',
    freq: '0.5',
    seed: 11
  },
  {
    k: 'ardoise',
    t: 'Ardoise',
    s: 'Int. & ext.',
    d: "Roche métamorphique sombre aux reflets bleutés ou anthracites. Texture clivée naturelle pour revêtements muraux et salles d'eau.",
    f: ['Naturelle', 'Brossée', 'Vieillie'],
    type: 'bands',
    base: '#34383a',
    vein: '#6e7a78',
    tone: '#4b5254',
    freq: '0.01 0.05',
    seed: 6
  }
];

// DATA in index.html contains exactly 4 materials for the selector tabs
export const MATERIALS_DATA = ALL_MATERIALS_DATA.slice(0, 4);

export const EXPERTISE_LAYERS = [
  {
    n: '01',
    matKey: 'granit',
    title: 'Revêtements muraux & sols',
    desc: 'Marbre et pierre naturelle posés avec précision, pour des espaces élégants et durables.'
  },
  {
    n: '02',
    matKey: 'marbre',
    title: 'Plans de travail & vasques',
    desc: 'Cuisines et salles de bain taillées sur mesure dans des matériaux haut de gamme.'
  },
  {
    n: '03',
    matKey: 'taza',
    title: 'Escaliers & façades',
    desc: "Habillage d'escaliers, de façades et de piscines en pierre de Taza, robuste et raffinée."
  },
  {
    n: '04',
    matKey: 'travertin',
    title: 'Aménagements extérieurs',
    desc: 'Dallages, terrasses, murets et jardins résistants aux intempéries.'
  },
  {
    n: '05',
    matKey: 'ardoise',
    title: 'Vente & livraison',
    desc: 'Fourniture de pierres naturelles et livraison sécurisée sur chantier, partout au Maroc.'
  }
];

export const REALISATIONS_DATA = [
  {
    id: 1,
    category: 'facade',
    catLabel: 'Façade & Parement',
    title: 'Villa contemporaine en pierre de Taza éclatée',
    subtitle: 'Façade · Pierre de Taza',
    shortTitle: 'Villa en pierre de Taza éclatée',
    shortDesc: 'Habillage sculptural d\'une villa haut standing. Joints invisibles et découpes d\'angles biseautées au millimètre.',
    desc: 'Habillage complet des façades d\'une villa de maître avec appareillage de pierre de Taza taillée en parement éclaté. Lignes pures contemporaines, isolation naturelle et résistance optimale aux embruns marins.',
    stone: 'Pierre de Taza beige',
    finish: 'Éclatée brute & Adoucie',
    loc: 'Rabat (Harhoura)',
    img: '/images/realisation-facade-taza.jpg',
    gridClass: 't1'
  },
  {
    id: 2,
    category: 'escalier',
    catLabel: 'Escalier & Sol d\'exception',
    title: 'Escalier hélicoïdal en marbre Calacatta veiné',
    subtitle: 'Escalier · Marbre noble',
    shortTitle: 'Marbre veiné, nez de marche poli',
    shortDesc: 'Courbes fluides et veines bookmatched. Un travail d\'orfèvre exécuté dans une résidence privée de prestige.',
    desc: 'Taille et pose d\'un escalier monumental avec marches massives suspendues. Continuité parfaite des veines de marbre d\'une marche à l\'autre (effet livre ouvert) et nez de marche adouci antidérapant.',
    stone: 'Marbre Calacatta noble',
    finish: 'Poli brillant miroir',
    loc: 'Casablanca (Anfa)',
    img: '/images/realisation-escalier-marbre.jpg',
    gridClass: 't2'
  },
  {
    id: 3,
    category: 'cuisine',
    catLabel: 'Cuisine haut de gamme',
    title: 'Îlot central monolithique & plan de travail en granit noir',
    subtitle: 'Cuisine · Granit absolu',
    shortTitle: 'Plan de travail en granit noir',
    shortDesc: 'Finition satinée velours d\'une extrême résistance aux rayures, taches et chaleurs intenses.',
    desc: 'Conception et découpe numérique d\'un îlot de 4,20 mètres taillé d\'un seul tenant en granit noir. Intégration sous plan d\'évier affleurant, rainurage d\'égouttoir taillé dans la masse et résistance totale aux chocs thermiques.',
    stone: 'Granit noir absolu',
    finish: 'Satiné adouci & hydrofugé',
    loc: 'Marrakech (Palmeraie)',
    img: '/images/realisation-cuisine-granit.jpg',
    gridClass: 't3'
  },
  {
    id: 4,
    category: 'salle-de-bain',
    catLabel: 'Salle de bain & Bien-être',
    title: 'Suite parentale & vasque sculptée en ardoise naturelle',
    subtitle: 'Salle de bain · Ardoise',
    shortTitle: 'Ardoise & vasque monolithique sculptée',
    shortDesc: 'Ambiance spa minérale avec contraste entre textures brutes naturelles et raccords d\'angles précis.',
    desc: 'Aménagement complet d\'une salle de bain minérale comprenant un bloc vasque sculpté à la main dans un bloc monolithique d\'ardoise, receveur de douche à l\'italienne sans ressaut et parements muraux hydrofugés.',
    stone: 'Ardoise naturelle d\'Atlas',
    finish: 'Brute texturée & Brossée',
    loc: 'Tanger',
    img: '/images/realisation-salle-de-bain.jpg',
    gridClass: 't4'
  },
  {
    id: 5,
    category: 'piscine',
    catLabel: 'Piscine & Aménagement extérieur',
    title: 'Plage de piscine & terrasse panoramique en travertin romain',
    subtitle: 'Extérieur · Travertin',
    shortTitle: 'Terrasse et plage de piscine antidérapantes',
    shortDesc: 'Teintes chaudes miel et beige naturel. Margelles moulurées sur mesure pour bassin à débordement.',
    desc: 'Dallage de 350 m² et margelles de piscine galbées à double débordement en travertin naturel. Confort thermique exceptionnel (la pierre reste fraîche même sous fort ensoleillement) et adhérence pieds nus sécurisée.',
    stone: 'Travertin romain beige',
    finish: 'Brossé vieilli antidérapant R11',
    loc: 'Marrakech',
    img: '/images/realisation-piscine-travertin.jpg',
    gridClass: 't5'
  },
  {
    id: 6,
    category: 'facade',
    catLabel: 'Façade & Architecture urbaine',
    title: 'Façade d\'immeuble résidentiel en pierre de taille',
    subtitle: 'Façade · Pierre de taille',
    shortTitle: 'Parement pierre de taille résidentiel',
    shortDesc: 'Moulures et encadrements de baies vitrées taillés dans la masse pour une pérennité centenaire.',
    desc: 'Habillage de colonnes, bandeaux d\'étages et corniches architecturales d\'une résidence de standing à Bouskoura. Façonnage numérique en atelier et assemblage sur ossature métallique agrée.',
    stone: 'Pierre calcaire de Taza',
    finish: 'Bouchardée fine',
    loc: 'Casablanca (Bouskoura)',
    img: '/images/realisation-facade-taza.jpg'
  },
  {
    id: 7,
    category: 'escalier',
    catLabel: 'Sol intérieur & Réception',
    title: 'Dallage de grand hall & marches en marbre noir et blanc',
    subtitle: 'Sol · Marqueterie',
    shortTitle: 'Dallage en marbre noir & blanc',
    shortDesc: 'Calepinage complexe aux lignes épurées. Cristallisation haute brillance pour une durabilité extrême.',
    desc: 'Calepinage géométrique sur mesure pour le grand salon et hall d\'accueil d\'un riad contemporain. Motifs personnalisés en marqueterie de marbre assemblés et posés sans aucun désaffleurement.',
    stone: 'Marbre Noir Marquina & Blanc Volakas',
    finish: 'Poli cristallisé',
    loc: 'Fès',
    img: '/images/realisation-escalier-marbre.jpg'
  },
  {
    id: 8,
    category: 'cuisine',
    catLabel: 'Cuisine & Aménagement intérieur',
    title: 'Cuisine contemporaine avec crédence en granit flammé',
    subtitle: 'Cuisine · Granit flammé',
    shortTitle: 'Plans de travail en granit flammé',
    shortDesc: 'Harmonie avec les boiseries nobles. Traitement anti-taches oléofuge de qualité professionnelle.',
    desc: 'Ensemble coordonné de plans de travail et crédence pleine hauteur en granit flammé. Texture minérale soyeuse au toucher, découpes précises pour prises de courant et luminaires intégrés.',
    stone: 'Granit gris anthracite flammé',
    finish: 'Flammé brossé doux',
    loc: 'Rabat',
    img: '/images/realisation-cuisine-granit.jpg'
  }
];

export const FAQ_DATA = [
  {
    q: 'Comment choisir entre marbre, granit et travertin ?',
    a: "Le marbre est privilégié pour son esthétique noble et ses veines uniques en intérieur (escaliers, salles de bain, sols de réception). Le granit, d'une dureté incomparable, est recommandé pour les cuisines et zones de fort passage. Le travertin et la pierre de Taza sont idéaux pour les terrasses, margelles de piscine et façades extérieures."
  },
  {
    q: 'Proposez-vous la fourniture seule ou avec la pose ?',
    a: "Nous assurons la prise en charge complète : conseil technique, sélection des blocs ou tranches en carrière, découpe sur mesure dans notre atelier et pose par nos maîtres artisans qualifiés partout au Maroc. Nous pouvons également livrer les tranches débitées selon vos calepinages."
  },
  {
    q: 'Intervenez-vous partout au Maroc ?',
    a: "Oui, nous livrons et réalisons des chantiers dans tout le Royaume : Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, etc. Nos équipes se déplacent pour la prise de cotes au laser et l'installation."
  },
  {
    q: 'Quels sont les délais de fabrication et de livraison ?',
    a: "Selon la nature du projet et la rareté du matériau choisi, nos délais varient généralement entre 10 et 25 jours ouvrés à compter de la validation des cotes et du calepinage technique."
  },
  {
    q: 'Comment entretenir une surface en pierre naturelle ?',
    a: "Nous appliquons systématiquement un traitement hydrofuge et oléofuge de qualité professionnelle à la livraison. Pour l'entretien quotidien, de l'eau tiède avec un savon au pH neutre (savon noir ou de Marseille) suffit amplement. Évitez tous les produits acides (vinaigre, anticalcaire, javel)."
  }
];

export const MARQUEE_WORDS = [
  'Pierre de Taza', 'Marbre', 'Granit', 'Travertin', 'Ardoise', 'Sur mesure', 'Pose & livraison'
];

export const WHATSAPP_PHONE = '212600000000';
