# Projet Final Airtable - Next.js 15This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



Application Next.js 15 complète avec intégration Airtable, TypeScript, shadcn/ui et React Query pour gérer une base de données Airtable de manière moderne et performante.## Getting Started



![Next.js](https://img.shields.io/badge/Next.js-15-black)First, run the development server:

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)```bash

npm run dev

## 🚀 Fonctionnalités# or

yarn dev

- ✅ **CRUD complet** sur Airtable (Create, Read, Update, Delete)# or

- ✅ **API Routes sécurisées** (Next.js 15 App Router)pnpm dev

- ✅ **React Query** pour le cache et la synchronisation# or

- ✅ **Validation Zod** pour tous les formulairesbun dev

- ✅ **shadcn/ui** pour une UI moderne et accessible```

- ✅ **Dashboard interactif** avec graphiques (Recharts)

- ✅ **Tableaux avancés** (TanStack Table) avec tri et paginationOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- ✅ **TypeScript strict** avec types personnalisés

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 📦 Stack Technique

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Frontend

- **Next.js 15** - Framework React avec App Router## Learn More

- **TypeScript** - Typage statique

- **Tailwind CSS** - Styling utilitaireTo learn more about Next.js, take a look at the following resources:

- **shadcn/ui** - Composants UI réutilisables

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

### Gestion des données- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- **Airtable SDK** - API officielle Airtable

- **React Query** - Gestion d'état et cacheYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

- **React Hook Form** - Gestion des formulaires

- **Zod** - Validation de schémas## Deploy on Vercel



### VisualisationThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

- **Recharts** - Graphiques et visualisations

- **TanStack Table** - Tableaux avancésCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

- **Lucide React** - Icônes modernes
- **Sonner** - Notifications toast

## 🛠️ Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Airtable avec une base créée

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd projet-final-airtable
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Airtable

1. Créez un compte sur [Airtable](https://airtable.com)
2. Créez une nouvelle base ou utilisez une base existante
3. Récupérez votre **API Key** :
   - Allez sur https://airtable.com/account
   - Dans "API" → "Generate API key"
4. Récupérez votre **Base ID** :
   - Ouvrez votre base Airtable
   - Dans l'URL : `https://airtable.com/appXXXXXXXXXXXXXX/...`
   - Le Base ID commence par `app...`

### 4. Configuration des variables d'environnement

Copiez le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos informations :

```env
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_NAME=YourTableName
```

### 5. Structure de la table Airtable

Pour que les exemples fonctionnent, créez une table avec les champs suivants :

| Nom du champ | Type | Description |
|--------------|------|-------------|
| name | Single line text | Nom de la personne |
| email | Email | Adresse email |
| status | Single select | Statut (active, inactive, pending) |
| description | Long text | Description optionnelle |

**Options pour le champ "status" :**
- active
- inactive
- pending

### 6. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
projet-final-airtable/
├── app/
│   ├── api/
│   │   └── airtable/
│   │       └── route.ts          # API Routes pour Airtable
│   ├── dashboard/
│   │   └── page.tsx              # Page dashboard avec tableaux et graphiques
│   ├── formulaires/
│   │   └── page.tsx              # Page dédiée aux formulaires
│   ├── layout.tsx                # Layout principal avec Providers
│   ├── page.tsx                  # Page d'accueil
│   └── globals.css               # Styles globaux
├── components/
│   ├── ui/                       # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── sonner.tsx
│   │   └── table.tsx
│   ├── data-table.tsx            # Composant tableau réutilisable
│   ├── form-example.tsx          # Composant formulaire avec validation
│   └── providers.tsx             # Providers React Query + Toaster
├── lib/
│   ├── hooks/
│   │   └── use-airtable.ts       # Hooks React Query pour Airtable
│   ├── airtable.ts               # Configuration et helpers Airtable
│   └── utils.ts                  # Utilitaires (cn, etc.)
├── .env.local                    # Variables d'environnement (à créer)
├── .env.example                  # Exemple de configuration
└── README.md                     # Ce fichier
```

## 🎯 Utilisation

### API Routes

#### GET - Récupérer des records

```typescript
// Tous les records
GET /api/airtable?tableName=YourTable

// Un record spécifique
GET /api/airtable?tableName=YourTable&recordId=recXXXXXXXX

// Avec filtres
GET /api/airtable?tableName=YourTable&filterByFormula={status}='active'&maxRecords=10
```

#### POST - Créer un record

```typescript
POST /api/airtable
Body: {
  "tableName": "YourTable",
  "fields": {
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active"
  }
}
```

#### PUT/PATCH - Mettre à jour un record

```typescript
PUT /api/airtable
Body: {
  "tableName": "YourTable",
  "recordId": "recXXXXXXXX",
  "fields": {
    "status": "inactive"
  }
}
```

#### DELETE - Supprimer un record

```typescript
DELETE /api/airtable
Body: {
  "tableName": "YourTable",
  "recordId": "recXXXXXXXX"
}
```

### Hooks React Query

```typescript
import { 
  useAirtableRecords, 
  useCreateRecord, 
  useUpdateRecord, 
  useDeleteRecord 
} from '@/lib/hooks/use-airtable';

// Récupérer des records
const { data, isLoading, error } = useAirtableRecords({
  tableName: 'YourTable',
  filterByFormula: "{status}='active'"
});

// Créer un record
const createMutation = useCreateRecord();
await createMutation.mutateAsync({
  tableName: 'YourTable',
  fields: { name: 'John' }
});

// Mettre à jour un record
const updateMutation = useUpdateRecord();
await updateMutation.mutateAsync({
  tableName: 'YourTable',
  recordId: 'recXXX',
  fields: { status: 'inactive' }
});

// Supprimer un record
const deleteMutation = useDeleteRecord();
await deleteMutation.mutateAsync({
  tableName: 'YourTable',
  recordId: 'recXXX'
});
```

## 🎨 Personnalisation

### Adapter le formulaire à votre structure

Modifiez le schéma Zod dans `components/form-example.tsx` :

```typescript
const formSchema = z.object({
  // Vos champs personnalisés
  customField: z.string().min(1),
  anotherField: z.number(),
  // etc.
});
```

### Adapter les colonnes du tableau

Modifiez les colonnes dans `app/dashboard/page.tsx` :

```typescript
const columns: ColumnDef<AirtableRecord<MyRecord>>[] = [
  {
    accessorKey: 'fields.yourField',
    header: 'Votre Champ',
  },
  // Ajoutez vos colonnes
];
```

### Types TypeScript personnalisés

Définissez vos types dans `lib/airtable.ts` ou créez un fichier `types.ts` :

```typescript
export interface MyCustomRecord extends BaseFields {
  name: string;
  customField: string;
  // Vos champs
}
```

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

## 🤝 Contribution

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
