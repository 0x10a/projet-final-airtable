/**
 * Page Liste des Étudiants - /app/etudiants/page.tsx
 */

import { getRecords } from '@/lib/airtable';
import type { EtudiantFields } from '@/lib/airtable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Mail, Phone } from 'lucide-react';

export default async function EtudiantsPage() {
  // Récupérer tous les étudiants depuis Airtable (SSR)
  let etudiants: Array<{ id: string; fields: EtudiantFields }> = [];
  
  try {
    const result = await getRecords<EtudiantFields>(
      process.env.AIRTABLE_TABLE_ETUDIANTS || 'Étudiants',
      {
        sort: [{ field: 'Nom', direction: 'asc' }],
      }
    );
    
    // Filtrer les records invalides
    etudiants = result.filter(e => e && e.id && e.id !== 'undefined' && e.id !== 'null');
  } catch (error) {
    console.error('Erreur lors du chargement des étudiants:', error);
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Étudiants</h1>
        <p className="text-muted-foreground mt-2">
          Gérez tous les étudiants inscrits à Design.academy
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Total Étudiants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{etudiants.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Avec Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {etudiants.filter(e => e.fields.Email).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Avec Téléphone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {etudiants.filter(e => e.fields.Téléphone).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des étudiants */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Étudiants</CardTitle>
          <CardDescription>
            Liste complète des étudiants inscrits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {etudiants.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun étudiant trouvé
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etudiants.map(etudiant => (
                  <TableRow key={etudiant.id}>
                    <TableCell className="font-medium">
                      {etudiant.fields.Prénom} {etudiant.fields.Nom}
                    </TableCell>
                    <TableCell>
                      {etudiant.fields.Email || '-'}
                    </TableCell>
                    <TableCell>
                      {etudiant.fields.Téléphone || '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {etudiant.fields.Adresse || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
