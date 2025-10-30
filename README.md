# Design.academy - Plateforme de Gestion de Formation# Projet Final Airtable - Next.js 15This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Application Next.js 15 complète pour gérer un centre de formation, connectée à Airtable. Gestion des cours, sessions, inscriptions, et émargement numérique conforme Qualiopi.



![Next.js](https://img.shields.io/badge/Next.js-15-black)Application Next.js 15 complète avec intégration Airtable, TypeScript, shadcn/ui et React Query pour gérer une base de données Airtable de manière moderne et performante.## Getting Started

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

![Airtable](https://img.shields.io/badge/Airtable-Intégré-orange)

![Next.js](https://img.shields.io/badge/Next.js-15-black)First, run the development server:

## 🎯 Objectif

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

Interface web pour Design.academy qui se connecte directement à Airtable pour :

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)```bash

- 📚 **Gérer les cours** et leurs sessions

- 👨‍🎓 **Suivre les étudiants** et leurs inscriptionsnpm run dev

- ✅ **Émargement numérique** avec signature électronique

- 📊 **Dashboard admin** avec statistiques et taux de présence## 🚀 Fonctionnalités# or

- 📋 **Conformité Qualiopi** avec horodatage et traçabilité

yarn dev

## 🚀 Fonctionnalités

- ✅ **CRUD complet** sur Airtable (Create, Read, Update, Delete)# or

- ✅ **Catalogue de cours** avec filtres par niveau, sujet, formateur

- ✅ **Détails complets** de chaque cours (programme, objectifs, prérequis)- ✅ **API Routes sécurisées** (Next.js 15 App Router)pnpm dev

- ✅ **Gestion des sessions** par cours

- ✅ **Inscription d'étudiants** aux formations- ✅ **React Query** pour le cache et la synchronisation# or

- ✅ **Émargement public** pour que les étudiants confirment leur présence

- ✅ **Dashboard admin** avec statistiques et graphiques- ✅ **Validation Zod** pour tous les formulairesbun dev

- ✅ **Feuilles de présence** numériques par session

- ✅ **API sécurisée** côté serveur (clés Airtable protégées)- ✅ **shadcn/ui** pour une UI moderne et accessible```

- ✅ **SSR/SSG** pour performances optimales

- ✅ **UI moderne** avec shadcn/ui et Tailwind CSS- ✅ **Dashboard interactif** avec graphiques (Recharts)



## 📦 Stack Technique- ✅ **Tableaux avancés** (TanStack Table) avec tri et paginationOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.



### Frontend- ✅ **TypeScript strict** avec types personnalisés

- **Next.js 15** - App Router avec SSR/SSG

- **TypeScript** - Typage strictYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Tailwind CSS** - Styling moderne

- **shadcn/ui** - Composants UI accessibles## 📦 Stack Technique



### Gestion des donnéesThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **Airtable SDK** - Connexion directe à Airtable

- **React Query (TanStack Query)** - Cache et synchronisation### Frontend

- **React Hook Form** - Gestion des formulaires

- **Zod** - Validation de schémas- **Next.js 15** - Framework React avec App Router## Learn More



### Visualisation- **TypeScript** - Typage statique

- **Recharts** - Graphiques de présence

- **TanStack Table** - Tableaux avancés- **Tailwind CSS** - Styling utilitaireTo learn more about Next.js, take a look at the following resources:

- **Lucide React** - Icônes

- **Sonner** - Notifications toast- **shadcn/ui** - Composants UI réutilisables

- **date-fns** - Gestion des dates (locale FR)

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

## 🗂️ Structure Airtable Requise

### Gestion des données- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

Créez une base Airtable avec les 5 tables suivantes :

- **Airtable SDK** - API officielle Airtable

### 1️⃣ Table **Étudiants**

| Champ | Type | Description |- **React Query** - Gestion d'état et cacheYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

|-------|------|-------------|

| Prénom | Single line text | Prénom de l'étudiant |- **React Hook Form** - Gestion des formulaires

| Nom | Single line text | Nom de l'étudiant |

| Email | Email | Adresse email |- **Zod** - Validation de schémas## Deploy on Vercel

| Téléphone | Phone number | Numéro de téléphone (optionnel) |

| Adresse | Long text | Adresse complète (optionnel) |

| Notes | Long text | Notes internes (optionnel) |

### VisualisationThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### 2️⃣ Table **Cours**

| Champ | Type | Description |- **Recharts** - Graphiques et visualisations

|-------|------|-------------|

| Nom du cours | Single line text | Titre du cours |- **TanStack Table** - Tableaux avancésCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

| Sujet | Single line text | Thématique (optionnel) |

| Niveau | Single select | Débutant / Intermédiaire / Avancé / Expert |- **Lucide React** - Icônes modernes

| Date de début | Date | Date de démarrage du cours |- **Sonner** - Notifications toast

| Durée (jours) | Number | Durée en jours |

| Formateur | Single line text | Nom du formateur |## 🛠️ Installation

| Objectifs pédagogiques | Long text | Objectifs de la formation |

| Prérequis | Long text | Prérequis nécessaires |### Prérequis

| Programme | Long text | Programme détaillé |

| Modalité | Single select | Présentiel / Distanciel / Hybride |- Node.js 18+ 

| Sessions | Link to **Sessions** | Lien vers les sessions |- npm ou yarn

| Inscriptions | Link to **Inscriptions** | Lien vers les inscriptions |- Un compte Airtable avec une base créée



### 3️⃣ Table **Sessions**### 1. Cloner le projet

| Champ | Type | Description |

|-------|------|-------------|```bash

| Nom de la session | Single line text | Ex: "Jour 1", "Module 2" |git clone <votre-repo>

| Date de la session | Date | Date de la session |cd projet-final-airtable

| Cours | Link to **Cours** | Lien vers le cours parent |```

| Présences | Link to **Présences** | Lien vers les présences |

### 2. Installer les dépendances

### 4️⃣ Table **Inscriptions**

| Champ | Type | Description |```bash

|-------|------|-------------|npm install

| Étudiant | Link to **Étudiants** | Étudiant inscrit |```

| Cours | Link to **Cours** | Cours sélectionné |

| Date d'inscription | Date | Date d'inscription |### 3. Configuration Airtable

| Statut | Single select | Inscrit / Terminé / Annulé |

1. Créez un compte sur [Airtable](https://airtable.com)

### 5️⃣ Table **Présences**2. Créez une nouvelle base ou utilisez une base existante

| Champ | Type | Description |3. Récupérez votre **API Key** :

|-------|------|-------------|   - Allez sur https://airtable.com/account

| Session | Link to **Sessions** | Session concernée |   - Dans "API" → "Generate API key"

| Étudiant | Link to **Étudiants** | Étudiant présent |4. Récupérez votre **Base ID** :

| Présent ? | Checkbox | Coché si présent |   - Ouvrez votre base Airtable

| Signature | Single line text | Signature électronique |   - Dans l'URL : `https://airtable.com/appXXXXXXXXXXXXXX/...`

| Horodatage | Date with time | Timestamp de validation |   - Le Base ID commence par `app...`

| Date de la session (from Sessions) | Lookup | Depuis Sessions → Date de la session |

### 4. Configuration des variables d'environnement

## 🛠️ Installation

Copiez le fichier `.env.example` en `.env.local` :

### Prérequis

```bash

- Node.js 18+cp .env.example .env.local

- npm```

- Un compte Airtable avec une base configurée

Éditez `.env.local` avec vos informations :

### 1. Cloner le projet

```env

```bashAIRTABLE_API_KEY=keyXXXXXXXXXXXXXX

git clone <votre-repo>AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

cd projet-final-airtableAIRTABLE_TABLE_NAME=YourTableName

``````



### 2. Installer les dépendances### 5. Structure de la table Airtable



```bashPour que les exemples fonctionnent, créez une table avec les champs suivants :

npm install

```| Nom du champ | Type | Description |

|--------------|------|-------------|

### 3. Configuration Airtable| name | Single line text | Nom de la personne |

| email | Email | Adresse email |

1. Créez votre base Airtable avec les 5 tables décrites ci-dessus| status | Single select | Statut (active, inactive, pending) |

2. Récupérez votre **API Key** : https://airtable.com/account| description | Long text | Description optionnelle |

3. Récupérez votre **Base ID** depuis l'URL de votre base : `https://airtable.com/appXXXXXXXXXXXXXX/...`

**Options pour le champ "status" :**

### 4. Configuration des variables d'environnement- active

- inactive

Éditez le fichier `.env.local` avec vos identifiants :- pending



```env### 6. Lancer le serveur de développement

# Configuration Airtable - Design.academy

AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX```bash

AIRTABLE_BASE_ID=appXXXXXXXXXXXXXXnpm run dev

```

# Noms des tables Airtable

AIRTABLE_TABLE_ETUDIANTS=ÉtudiantsOuvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

AIRTABLE_TABLE_COURS=Cours

AIRTABLE_TABLE_SESSIONS=Sessions## 📁 Structure du Projet

AIRTABLE_TABLE_INSCRIPTIONS=Inscriptions

AIRTABLE_TABLE_PRESENCES=Présences```

```projet-final-airtable/

├── app/

### 5. Lancer l'application│   ├── api/

│   │   └── airtable/

```bash│   │       └── route.ts          # API Routes pour Airtable

npm run dev│   ├── dashboard/

```│   │   └── page.tsx              # Page dashboard avec tableaux et graphiques

│   ├── formulaires/

Ouvrez [http://localhost:3000](http://localhost:3000)│   │   └── page.tsx              # Page dédiée aux formulaires

│   ├── layout.tsx                # Layout principal avec Providers

## 📁 Structure du Projet│   ├── page.tsx                  # Page d'accueil

│   └── globals.css               # Styles globaux

```├── components/

projet-final-airtable/│   ├── ui/                       # Composants shadcn/ui

├── app/│   │   ├── button.tsx

│   ├── api/│   │   ├── card.tsx

│   │   └── airtable/│   │   ├── dialog.tsx

│   │       └── route.ts              # API Routes CRUD sécurisées│   │   ├── form.tsx

│   ├── cours/│   │   ├── input.tsx

│   │   ├── page.tsx                  # Liste des cours│   │   ├── label.tsx

│   │   └── [id]/│   │   ├── select.tsx

│   │       └── page.tsx              # Détail d'un cours│   │   ├── sonner.tsx

│   ├── dashboard/│   │   └── table.tsx

│   │   └── page.tsx                  # Dashboard admin│   ├── data-table.tsx            # Composant tableau réutilisable

│   ├── formulaires/│   ├── form-example.tsx          # Composant formulaire avec validation

│   │   └── [sessionId]/│   └── providers.tsx             # Providers React Query + Toaster

│   │       └── page.tsx              # Émargement public├── lib/

│   ├── layout.tsx                    # Layout principal│   ├── hooks/

│   └── page.tsx                      # Page d'accueil│   │   └── use-airtable.ts       # Hooks React Query pour Airtable

├── components/│   ├── airtable.ts               # Configuration et helpers Airtable

│   ├── ui/                           # Composants shadcn/ui│   └── utils.ts                  # Utilitaires (cn, etc.)

│   ├── custom/├── .env.local                    # Variables d'environnement (à créer)

│   │   ├── AttendanceChart.tsx       # Graphique de présence├── .env.example                  # Exemple de configuration

│   │   ├── AttendanceForm.tsx        # Formulaire d'émargement└── README.md                     # Ce fichier

│   │   ├── CourseTable.tsx           # Tableau des cours```

│   │   ├── DashboardCards.tsx        # Cartes statistiques

│   │   ├── EnrollmentForm.tsx        # Formulaire d'inscription## 🎯 Utilisation

│   │   └── SessionAttendanceTable.tsx # Tableau de présences

│   ├── data-table.tsx                # Tableau réutilisable TanStack### API Routes

│   └── providers.tsx                 # Providers React Query

├── lib/#### GET - Récupérer des records

│   ├── airtable.ts                   # Helpers CRUD Airtable + types

│   ├── schemas.ts                    # Schémas Zod```typescript

│   ├── hooks/// Tous les records

│   │   └── use-airtable.ts           # Hooks React QueryGET /api/airtable?tableName=YourTable

│   └── utils.ts                      # Utilitaires

└── .env.local                        # Configuration (à créer)// Un record spécifique

```GET /api/airtable?tableName=YourTable&recordId=recXXXXXXXX



## 🎯 Pages Principales// Avec filtres

GET /api/airtable?tableName=YourTable&filterByFormula={status}='active'&maxRecords=10

### 🏠 Page d'accueil - `/````

Présentation de la plateforme avec accès rapides

#### POST - Créer un record

### 📚 Catalogue des cours - `/cours`

- Liste tous les cours disponibles```typescript

- Filtres par niveau, sujet, formateurPOST /api/airtable

- Statistiques globalesBody: {

  "tableName": "YourTable",

### 📖 Détail d'un cours - `/cours/[id]`  "fields": {

- Informations complètes (programme, objectifs, prérequis)    "name": "John Doe",

- Liste des sessions planifiées    "email": "john@example.com",

- Étudiants inscrits    "status": "active"

- Accès aux feuilles d'émargement  }

}

### ✍️ Émargement public - `/formulaires/[sessionId]````

- Page publique accessible aux étudiants

- Sélection du nom + signature électronique#### PUT/PATCH - Mettre à jour un record

- Horodatage automatique (conformité Qualiopi)

```typescript

### 📊 Dashboard Admin - `/dashboard`PUT /api/airtable

- Statistiques : nombre d'étudiants, cours, sessionsBody: {

- Taux de présence moyen  "tableName": "YourTable",

- Graphique de présence par cours  "recordId": "recXXXXXXXX",

- Prochaines sessions  "fields": {

- Récapitulatif des cours    "status": "inactive"

  }

## 💻 Utilisation}

```

### API Routes

#### DELETE - Supprimer un record

Les API Routes sont accessibles via `/api/airtable` :

```typescript

```typescriptDELETE /api/airtable

// GET - Récupérer des recordsBody: {

GET /api/airtable?tableName=Cours  "tableName": "YourTable",

  "recordId": "recXXXXXXXX"

// POST - Créer un record}

POST /api/airtable```

Body: { "tableName": "Étudiants", "fields": { ... } }

### Hooks React Query

// PUT - Mettre à jour

PUT /api/airtable```typescript

Body: { "tableName": "...", "recordId": "...", "fields": { ... } }import { 

  useAirtableRecords, 

// DELETE - Supprimer  useCreateRecord, 

DELETE /api/airtable  useUpdateRecord, 

Body: { "tableName": "...", "recordId": "..." }  useDeleteRecord 

```} from '@/lib/hooks/use-airtable';



### Hooks React Query// Récupérer des records

const { data, isLoading, error } = useAirtableRecords({

```typescript  tableName: 'YourTable',

import {  filterByFormula: "{status}='active'"

  useAirtableRecords,});

  useCreateRecord,

  useUpdateRecord,// Créer un record

  useDeleteRecordconst createMutation = useCreateRecord();

} from '@/lib/hooks/use-airtable';await createMutation.mutateAsync({

  tableName: 'YourTable',

// Récupérer des cours  fields: { name: 'John' }

const { data: cours } = useAirtableRecords<CoursFields>({});

  tableName: 'Cours'

});// Mettre à jour un record

const updateMutation = useUpdateRecord();

// Créer une inscriptionawait updateMutation.mutateAsync({

const createMutation = useCreateRecord();  tableName: 'YourTable',

await createMutation.mutateAsync({  recordId: 'recXXX',

  tableName: 'Inscriptions',  fields: { status: 'inactive' }

  fields: { ... }});

});

