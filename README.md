<div align="center">
  <img src="public/assets/logo/logow.jpg" alt="Tabac Presse Le Soler Logo" width="200" />
  <h1>Tabac Presse - Le Soler</h1>
  <p>Une solution moderne et accessible pour la gestion d'un commerce de proximité.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-blue?logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel" alt="Vercel" />
  </p>
</div>

---

## 🌟 Présentation

Ce projet est une application web complète dédiée au **Tabac Presse Le Soler**. Elle permet aux clients de consulter les services disponibles, les dernières actualités du commerce, ainsi que les horaires d'ouverture en temps réel. L'application intègre également un espace d'administration sécurisé pour une gestion simplifiée au quotidien.

## 🚀 Fonctionnalités Clés

### 💻 Espace Client
- **Hero Section Dynamique** : Effet typewriter pour un accueil moderne.
- **Gestion des News** : Restez informé des arrivages et des services (PMU, FDJ, Nickel, etc.).
- **Carte Interactive** : Localisation précise via Leaflet/Google Maps integration.
- **Menu d'Accessibilité** : Personnalisation de l'affichage (Mode sombre, contraste, taille de police).
- **Services Dédiés** : Présentation optimisée pour mobile et desktop.

### 🔐 Espace Administration
- **Dashboard de Gestion** : Interface complète pour modifier les contenus du site.
- **Gestion des Horaires** : Mise à jour instantanée des créneaux d'ouverture.
- **Publication de News** : Système de publication d'articles simple et efficace.
- **Gestion des Services** : Contrôle total sur la liste des prestations proposées.

## 🛠️ Tech Stack

- **Framework** : [Next.js 14 (App Router)](https://nextjs.org/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Composants UI** : Framer Motion (Animations), Lucide React (Icons).
- **Déploiement** : [Vercel](https://vercel.com/)

## ⚙️ Installation et Configuration

Pour lancer le projet localement :

1. **Cloner le projet**
   ```bash
   git clone https://github.com/benjii66/Tabac.git
   cd Tabac
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet et ajoutez vos clés (ex: Base de données, API de news, etc.).
   
   > [!IMPORTANT]
   > Ne poussez jamais votre fichier `.env` sur le dépôt distant ! (Il est déjà ajouté au `.gitignore`).

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   Rendez-vous sur [http://localhost:3000](http://localhost:3000).

---

<p align="center">Conçu avec ❤️ pour le Tabac Presse Le Soler.</p>
