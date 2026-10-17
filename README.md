# SUTRAVOMAR STONE LUXE — Application React (Vite)

Site vitrine de luxe pour **SUTRAVOMAR STONE LUXE** (Marbre, granit & pierre naturelle au Maroc) développé en **React + Vite**.

## 🚀 Fonctionnalités incluses

- **Hero avec vidéo d'arrière-plan** : révélation animée du logo en fondu d'opacité avec masquage radial.
- **Textures minérales procédurales SVG** : génération algorithmique temps réel via filtres `feTurbulence` (Marbre, Granit, Travertin, Pierre de Taza, Ardoise).
- **Sélecteur interactif de matériaux et finitions** : visualisation dynamique de la dalle avec effet de brillance poli/brossé/adouci.
- **Grille Bento des réalisations** sur la page d'accueil avec transition fluide vers la galerie complète.
- **Page dédiée `/realisations`** :
  - Filtrage instantané par catégorie (*Façades*, *Escaliers & Sols*, *Cuisines & Plans*, *Salles de bain*, *Piscines & Terrasses*).
  - Modale Lightbox détaillée avec caractéristiques techniques et bouton de contact pré-rempli.
- **Bouton WhatsApp flottant officiel** avec pictogramme vectoriel officiel SVG `#25D366`.
- **Formulaire de devis express** : génération de message structuré WhatsApp automatique.
- **Navigation mobile responsive avec menu hamburger plein écran** et verrouillage du défilement.
- **Prêt pour déploiement Vercel** avec configuration SPA `vercel.json`.

---

## 💻 Démarrage en local

1. Ouvrez un terminal dans le dossier `react-app` :
   ```bash
   cd react-app
   ```
2. Installez les dépendances (si pas déjà fait) :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
4. Ouvrez votre navigateur sur l'adresse indiquée (ex: `http://localhost:5173`).

---

## 🌐 Déploiement sur Vercel

### Option 1 : Déploiement direct par Git (Recommandé)
1. Créez un dépôt GitHub et poussez le contenu du dossier `react-app` (ou le projet racine avec `Root Directory` configuré sur `react-app`).
2. Sur [Vercel](https://vercel.com), importez votre dépôt.
3. Framework Preset : **Vite** (détecté automatiquement).
4. Cliquez sur **Deploy**.

### Option 2 : Déploiement via le CLI Vercel
```bash
cd react-app
npx vercel
```
