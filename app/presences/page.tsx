/**
 * Page Historique des Présences - /app/presences/page.tsx
 * Visualisation de tous les émargements avec filtres et export CSV
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Download, Search, Filter } from 'lucide-react';
import { formatDateShort, formatDateNumeric, formatDateTime } from '@/lib/date-utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Presence {
  id: string;
  fields: {
    Session?: string[];
    Étudiant?: string[];
    'Présent ?'?: boolean;
    Signature?: string;
    Horodatage?: string;
    'Date de la session (from Sessions)'?: string;
  };
}

interface Session {
  id: string;
  fields: {
    'Nom de la session': string;
    'Date de la session': string;
    Cours?: string[];
  };
}

interface Etudiant {
  id: string;
  fields: {
    Prénom: string;
    Nom: string;
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
  };
}

export default function PresencesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCours, setFilterCours] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');

  // Récupérer toutes les présences
  const { data: presences, isLoading: presencesLoading } = useQuery<Presence[]>({
    queryKey: ['presences'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Présences');
      if (!res.ok) throw new Error('Erreur lors du chargement des présences');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Récupérer toutes les sessions
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Sessions');
      if (!res.ok) throw new Error('Erreur lors du chargement des sessions');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Récupérer tous les étudiants
  const { data: etudiants } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Récupérer tous les cours
  const { data: cours } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur lors du chargement des cours');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Helper functions
  const getSessionName = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.fields['Nom de la session'] || 'Session inconnue';
  };

  const getSessionDate = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.fields['Date de la session'];
  };

  const getSessionCoursId = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.fields.Cours?.[0];
  };

  const getEtudiantName = (etudiantId: string) => {
    const etudiant = etudiants?.find(e => e.id === etudiantId);
    return etudiant ? `${etudiant.fields.Prénom} ${etudiant.fields.Nom}` : 'Étudiant inconnu';
  };

  const getCoursName = (coursId: string) => {
    const c = cours?.find(c => c.id === coursId);
    return c?.fields['Nom du cours'] || 'Cours inconnu';
  };

  // Filtrage des présences
  const filteredPresences = useMemo(() => {
    if (!presences) return [];

    return presences.filter(presence => {
      const sessionId = presence.fields.Session?.[0];
      const etudiantId = presence.fields.Étudiant?.[0];
      
      if (!sessionId || !etudiantId) return false;

      // Filtre par cours
      if (filterCours !== 'all') {
        const coursId = getSessionCoursId(sessionId);
        if (coursId !== filterCours) return false;
      }

      // Filtre par statut
      if (filterStatut !== 'all') {
        const isPresent = presence.fields['Présent ?'];
        if (filterStatut === 'present' && !isPresent) return false;
        if (filterStatut === 'absent' && isPresent) return false;
      }

      // Recherche textuelle
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const etudiantName = getEtudiantName(etudiantId).toLowerCase();
        const sessionName = getSessionName(sessionId).toLowerCase();
        const coursId = getSessionCoursId(sessionId);
        const coursName = coursId ? getCoursName(coursId).toLowerCase() : '';
        
        return (
          etudiantName.includes(searchLower) ||
          sessionName.includes(searchLower) ||
          coursName.includes(searchLower)
        );
      }

      return true;
    });
  }, [presences, filterCours, filterStatut, searchTerm, sessions, etudiants, cours]);

  // Statistiques
  const stats = useMemo(() => {
    if (!presences) return { total: 0, presents: 0, absents: 0, tauxPresence: 0 };
    
    const total = presences.length;
    const presents = presences.filter(p => p.fields['Présent ?']).length;
    const absents = total - presents;
    const tauxPresence = total > 0 ? (presents / total) * 100 : 0;

    return { total, presents, absents, tauxPresence };
  }, [presences]);

  // Export CSV
  const handleExportCSV = () => {
    if (!filteredPresences || filteredPresences.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    const headers = ['Date', 'Session', 'Cours', 'Étudiant', 'Statut', 'Signature', 'Horodatage'];
    const rows = filteredPresences.map(presence => {
      const sessionId = presence.fields.Session?.[0] || '';
      const etudiantId = presence.fields.Étudiant?.[0] || '';
      const coursId = getSessionCoursId(sessionId);
      const date = getSessionDate(sessionId);
      
      return [
        formatDateNumeric(date),
        getSessionName(sessionId),
        coursId ? getCoursName(coursId) : '',
        getEtudiantName(etudiantId),
        presence.fields['Présent ?'] ? 'Présent' : 'Absent',
        presence.fields.Signature || '',
        formatDateTime(presence.fields.Horodatage),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `presences_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export CSV réussi !');
  };

  if (presencesLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des présences...</p>
      </div>
    );
  }

  // Liste unique des cours pour le filtre
  const coursList = useMemo(() => {
    if (!cours) return [];
    return cours;
  }, [cours]);

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Historique des Présences</h1>
          <p className="text-muted-foreground mt-2">
            Visualisez tous les émargements avec filtres avancés
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!filteredPresences || filteredPresences.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Émargements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Présents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.presents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Absents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.absents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Taux de Présence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.tauxPresence.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par étudiant, session ou cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtre Cours */}
            <Select value={filterCours} onValueChange={setFilterCours}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtrer par cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cours</SelectItem>
                {coursList.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fields['Nom du cours']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre Statut */}
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="present">Présents uniquement</SelectItem>
                <SelectItem value="absent">Absents uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des présences */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Émargements ({filteredPresences.length})</CardTitle>
          <CardDescription>
            Tous les émargements enregistrés dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredPresences || filteredPresences.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm || filterCours !== 'all' || filterStatut !== 'all'
                ? 'Aucune présence trouvée avec ces filtres'
                : 'Aucune présence enregistrée'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Horodatage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPresences.map(presence => {
                    const sessionId = presence.fields.Session?.[0];
                    const etudiantId = presence.fields.Étudiant?.[0];
                    const coursId = sessionId ? getSessionCoursId(sessionId) : null;
                    const date = sessionId ? getSessionDate(sessionId) : null;

                    return (
                      <TableRow key={presence.id}>
                        <TableCell>
                          {formatDateShort(date)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {sessionId ? getSessionName(sessionId) : '-'}
                        </TableCell>
                        <TableCell>
                          {coursId ? getCoursName(coursId) : '-'}
                        </TableCell>
                        <TableCell>
                          {etudiantId ? getEtudiantName(etudiantId) : '-'}
                        </TableCell>
                        <TableCell>
                          {presence.fields['Présent ?'] ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Présent
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {presence.fields.Signature || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(presence.fields.Horodatage)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
