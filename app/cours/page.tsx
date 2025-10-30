/**
 * Page Liste des Cours - /app/cours/page.tsx
 * Affiche tous les cours avec possibilité de filtrer
 */

import { getRecords } from '@/lib/airtable';
import type { CoursFields } from '@/lib/airtable';
import { CourseTable } from '@/components/custom/CourseTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CoursPage() {
  // Récupérer tous les cours depuis Airtable (SSR)
  let courses: Array<{ id: string; fields: CoursFields }> = [];
  
  try {
    const result = await getRecords<CoursFields>(
      process.env.AIRTABLE_TABLE_COURS || 'Cours',
      {
        sort: [{ field: 'Date de début', direction: 'desc' }],
      }
    );
    
    // Filtrer les records invalides (sans id valide)
    courses = result.filter(c => c && c.id && c.id !== 'undefined' && c.id !== 'null');
  } catch (error) {
    console.error('Erreur lors du chargement des cours:', error);
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Catalogue des Cours</h1>
        <p className="text-muted-foreground mt-2">
          Parcourez tous les cours disponibles chez Design.academy
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Niveaux Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(courses.map(c => c.fields.Niveau).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(courses.map(c => c.fields.Formateur).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Cours</CardTitle>
          <CardDescription>
            Cliquez sur "Voir détails" pour accéder aux informations complètes et aux sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseTable courses={courses} />
        </CardContent>
      </Card>
    </div>
  );
}
