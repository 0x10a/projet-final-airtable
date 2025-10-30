/**
 * Page Dashboard Admin - Design.academy
 * Vue synthèse avec statistiques, graphiques de présence, et accès rapides
 */

import { getRecords } from '@/lib/airtable';
import type {
  EtudiantFields,
  CoursFields,
  SessionFields,
  PresenceFields,
} from '@/lib/airtable';
import { DashboardCards } from '@/components/custom/DashboardCards';
import { AttendanceChart } from '@/components/custom/AttendanceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen, Calendar, Users, FileText } from 'lucide-react';
import { format, isFuture, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function DashboardPage() {
  // Récupérer toutes les données nécessaires (SSR)
  let etudiants: Array<{ id: string; fields: EtudiantFields }> = [];
  let cours: Array<{ id: string; fields: CoursFields }> = [];
  let sessions: Array<{ id: string; fields: SessionFields }> = [];
  let presences: Array<{ id: string; fields: PresenceFields }> = [];
  
  try {
    const results = await Promise.all([
      getRecords<EtudiantFields>(process.env.AIRTABLE_TABLE_ETUDIANTS || 'Étudiants'),
      getRecords<CoursFields>(process.env.AIRTABLE_TABLE_COURS || 'Cours'),
      getRecords<SessionFields>(process.env.AIRTABLE_TABLE_SESSIONS || 'Sessions', {
        sort: [{ field: 'Date de la session', direction: 'desc' }],
      }),
      getRecords<PresenceFields>(process.env.AIRTABLE_TABLE_PRESENCES || 'Présences'),
    ]);
    
    // Filtrer les records invalides (sans id)
    etudiants = (results[0] || []).filter(e => e && e.id);
    cours = (results[1] || []).filter(c => c && c.id);
    sessions = (results[2] || []).filter(s => s && s.id);
    presences = (results[3] || []).filter(p => p && p.id);
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    // Les tableaux vides sont déjà initialisés
  }

  // Calculer les statistiques
  const totalEtudiants = etudiants.length;
  const totalCours = cours.length;

  // Sessions à venir
  const sessionsAVenir = sessions.filter(s => {
    const date = s.fields['Date de la session'];
    return date && isFuture(parseISO(date));
  }).length;

  // Taux de présence moyen
  const totalPresences = presences.length;
  const presentsCount = presences.filter(p => p.fields['Présent ?']).length;
  const tauxPresence = totalPresences > 0 ? (presentsCount / totalPresences) * 100 : 0;

  // Données pour le graphique de présence par cours
  const attendanceData = cours.map(c => {
    const coursId = c.id;
    
    // Trouver les sessions de ce cours
    const coursSessionIds = c.fields.Sessions || [];
    
    // Compter les présences pour ces sessions
    const sessionPresences = presences.filter(p => {
      const sessionId = p.fields.Session?.[0];
      return sessionId && coursSessionIds.includes(sessionId);
    });
    
    const total = sessionPresences.length;
    const presents = sessionPresences.filter(p => p.fields['Présent ?']).length;
    const taux = total > 0 ? (presents / total) * 100 : 0;

    return {
      cours: c.fields['Nom du cours'].substring(0, 20) + (c.fields['Nom du cours'].length > 20 ? '...' : ''),
      taux,
      presents,
      total,
    };
  }).filter(d => d.total > 0); // Ne garder que les cours avec des présences

  // Les 5 prochaines sessions
  const prochainesSessions = sessions
    .filter(s => {
      const date = s.fields['Date de la session'];
      return date && isFuture(parseISO(date));
    })
    .slice(0, 5);

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Design.academy</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de votre centre de formation
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/cours">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Voir les cours
            </Button>
          </Link>
        </div>
      </div>

      {/* Cartes statistiques */}
      <DashboardCards
        totalEtudiants={totalEtudiants}
        totalCours={totalCours}
        sessionsAVenir={sessionsAVenir}
        tauxPresence={tauxPresence}
      />

      {/* Graphique de présence */}
      <AttendanceChart data={attendanceData} />

      {/* Accès rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/cours">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Cours</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérer les formations et sessions
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Étudiants</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {totalEtudiants} étudiants inscrits
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Émargement</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Feuilles de présence numériques
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Prochaines Sessions
          </CardTitle>
          <CardDescription>
            Les {prochainesSessions.length} prochaines sessions planifiées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prochainesSessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucune session à venir
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prochainesSessions.map(session => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.fields['Nom de la session']}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {session.fields['Date de la session']
                          ? format(
                              parseISO(session.fields['Date de la session']),
                              'dd MMM yyyy',
                              { locale: fr }
                            )
                          : '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/formulaires/${session.id}`}>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Feuille d'émargement
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Récapitulatif Cours */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif des Cours</CardTitle>
          <CardDescription>
            Aperçu de tous les cours avec nombre de sessions et inscrits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cours</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Formateur</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cours.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.fields['Nom du cours']}
                  </TableCell>
                  <TableCell>
                    {c.fields.Niveau && (
                      <Badge variant="outline">{c.fields.Niveau}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.fields.Sessions?.length || 0} session(s)
                  </TableCell>
                  <TableCell>{c.fields.Formateur || '-'}</TableCell>
                  <TableCell>
                    <Link href={`/cours/${c.id}`}>
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
