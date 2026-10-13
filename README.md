# Cartographe de la Passe du Dragon 🗺️⚡
> **Atlas interactif et gestionnaire de campagne pour RuneQuest Glorantha (1625 ST)**  
> Inspiré de l'ergonomie et des outils tactiques de *Project Zomboid Map Project*, adapté à l'univers mythologique de Glorantha (Chaosium / Greg Stafford).

[![GitHub Pages Deployment](https://github.com/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🌟 Fonctionnalités Principales

### 🗺️ Cartographie & Outils Tactiques (Style Project Zomboid Map)
- **Navigation fluide** : Zoom infini, centrage, glisser-déposer, mode plein écran, coordonnées précises en temps réel ($X\%, Y\%$).
- **Gestion des Étage / Niveaux de hauteur** :
  - Niveau 0 : Sol & Basses Terres
  - Niveau +1 : Plateaux & Contreforts
  - Niveau +2 : Hautes Crêtes & Pics des Tempêtes
  - Niveau -1 : Souterrains & Cavernes des Ombres
- **Outils de Dessin Tactique sur la carte** :
  - Lignes tactiques et flèches de manœuvre
  - Polygones de délimitation de territoires ou campements
  - Cercles de rayon & zones de danger (avec alertes de proximité)
  - Gomme et export/import d'annotations
- **Minimap Radar interactive** : Vue d'ensemble miniature en bas à droite avec cadrage du viewport actif et repères visibles.
- **Calculateur de Voyage & Itinéraire** :
  - Distance en kilomètres et lieues sartariennes
  - Estimation de la durée de marche selon le mode (Pied, Cheval, Chariot, Vol magique)
- **Météo Dynamique de Glorantha** : Climat changeant selon les 5 saisons sacrées (Fertilité, Mer, Feu, Terre, Ténèbres, Tempête, Saison Sacrée).
- **Rendu Haute Résolution de Plans & PDF** : Import et conversion haute fidélité via moteur PDF.js intégré avec sauvegarde IndexedDB.

### 📍 Gestion des Lieux & Points d'Intérêt (POIs)
- **Répertoire officiel** : Villes libres de Sartar (Boldhome, Jonville, Gué-du-Danger...), forteresses de Tarsh, terres trolls de Dagori Inkarth, marais des Hautes Terres.
- **Création & Édition de Lieux personnalisés** :
  - Titre, description, niveau de sécurité, cultes influents, affinités runiques, trésors et rumeurs.
  - Formulaire de création rapide avec clic droit direct sur la carte (*« Créer un lieu ici »*).
  - Ajout d'illustrations et photos de lieux intégrées.
- **Filtres multicritères** : Filtrage par catégorie (Villes, Temples, Ruines, Dangers, Tribus...), par région ou par recherche textuelle instantanée.

### 📜 Gestionnaire de Campagne & Outils de Maître de Jeu (MJ)
- **Mode Maître de Jeu (GM)** avec notes secrètes et visibilité exclusive.
- **Horloges de Menace** (Threat Clocks) pour mesurer l'avancement des complots Lunars ou Trolls.
- **Fiches de Héros & PJ** : Suivi des points de vie, magie, runes et cultes.
- **Suivi de Quêtes & Missions** par région et par statut (Active, Terminée, Échouée).
- **Générateur Procédural Intégré** :
  - Fiches de PNJ sartariens complets (Runes %, Passions, Équipement, Secret pour le MJ)
  - Tables de rencontres aléatoires régionales tactiques
  - Accroches d'aventures et intrigues mythologiques
- **Compatibilité Totale Hors-Ligne & GitHub Pages** : Les générateurs fonctionnent aussi bien en mode autonome côté client (statique) qu'avec l'API Google Gemini en mode serveur.

---

## 🚀 Déploiement sur GitHub

Ce projet est configuré pour être **immédiatement compatible avec GitHub et GitHub Pages** :
- Chemin de base relatif configuré dans `vite.config.ts` (`base: './'`).
- Workflow GitHub Actions prêt à l'emploi dans `.github/workflows/deploy.yml`.
- Moteur de génération procédural et requêtes CORS vers Glorantha Fandom Wiki fonctionnant sans serveur backend requis.

### Option A : Déploiement Automatique sur GitHub Pages (Recommandé)

1. **Créez un dépôt sur GitHub** et poussez le code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Cartographe de la Passe du Dragon"
   git branch -M main
   git remote add origin https://github.com/<votre-utilisateur>/<votre-depot>.git
   git push -u origin main
   ```

2. **Activez GitHub Pages avec GitHub Actions** :
   - Allez sur votre dépôt GitHub dans **Settings** > **Pages**.
   - Sous **Build and deployment** > **Source**, sélectionnez **GitHub Actions**.
   - Chaque `git push` sur `main` construira et déploiera automatiquement l'application sur `https://<votre-utilisateur>.github.io/<votre-depot>/` !

---

### Option B : Lancement en Local

1. **Cloner le projet** :
   ```bash
   git clone https://github.com/<votre-utilisateur>/<votre-depot>.git
   cd <votre-depot>
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application s'ouvre sur `http://localhost:3000`.

4. **Variables d'environnement optionnelles** :
   Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
   Renseignez votre clé `GEMINI_API_KEY` si vous souhaitez utiliser l'IA générative Gemini au lieu du moteur procédural local.

---

## 📦 Scripts Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance l'application en mode développement complet (serveur Express + Vite) |
| `npm run build:static` | Compile le site statique prêt pour **GitHub Pages**, Vercel, Netlify ou hébergement statique (dossier `dist/`) |
| `npm run build` | Compile à la fois le client web et le serveur Node.js `dist/server.cjs` |
| `npm start` | Lance le serveur de production Node.js |
| `npm run preview` | Prévisualise localement le build statique |
| `npm run lint` | Valide les types TypeScript (`tsc --noEmit`) |

---

## 🗄️ Sauvegarde & Confidentialité

- Toutes les données de campagne, dessins tactiques, lieux créés et notes de MJ sont conservées directement dans votre navigateur via **LocalStorage** et **IndexedDB** (aucun compte requis).
- Vous pouvez exporter et importer l'intégralité de votre campagne à tout moment au format **JSON** via l'onglet *Outils MJ*.

---

## ⚖️ Licence & Crédits
- **Univers** : Glorantha et RuneQuest sont des marques déposées de **Moon Design Publications / Chaosium Inc.**
- **Interface & Code** : Distribué pour les joueurs et maîtres de jeu passionnés de RuneQuest Glorantha.
