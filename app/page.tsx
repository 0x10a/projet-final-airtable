import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileText, BarChart3, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Projet Final Airtable
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Application Next.js 15 avec intégration complète d'Airtable, TypeScript, et shadcn/ui
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                Voir le Dashboard
              </Button>
            </Link>
            <Link href="/formulaires">
              <Button size="lg" variant="outline">
                <FileText className="mr-2 h-5 w-5" />
                Formulaires
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Database className="h-10 w-10 mb-2 text-blue-600" />
              <CardTitle>Intégration Airtable</CardTitle>
              <CardDescription>
                SDK officiel avec helpers CRUD complets et types TypeScript
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  API sécurisée côté serveur
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Opérations GET, POST, PUT, DELETE
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Filtrage et tri avancés
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-purple-600" />
              <CardTitle>React Query</CardTitle>
              <CardDescription>
                Gestion d'état avec cache automatique et synchronisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Hooks personnalisés useAirtable
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Invalidation automatique du cache
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  États de chargement et erreurs
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 mb-2 text-green-600" />
              <CardTitle>Dashboard Complet</CardTitle>
              <CardDescription>
                Interface riche avec graphiques et tableaux interactifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Visualisation avec Recharts
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Tableaux TanStack avec tri
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  CRUD inline avec dialogs
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Stack Technique</CardTitle>
            <CardDescription>Technologies et bibliothèques utilisées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Next.js 15 (App Router)</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui</li>
                  <li>• Lucide React (icônes)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bibliothèques</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Airtable SDK</li>
                  <li>• React Query</li>
                  <li>• React Hook Form</li>
                  <li>• Zod (validation)</li>
                  <li>• Recharts (graphiques)</li>
                  <li>• TanStack Table</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm">
            Consultez le README.md pour les instructions de configuration
          </p>
        </div>
      </div>
    </div>
  );
}
