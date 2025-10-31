/**
 * Page Gestion des Sessions - /app/sessions/page.tsx
 * Page admin pour CRUD sur les sessions de formation
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Trash2 } from 'lucide-react';
import { parseAirtableDate, formatDateShort } from '@/lib/date-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Session {
  id: string;
  fields: {
    'Nom de la session': string;
    'Date de la session': string;
    Cours?: string[];
    Présences?: string[];
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
  };
}

export default function SessionsPage() {
  // Récupérer toutes les sessions
  const { data: sessions, isLoading, refetch } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Sessions');
      if (!res.ok) throw new Error('Erreur lors du chargement des sessions');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Récupérer tous les cours pour afficher les noms
  const { data: cours } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur lors du chargement des cours');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Supprimer une session
  const handleDelete = async (sessionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return;

    try {
      const res = await fetch('/api/airtable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Sessions',
          recordId: sessionId,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Session supprimée avec succès');
      refetch();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de la session');
    }
  };

  // Trouver le nom d'un cours par son ID
  const getCoursName = (coursId: string) => {
    const c = cours?.find(c => c.id === coursId);
    return c?.fields['Nom du cours'] || 'Cours inconnu';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des sessions...</p>
      </div>
    );
  }

  const sortedSessions = [...(sessions || [])].sort((a, b) => {
    const dateA = parseAirtableDate(a.fields['Date de la session'])?.getTime() || 0;
    const dateB = parseAirtableDate(b.fields['Date de la session'])?.getTime() || 0;
    return dateB - dateA; // Plus récent en premier
  });

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Gestion des Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Les sessions sont créées automatiquement depuis Airtable
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessions à venir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sessions?.filter(s => {
                const date = parseAirtableDate(s.fields['Date de la session']);
                return date && date > new Date();
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessions passées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {sessions?.filter(s => {
                const date = parseAirtableDate(s.fields['Date de la session']);
                return date && date <= new Date();
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table des sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sessions</CardTitle>
          <CardDescription>
            Gérez toutes les sessions de formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Aucune session créée. Cliquez sur "Nouvelle Session" pour commencer.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la session</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Présences</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSessions.map(session => {
                  const sessionDate = parseAirtableDate(session.fields['Date de la session']);
                  const isUpcoming = sessionDate ? sessionDate > new Date() : false;
                  const coursId = session.fields.Cours?.[0];

                  return (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        {session.fields['Nom de la session']}
                      </TableCell>
                      <TableCell>
                        {coursId ? (
                          <div className="flex items-center gap-1 text-sm">
                            <BookOpen className="h-3 w-3" />
                            {getCoursName(coursId)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDateShort(session.fields['Date de la session'])}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {session.fields.Présences?.length || 0} émargement(s)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isUpcoming ? 'default' : 'secondary'}>
                          {isUpcoming ? 'À venir' : 'Passée'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
