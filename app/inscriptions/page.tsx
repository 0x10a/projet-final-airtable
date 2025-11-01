/**
 * Page Gestion des Inscriptions - /app/inscriptions/page.tsx
 * Page admin pour CRUD sur les inscriptions (associer étudiants et cours)
 */

'use client';

import { useState, useEffect } from 'react';
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
import { Plus, UserPlus, Edit, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';
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
  };
}

export default function InscriptionsPage() {
  const searchParams = useSearchParams();
  const etudiantParam = searchParams.get('etudiant'); // Récupérer le paramètre étudiant de l'URL
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState<string>('all');
  const [selectedEtudiant, setSelectedEtudiant] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'etudiant' | 'statut'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inscription ?')) return;

    try {
      const res = await fetch('/api/airtable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Inscriptions',
          recordId: inscriptionId,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Inscription supprimée avec succès');
      refetch();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de l\'inscription');
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des inscriptions...</p>
      </div>
    );
  }

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
    if (sortBy === 'date') {
      const dateA = parseAirtableDate(a.fields["Date d'inscription"])?.getTime() || 0;
      const dateB = parseAirtableDate(b.fields["Date d'inscription"])?.getTime() || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    } else if (sortBy === 'etudiant') {
      const etudiantA = a.fields.Étudiant?.[0] ? getEtudiantName(a.fields.Étudiant[0]).toLowerCase() : '';
      const etudiantB = b.fields.Étudiant?.[0] ? getEtudiantName(b.fields.Étudiant[0]).toLowerCase() : '';
      return sortOrder === 'desc' 
        ? etudiantB.localeCompare(etudiantA)
        : etudiantA.localeCompare(etudiantB);
    } else {
      // Tri par statut
      const statutA = a.fields.Statut || '';
      const statutB = b.fields.Statut || '';
      return sortOrder === 'desc'
        ? statutB.localeCompare(statutA)
        : statutA.localeCompare(statutB);
    }
  });

  // Statistiques par statut
  const statsParStatut = {
    inscrit: inscriptions?.filter(i => i.fields.Statut === 'Inscrit').length || 0,
    termine: inscriptions?.filter(i => i.fields.Statut === 'Terminé').length || 0,
    annule: inscriptions?.filter(i => i.fields.Statut === 'Annulé').length || 0,
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gestion des Inscriptions</h1>
          <p className="text-muted-foreground mt-2">
            Associer les étudiants aux cours et gérer leurs inscriptions
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Inscription
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inscriptions?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inscrits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{statsParStatut.inscrit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Terminés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{statsParStatut.termine}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Annulés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{statsParStatut.annule}</div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
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
        <CardHeader>
          <CardTitle>Filtres et Tri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Filtre par cours */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrer par cours" />
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
              {selectedCours !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCours('all')}
                >
                  <span className="sr-only">Réinitialiser cours</span>
                  ×
                </Button>
              )}
            </div>

            {/* Filtre par étudiant */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedEtudiant} onValueChange={setSelectedEtudiant}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrer par étudiant" />
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
              {selectedEtudiant !== 'all' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEtudiant('all')}
                >
                  <span className="sr-only">Réinitialiser étudiant</span>
                  ×
                </Button>
              )}
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'etudiant' | 'statut')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Trier par date</SelectItem>
                  <SelectItem value="etudiant">Trier par étudiant</SelectItem>
                  <SelectItem value="statut">Trier par statut</SelectItem>
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

            {/* Résultats */}
            <div className="text-sm text-muted-foreground ml-auto">
              {sortedInscriptions.length} inscription(s) affichée(s)
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
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInscriptions.map(inscription => {
                  const etudiantId = inscription.fields.Étudiant?.[0];
                  const coursId = inscription.fields.Cours?.[0];
                  const dateInscription = inscription.fields["Date d'inscription"];

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
