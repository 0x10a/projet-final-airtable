/**
 * Page Détail d'un Cours - /app/cours/[id]/page.tsx
 * Affiche les informations complètes, étudiants inscrits et sessions
 */

import { getRecord, getRecords } from '@/lib/airtable';
import type { CoursFields, EtudiantFields, SessionFields, InscriptionFields } from '@/lib/airtable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock, Target, FileText } from 'lucide-react';
import { formatDateShort, formatDateLong } from '@/lib/date-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  // Next.js 15: params est maintenant une Promise
  const { id } = await params;

  // Récupérer les détails du cours
  const course = await getRecord<CoursFields>(
    process.env.AIRTABLE_TABLE_COURS || 'Cours',
    id
  );

  // Récupérer TOUTES les inscriptions
  const allInscriptions = await getRecords<InscriptionFields>(
    process.env.AIRTABLE_TABLE_INSCRIPTIONS || 'Inscriptions'
  );

  // Filtrer côté serveur pour ce cours spécifique
  const inscriptions = allInscriptions.filter(inscription => {
    const coursIds = inscription.fields.Cours || [];
    return coursIds.includes(id);
  });

  // Récupérer les étudiants inscrits (IDs uniques)
  const etudiantIdsSet = new Set<string>();
  inscriptions.forEach(inscription => {
    const etudiantId = inscription.fields.Étudiant?.[0];
    if (etudiantId && etudiantId !== 'undefined' && etudiantId !== 'null') {
      etudiantIdsSet.add(etudiantId);
    }
  });
  const etudiantIds = Array.from(etudiantIdsSet);

  const etudiants = etudiantIds.length > 0
    ? (await Promise.all(
        etudiantIds.map(async etudiantId => {
          try {
            return await getRecord<EtudiantFields>(
              process.env.AIRTABLE_TABLE_ETUDIANTS || 'Étudiants',
              etudiantId
            );
          } catch (error) {
            console.error(`Étudiant ${etudiantId} non trouvé:`, error);
            return null;
          }
        })
      )).filter(Boolean) as Array<{ id: string; fields: EtudiantFields }>
    : [];

  // Récupérer les sessions du cours
  const sessionIds = (course.fields.Sessions || [])
    .filter(id => id && id !== 'undefined' && id !== 'null'); // Filtrer les IDs invalides
  
  const sessions = sessionIds.length > 0
    ? (await Promise.all(
        sessionIds.map(async sessionId => {
          try {
            return await getRecord<SessionFields>(
              process.env.AIRTABLE_TABLE_SESSIONS || 'Sessions',
              sessionId
            );
          } catch (error) {
            console.error(`Session ${sessionId} non trouvée:`, error);
            return null;
          }
        })
      )).filter(Boolean) as Array<{ id: string; fields: SessionFields }>
    : [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Bouton retour */}
      <Link href="/cours">
        <Button variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux cours
        </Button>
      </Link>

      {/* En-tête du cours */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{course.fields['Nom du cours']}</h1>
            <div className="flex gap-2 mt-4">
              {course.fields.Niveau && (
                <Badge variant="outline">{course.fields.Niveau}</Badge>
              )}
              {course.fields.Modalité && (
                <Badge variant="outline">{course.fields.Modalité}</Badge>
              )}
              {course.fields.Sujet && (
                <Badge variant="secondary">{course.fields.Sujet}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.fields.Formateur && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Formateur</p>
                <p className="font-medium">{course.fields.Formateur}</p>
              </div>
            )}
            {course.fields['Date de début'] && formatDateLong(course.fields['Date de début']) !== '-' && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de début</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateLong(course.fields['Date de début'])}
                </p>
              </div>
            )}
            {course.fields['Durée (jours)'] && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Durée</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {course.fields['Durée (jours)']} jour
                  {course.fields['Durée (jours)'] > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objectifs & Prérequis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.fields['Objectifs pédagogiques'] && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Objectifs pédagogiques
                </p>
                <p className="text-sm">{course.fields['Objectifs pédagogiques']}</p>
              </div>
            )}
            {course.fields.Prérequis && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prérequis</p>
                <p className="text-sm">{course.fields.Prérequis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions ({sessions.length})</CardTitle>
          <CardDescription>
            Toutes les sessions planifiées pour ce cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucune session programmée pour ce cours
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(session => {
                  const sessionDate = session.fields['Date de la session'] 
                    ? new Date(session.fields['Date de la session']) 
                    : null;
                  const isUpcoming = sessionDate && sessionDate > new Date();
                  
                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.fields['Nom de la session']}
                      </TableCell>
                      <TableCell>
                        {formatDateShort(session.fields['Date de la session'])}
                      </TableCell>
                      <TableCell>
                        {course.fields['Nom du cours']}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                          {isUpcoming ? 'À venir' : 'Passée'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Étudiants inscrits */}
      <Card>
        <CardHeader>
          <CardTitle>Étudiants Inscrits ({etudiants.length})</CardTitle>
          <CardDescription>
            Liste des étudiants inscrits à ce cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {etudiants.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucun étudiant inscrit pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {etudiants.map(etudiant => {
                  // Trouver l'inscription de cet étudiant pour ce cours
                  const inscription = inscriptions.find(
                    i => i.fields.Étudiant?.[0] === etudiant.id
                  );

                  return (
                    <TableRow key={etudiant.id}>
                      <TableCell className="font-medium">
                        {etudiant.fields.Prénom} {etudiant.fields.Nom}
                      </TableCell>
                      <TableCell>{etudiant.fields.Email}</TableCell>
                      <TableCell>
                        {formatDateShort(inscription?.fields["Date d'inscription"])}
                      </TableCell>
                      <TableCell>
                        {inscription?.fields.Statut ? (
                          <Badge
                            variant={
                              inscription.fields.Statut === 'Inscrit'
                                ? 'default'
                                : inscription.fields.Statut === 'Terminé'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {inscription.fields.Statut}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