```// Supprimer un record

const deleteMutation = useDeleteRecord();

## 🔒 Sécuritéawait deleteMutation.mutateAsync({

  tableName: 'YourTable',

- ✅ **Clés API côté serveur uniquement** - Jamais exposées au client  recordId: 'recXXX'

- ✅ **Validation Zod** sur tous les formulaires});

- ✅ **Types TypeScript stricts** pour prévenir les erreurs```

- ✅ **Variables d'environnement** sécurisées

## 🎨 Personnalisation

## 📋 Conformité Qualiopi

### Adapter le formulaire à votre structure

L'application respecte les exigences de traçabilité Qualiopi :

Modifiez le schéma Zod dans `components/form-example.tsx` :

- **Émargement numérique** avec signature électronique

- **Horodatage automatique** de chaque présence```typescript

- **Traçabilité complète** des inscriptions et présencesconst formSchema = z.object({

- **Exports possibles** depuis Airtable  // Vos champs personnalisés

  customField: z.string().min(1),

## 🎨 Personnalisation  anotherField: z.number(),

  // etc.

### Adapter les champs Airtable});

```

Si vos champs Airtable ont des noms différents, modifiez les types dans `lib/airtable.ts` :

### Adapter les colonnes du tableau

```typescript

export interface CoursFields extends BaseFields {Modifiez les colonnes dans `app/dashboard/page.tsx` :

  'Nom du cours': string;

  // ... vos champs personnalisés```typescript

}const columns: ColumnDef<AirtableRecord<MyRecord>>[] = [

```  {

    accessorKey: 'fields.yourField',

### Modifier les schémas de validation    header: 'Votre Champ',

  },

Adaptez les schémas Zod dans `lib/schemas.ts` selon vos besoins.  // Ajoutez vos colonnes

];

## 🐛 Dépannage```



### Erreur "AIRTABLE_API_KEY manquante"### Types TypeScript personnalisés

Vérifiez que le fichier `.env.local` existe et contient vos clés.

Définissez vos types dans `lib/airtable.ts` ou créez un fichier `types.ts` :

### Erreur 401 Unauthorized

Votre API Key Airtable est invalide. Générez-en une nouvelle.```typescript

export interface MyCustomRecord extends BaseFields {

### Erreur 404 Table not found  name: string;

Le nom de la table ne correspond pas. Vérifiez les noms dans `.env.local`.  customField: string;

  // Vos champs

### Les données ne s'affichent pas}

1. Vérifiez que vos tables Airtable contiennent des données```

2. Ouvrez la console du navigateur pour voir les erreurs

3. Vérifiez que les noms de champs correspondent exactement## 🔒 Sécurité



## 📚 Ressources- ✅ **Clés API côté serveur uniquement** - Jamais exposées au client

- ✅ **Validation Zod** - Toutes les entrées utilisateur sont validées

- [Documentation Next.js](https://nextjs.org/docs)- ✅ **Variables d'environnement** - Configuration sécurisée

- [Documentation Airtable API](https://airtable.com/developers/web/api/introduction)- ✅ **Types TypeScript stricts** - Prévention des erreurs

- [shadcn/ui](https://ui.shadcn.com/)

- [TanStack Query](https://tanstack.com/query/latest)## 📚 Ressources

- [Zod](https://zod.dev/)

- [Documentation Next.js](https://nextjs.org/docs)

## 🤝 Support- [Documentation Airtable API](https://airtable.com/developers/web/api/introduction)

- [shadcn/ui](https://ui.shadcn.com/)

Pour toute question ou problème, consultez la documentation ou créez une issue.- [React Query](https://tanstack.com/query/latest)

- [Zod](https://zod.dev/)

---

## 🤝 Contribution

**Design.academy** - Plateforme de gestion de formation Next.js 15 + Airtable

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 License

MIT

## 🐛 Dépannage

### Erreur "AIRTABLE_API_KEY manquante"

Vérifiez que votre fichier `.env.local` existe et contient les bonnes variables.

### Erreur 401 Unauthorized

Votre API Key Airtable est invalide. Générez-en une nouvelle sur votre compte Airtable.

### Erreur 404 Table not found

Le nom de la table dans `AIRTABLE_TABLE_NAME` ne correspond pas à une table existante dans votre base.

### Les données ne s'affichent pas

1. Vérifiez que votre table Airtable contient des données
2. Ouvrez la console du navigateur pour voir les erreurs
3. Vérifiez que les noms de champs correspondent à votre schéma

---

**Créé avec ❤️ avec Next.js 15, TypeScript, et Airtable**
