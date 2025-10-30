import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, BarChart3, CheckCircle, Users, Calendar, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Design.academy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Plateforme de gestion de formation connectée à Airtable
          </p>
          <p className="text-muted-foreground mt-2">
            Gérez vos cours, sessions, inscriptions et émargements en toute simplicité
          </p>
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <Button size="lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard Admin
              </Button>
            </Link>
            <Link href="/cours">
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Catalogue de Cours
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-2 text-blue-600" />
              <CardTitle>Gestion des Cours</CardTitle>
              <CardDescription>
                Catalogue complet avec détails, sessions et inscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Filtres par niveau et sujet
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Programme et objectifs détaillés
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Suivi des sessions planifiées
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 mb-2 text-purple-600" />
              <CardTitle>Émargement Numérique</CardTitle>
              <CardDescription>
                Feuilles de présence conformes Qualiopi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Signature électronique
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Horodatage automatique
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Traçabilité complète
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 mb-2 text-green-600" />
              <CardTitle>Dashboard & Statistiques</CardTitle>
              <CardDescription>
                Suivi en temps réel des formations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Taux de présence par cours
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Graphiques interactifs
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  Vue d'ensemble en un coup d'œil
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pages Disponibles */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Pages & Fonctionnalités</CardTitle>
            <CardDescription>Découvrez toutes les fonctionnalités de la plateforme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Pour les Administrateurs
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <Link href="/dashboard" className="font-medium text-foreground hover:underline">
                        Dashboard
                      </Link>
                      <p className="text-xs">Statistiques et vue d'ensemble</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <Link href="/cours" className="font-medium text-foreground hover:underline">
                        Gestion des Cours
                      </Link>
                      <p className="text-xs">Catalogue complet et détails</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Pour les Étudiants
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">Émargement</span>
                      <p className="text-xs">Confirmation de présence par session</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <Link href="/cours" className="font-medium text-foreground hover:underline">
                        Consulter les Cours
                      </Link>
                      <p className="text-xs">Voir le programme et les sessions</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-muted-foreground">
          <p className="text-sm mb-2">
            Plateforme de gestion de formation • Next.js 15 + Airtable
          </p>
          <p className="text-xs">
            Consultez le README.md pour les instructions de configuration
          </p>
        </div>
      </div>
    </div>
  );
}
