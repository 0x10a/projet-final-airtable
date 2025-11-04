/**
 * Page Gestion des Inscriptions - /app/inscriptions/page.tsx
 * Page admin pour CRUD sur les inscriptions (associer étudiants et cours)
 */

'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
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
import { Plus, UserPlus, Edit, Trash2, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { InscriptionFormDialog } from '@/components/custom/InscriptionFormDialog';
import { formatDateShort, parseAirtableDate } from '@/lib/date-utils';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Inscription {
  id: string;
  fields: {
    Étudiant?: string[];
    Cours?: string[];
    "Date d'inscription"?: string;
    Statut?: 'Inscrit' | 'Terminé' | 'Annulé';
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
    'Date de début'?: string;
  };
}

function InscriptionsPageContent() {
  const searchParams = useSearchParams();
  const etudiantParam = searchParams.get('etudiant'); // Récupérer le paramètre étudiant de l'URL
  const coursParam = searchParams.get('cours'); // Récupérer le paramètre cours de l'URL
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState<string>('all');
  const [selectedEtudiant, setSelectedEtudiant] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<'date' | 'etudiant' | 'statut' | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: 'date' | 'etudiant' | 'statut') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Récupérer toutes les inscriptions
  const { data: inscriptions, isLoading, refetch } = useQuery<Inscription[]>({
    queryKey: ['inscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Inscriptions');
      if (!res.ok) throw new Error('Erreur lors du chargement des inscriptions');
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

  // Supprimer une inscription
  const handleDelete = async (inscriptionId: string) => {
    toast.error('Beta: Fonctionnalité de suppression désactivée par Mehdi Tebourbi');
  };

  // Ouvrir le dialog pour créer une nouvelle inscription
  const handleCreate = () => {
    setEditingInscription(null);
    setIsDialogOpen(true);
  };

  // Ouvrir le dialog pour modifier une inscription
  const handleEdit = (inscription: Inscription) => {
    setEditingInscription(inscription);
    setIsDialogOpen(true);
  };

  // Callback après succès du formulaire
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingInscription(null);
    refetch();
  };

  // Trouver le nom d'un étudiant par son ID
  const getEtudiantName = (etudiantId: string) => {
    const etudiant = etudiants?.find(e => e.id === etudiantId);
    return etudiant ? `${etudiant.fields.Prénom} ${etudiant.fields.Nom}` : 'Étudiant inconnu';
  };

  // Trouver le nom d'un cours par son ID
  const getCoursName = (coursId: string) => {
    const c = cours?.find(c => c.id === coursId);
    return c?.fields['Nom du cours'] || 'Cours inconnu';
  };

  // Trouver la date de début d'un cours par son ID
  const getCoursDateDebut = (coursId: string) => {
    const c = cours?.find(c => c.id === coursId);
    return c?.fields['Date de début'];
  };

  // Initialiser le filtre si un étudiant est passé en paramètre URL
  useEffect(() => {
    if (etudiantParam && etudiants) {
      const etudiantFound = etudiants.find(e => 
        `${e.fields.Prénom} ${e.fields.Nom}` === etudiantParam
      );
      if (etudiantFound) {
        setSelectedEtudiant(etudiantFound.id);
      }
    }
  }, [etudiantParam, etudiants]);

  // Initialiser le filtre si un cours est passé en paramètre URL
  useEffect(() => {
    if (coursParam && cours) {
      const coursFound = cours.find(c => 
        c.fields['Nom du cours'] === coursParam
      );
      if (coursFound) {
        setSelectedCours(coursFound.id);
      }
    }
  }, [coursParam, cours]);

  // Obtenir la couleur du badge selon le statut
  const getStatutBadgeVariant = (statut?: string) => {
    switch (statut) {
      case 'Inscrit':
        return 'default';
      case 'Terminé':
        return 'secondary';
      case 'Annulé':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Données pour la courbe d'évolution des 30 derniers jours
  const chartData = useMemo(() => {
    if (!inscriptions) return [];

    // Utiliser des dates locales (sans heures) pour éviter les problèmes de fuseau horaire
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // Créer un objet pour compter les inscriptions par jour
    const dailyCounts: Record<string, number> = {};

    // Initialiser tous les jours avec 0 (utiliser format YYYY-MM-DD en local)
    for (let i = 0; i <= 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + i);
      // Format YYYY-MM-DD en local
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dailyCounts[dateStr] = 0;
    }

    // Compter les inscriptions par jour
    inscriptions.forEach(inscription => {
      const dateInscription = parseAirtableDate(inscription.fields["Date d'inscription"]);
      if (dateInscription) {
        // Convertir en date locale (sans heures)
        const localDate = new Date(dateInscription);
        localDate.setHours(0, 0, 0, 0);
        
        if (localDate >= thirtyDaysAgo && localDate <= today) {
          // Format YYYY-MM-DD en local
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, '0');
          const day = String(localDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          if (dailyCounts[dateStr] !== undefined) {
            dailyCounts[dateStr]++;
          }
        }
      }
    });

    // Convertir en tableau pour le graphique
    return Object.entries(dailyCounts).map(([date, count]) => {
      // Parser la date en local
      const [year, month, day] = date.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      
      return {
        date: localDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        inscriptions: count,
      };
    });
  }, [inscriptions]);

  // Filtrer et trier les inscriptions
  const filteredInscriptions = inscriptions?.filter(inscription => {
    const etudiantId = inscription.fields.Étudiant?.[0];
    const coursId = inscription.fields.Cours?.[0];
    
    // Filtre par cours
    if (selectedCours !== 'all' && coursId !== selectedCours) {
      return false;
    }
    
    // Filtre par étudiant
    if (selectedEtudiant !== 'all' && etudiantId !== selectedEtudiant) {
      return false;
    }
    
    // Filtre par recherche texte
    if (searchTerm) {
      const etudiantName = etudiantId ? getEtudiantName(etudiantId).toLowerCase() : '';
      const coursName = coursId ? getCoursName(coursId).toLowerCase() : '';
      const statut = inscription.fields.Statut?.toLowerCase() || '';
      
      return etudiantName.includes(searchTerm.toLowerCase()) ||
             coursName.includes(searchTerm.toLowerCase()) ||
             statut.includes(searchTerm.toLowerCase());
    }
    
    return true;
  }) || [];

  // Trier les inscriptions filtrées
  const sortedInscriptions = [...filteredInscriptions].sort((a, b) => {
    let comparison = 0;
    
    if (sortColumn === 'date') {
      const dateA = parseAirtableDate(a.fields["Date d'inscription"])?.getTime() || 0;
      const dateB = parseAirtableDate(b.fields["Date d'inscription"])?.getTime() || 0;
      comparison = dateA - dateB;
    } else if (sortColumn === 'etudiant') {
      const etudiantA = a.fields.Étudiant?.[0] ? getEtudiantName(a.fields.Étudiant[0]).toLowerCase() : '';
      const etudiantB = b.fields.Étudiant?.[0] ? getEtudiantName(b.fields.Étudiant[0]).toLowerCase() : '';
      comparison = etudiantA.localeCompare(etudiantB);
    } else if (sortColumn === 'statut') {
      const statutA = a.fields.Statut || '';
      const statutB = b.fields.Statut || '';
      comparison = statutA.localeCompare(statutB);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Statistiques par statut
  const statsParStatut = {
    inscrit: inscriptions?.filter(i => i.fields.Statut === 'Inscrit').length || 0,
    termine: inscriptions?.filter(i => i.fields.Statut === 'Terminé').length || 0,
    annule: inscriptions?.filter(i => i.fields.Statut === 'Annulé').length || 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des inscriptions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Inscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Associer les étudiants aux cours et gérer leurs inscriptions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Inscription
        </Button>
      </div>

      {/* Courbe d'évolution des inscriptions - Masquer si un filtre est actif */}
      {selectedCours === 'all' && selectedEtudiant === 'all' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des inscriptions (30 derniers jours)
            </CardTitle>
            <CardDescription>
              {chartData.reduce((sum, day) => sum + day.inscriptions, 0)} inscription(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune donnée disponible pour afficher le graphique
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '8px 12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Line 
                    type="linear" 
                    dataKey="inscriptions" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 4 }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                    name="Inscriptions"
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span className="font-semibold whitespace-nowrap">Rechercher</span>
            </div>
            <Input
              placeholder="Rechercher par étudiant, cours ou statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
              >
                Effacer
              </Button>
            )}
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

            {/* Filtre par cours */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Cours</label>
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les cours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les cours</SelectItem>
                  {cours?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fields['Nom du cours']}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par étudiant */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Étudiant</label>
              <Select value={selectedEtudiant} onValueChange={setSelectedEtudiant}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Tous les étudiants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les étudiants</SelectItem>
                  {etudiants?.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.fields.Prénom} {e.fields.Nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* Table des inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Inscriptions ({sortedInscriptions.length})</CardTitle>
          <CardDescription>
            Gérez toutes les inscriptions des étudiants aux cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sortedInscriptions || sortedInscriptions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm || selectedCours !== 'all' || selectedEtudiant !== 'all'
                ? 'Aucune inscription trouvée avec ces filtres'
                : 'Aucune inscription créée. Cliquez sur "Nouvelle Inscription" pour commencer.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div 
                      onClick={() => handleSort('etudiant')} 
                      className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Étudiant
                      {sortColumn === 'etudiant' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Date de début</TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort('date')} 
                      className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Date d'inscription
                      {sortColumn === 'date' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      onClick={() => handleSort('statut')} 
                      className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Statut
                      {sortColumn === 'statut' ? (
                        sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                      ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInscriptions.map(inscription => {
                  const etudiantId = inscription.fields.Étudiant?.[0];
                  const coursId = inscription.fields.Cours?.[0];
                  const dateInscription = inscription.fields["Date d'inscription"];
                  const dateDebut = coursId ? getCoursDateDebut(coursId) : undefined;

                  return (
                    <TableRow key={inscription.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-muted-foreground" />
                          {etudiantId ? getEtudiantName(etudiantId) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coursId ? getCoursName(coursId) : '-'}
                      </TableCell>
                      <TableCell>
                        {formatDateShort(dateDebut)}
                      </TableCell>
                      <TableCell>
                        {formatDateShort(dateInscription)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatutBadgeVariant(inscription.fields.Statut)}>
                          {inscription.fields.Statut || 'Non défini'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(inscription)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(inscription.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulaire */}
      <InscriptionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        inscription={editingInscription}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default function InscriptionsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-10">
        <p>Chargement des inscriptions...</p>
      </div>
    }>
      <InscriptionsPageContent />
    </Suspense>
  );
}
