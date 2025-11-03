/**
 * Page Gestion des Sessions - /app/sessions/page.tsx
 * Page admin pour CRUD sur les sessions de formation
 */

'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, BookOpen, Trash2, X, ArrowUpDown } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

function SessionsPageContent() {
  const searchParams = useSearchParams();
  const coursParam = searchParams.get('cours'); // Récupérer le paramètre cours de l'URL
  
  const [selectedCours, setSelectedCours] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nom' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Liste des cours pour le filtre
  const coursList = useMemo(() => {
    if (!cours) return [];
    return cours.map(c => ({
      id: c.id,
      name: c.fields['Nom du cours'],
    }));
  }, [cours]);

  // Initialiser le filtre si un cours est passé en paramètre URL
  useEffect(() => {
    if (coursParam && cours) {
      const coursFound = cours.find(c => c.fields['Nom du cours'] === coursParam);
      if (coursFound) {
        setSelectedCours(coursFound.id);
      }
    }
  }, [coursParam, cours]);

  // Filtrer et trier les sessions
  const filteredAndSortedSessions = useMemo(() => {
    if (!sessions) return [];

    // Filtrer par cours
    let filtered = sessions;
    if (selectedCours !== 'all') {
      filtered = sessions.filter(s => s.fields.Cours?.[0] === selectedCours);
    }

    // Trier
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = parseAirtableDate(a.fields['Date de la session'])?.getTime() || 0;
        const dateB = parseAirtableDate(b.fields['Date de la session'])?.getTime() || 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else {
        // Tri par nom
        const nameA = a.fields['Nom de la session'].toLowerCase();
        const nameB = b.fields['Nom de la session'].toLowerCase();
        return sortOrder === 'desc' 
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      }
    });

    return sorted;
  }, [sessions, selectedCours, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des sessions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Les sessions sont créées automatiquement depuis Airtable
        </p>
      </div>

      {/* Filtres et tri */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Titre */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Filtres et Tri</span>
            </div>

            {/* Filtre par cours */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Cours</label>
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {coursList.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Trier par</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'nom' | 'date')}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="nom">Nom</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table des sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sessions</CardTitle>
          <CardDescription>
            Gérez toutes les sessions de formation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredAndSortedSessions || filteredAndSortedSessions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {selectedCours !== 'all' 
                ? 'Aucune session trouvée pour ce cours.'
                : 'Aucune session créée. Cliquez sur "Nouvelle Session" pour commencer.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom de la session</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedSessions.map((session: Session) => {
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

export default function SessionsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10">
        <p>Chargement des sessions...</p>
      </div>
    }>
      <SessionsPageContent />
    </Suspense>
  );
}
