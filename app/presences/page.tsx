/**
 * Page Gestion des Présences - /app/presences/page.tsx
 * Visualisation de toutes les présences avec filtres et export CSV
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
    Signature?: boolean;
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
        const presentValue: any = presence.fields['Présent ?'];
        let isPresent = false;
        
        if (typeof presentValue === 'boolean') {
          isPresent = presentValue;
        } else if (typeof presentValue === 'string') {
          isPresent = presentValue.toLowerCase() === 'oui' || 
                     presentValue.toLowerCase() === 'présent' ||
                     presentValue.toLowerCase() === 'present';
        }
        
        if (filterStatut === 'present' && !isPresent) return false;
        if (filterStatut === 'absent' && (isPresent || presentValue === 'À saisir')) return false;
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
    const presents = presences.filter(p => {
      const val: any = p.fields['Présent ?'];
      if (typeof val === 'boolean') return val;
      if (typeof val === 'string') {
        return val.toLowerCase() === 'oui' || 
               val.toLowerCase() === 'présent' ||
               val.toLowerCase() === 'present';
      }
      return false;
    }).length;
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
      
      const presentValue: any = presence.fields['Présent ?'];
      let statut = 'Absent';
      if (typeof presentValue === 'boolean' && presentValue) {
        statut = 'Présent';
      } else if (typeof presentValue === 'string') {
        if (presentValue.toLowerCase() === 'oui' || 
            presentValue.toLowerCase() === 'présent' ||
            presentValue.toLowerCase() === 'present') {
          statut = 'Présent';
        } else {
          statut = presentValue; // "À saisir" ou autre
        }
      }
      
      return [
        formatDateNumeric(date),
        getSessionName(sessionId),
        coursId ? getCoursName(coursId) : '',
        getEtudiantName(etudiantId),
        statut,
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

  // Liste unique des cours pour le filtre
  const coursList = useMemo(() => {
    if (!cours) return [];
    return cours;
  }, [cours]);

  if (presencesLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des présences...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Feuilles de présences</h1>
          <p className="text-muted-foreground mt-2">
            Visualisez toutes les présences avec filtres avancés
          </p>
        </div>
        <Button onClick={handleExportCSV} disabled={!filteredPresences || filteredPresences.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span className="font-semibold whitespace-nowrap">Rechercher</span>
            </div>
            <Input
              placeholder="Rechercher par étudiant, session ou cours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtres et Tri */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Titre */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">Filtres</span>
            </div>

            {/* Filtre Cours */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Cours</label>
              <Select value={filterCours} onValueChange={setFilterCours}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les cours" />
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
            </div>

            {/* Filtre Statut */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Statut</label>
              <Select value={filterStatut} onValueChange={setFilterStatut}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="present">Présents uniquement</SelectItem>
                  <SelectItem value="absent">Absents uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des présences */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Présences ({filteredPresences.length})</CardTitle>
          <CardDescription>
            Toutes les présences enregistrées dans le système
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
                    <TableHead>Session</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Cours</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Signature</TableHead>
                    <TableHead>Horodatage</TableHead>
                    <TableHead>Lien</TableHead>
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
                        <TableCell className="font-medium">
                          {sessionId ? getSessionName(sessionId) : '-'}
                        </TableCell>
                        <TableCell>
                          {formatDateShort(date)}
                        </TableCell>
                        <TableCell>
                          {coursId ? getCoursName(coursId) : '-'}
                        </TableCell>
                        <TableCell>
                          {etudiantId ? getEtudiantName(etudiantId) : '-'}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const presentValue: any = presence.fields['Présent ?'];
                            
                            // Gérer les différents types de valeurs possibles
                            let isPresent = false;
                            if (typeof presentValue === 'boolean') {
                              isPresent = presentValue;
                            } else if (typeof presentValue === 'string') {
                              isPresent = presentValue.toLowerCase() === 'oui' || 
                                         presentValue.toLowerCase() === 'présent' ||
                                         presentValue.toLowerCase() === 'present';
                            }
                            
                            // Si "À saisir" ou vide, considérer comme non renseigné
                            if (presentValue === 'À saisir' || !presentValue) {
                              return (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {presentValue || 'Non renseigné'}
                                </Badge>
                              );
                            }
                            
                            return isPresent ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Présent
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Absent
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-center">
                          {presence.fields.Signature ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 inline-block" />
                          ) : (
                            <span className="text-muted-foreground"> </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(presence.fields.Horodatage)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`/emargement/${presence.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Feuille de présence
                            </a>
                          </Button>
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
