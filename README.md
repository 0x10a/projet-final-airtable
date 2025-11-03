# Design.academy - Plateforme de Gestion de Formation

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Airtable](https://img.shields.io/badge/Airtable-Intégré-orange)

Application Next.js 15 complète pour gérer un centre de formation, connectée à Airtable. Gestion des cours, sessions, inscriptions, et émargement numérique conforme Qualiopi.

## 🎯 Objectif

Interface web pour Design.academy qui se connecte directement à Airtable pour :

- 📚 **Gérer les cours** et leurs sessions
- 👨‍🎓 **Suivre les étudiants** et leurs inscriptions
- ✅ **Émargement numérique** avec signature électronique
- 📊 **Dashboard admin** avec statistiques et taux de présence
- 📋 **Conformité Qualiopi** avec horodatage et traçabilité

## 🚀 Fonctionnalités

- ✅ **CRUD complet** sur Airtable (Create, Read, Update, Delete)
- ✅ **Catalogue de cours** avec filtres par niveau, sujet, formateur
- ✅ **Gestion des sessions** par cours
- ✅ **Inscription d'étudiants** aux formations
- ✅ **Émargement public** pour que les étudiants confirment leur présence
- ✅ **Dashboard admin** avec statistiques et graphiques
- ✅ **Feuilles de présence** numériques par session
- ✅ **API Routes sécurisées** (Next.js 15 App Router)
- ✅ **React Query** pour le cache et la synchronisation
- ✅ **Validation Zod** pour tous les formulaires
- ✅ **UI moderne** avec shadcn/ui et Tailwind CSS
- ✅ **Tableaux avancés** (TanStack Table) avec tri et pagination
- ✅ **TypeScript strict** avec types personnalisés

## 📦 Stack Technique

### Frontend
- **Next.js 15** - App Router avec SSR/SSG
- **TypeScript** - Typage strict
- **Tailwind CSS** - Styling moderne
- **shadcn/ui** - Composants UI accessibles

### Gestion des données
- **Airtable SDK** - Connexion directe à Airtable
- **React Query (TanStack Query)** - Cache et synchronisation
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation de schémas

### Visualisation
- **Recharts** - Graphiques de présence
- **TanStack Table** - Tableaux avancés
- **Lucide React** - Icônes
- **Sonner** - Notifications toast
- **date-fns** - Gestion des dates (locale FR)

## 🛠️ Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Un compte Airtable avec une base configurée

### Étapes

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd projet-final-airtable
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration**

Créez un fichier `.env.local` :
```env
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

4. **Lancer le projet**
```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🔒 Sécurité

- ✅ **Clés API côté serveur uniquement** - Jamais exposées au client
- ✅ **Validation Zod** - Toutes les entrées utilisateur sont validées
- ✅ **Variables d'environnement** - Configuration sécurisée
- ✅ **Types TypeScript stricts** - Prévention des erreurs

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Airtable API](https://airtable.com/developers/web/api/introduction)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)

---

**Design.academy** - Plateforme de gestion de formation Next.js 15 + Airtable
