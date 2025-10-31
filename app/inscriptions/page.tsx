/**
 * Page Gestion des Inscriptions - /app/inscriptions/page.tsx
 * Page admin pour CRUD sur les inscriptions (associer étudiants et cours)
 */

'use client';

import { useState } from 'react';
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
import { Plus, UserPlus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { InscriptionFormDialog } from '@/components/custom/InscriptionFormDialog';
import { formatDateShort } from '@/lib/date-utils';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInscription, setEditingInscription] = useState<Inscription | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState<string>('all');

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

  // Filtrer les inscriptions selon la recherche et le cours sélectionné
  const filteredInscriptions = inscriptions?.filter(inscription => {
    const etudiantId = inscription.fields.Étudiant?.[0];
    const coursId = inscription.fields.Cours?.[0];
    
    // Filtre par cours
    if (selectedCours !== 'all' && coursId !== selectedCours) {
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

      {/* Barre de recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher et filtrer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche texte */}
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par étudiant, cours ou statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Filtre par cours */}
            <div className="flex items-center gap-2 w-full md:w-[300px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger>
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
            </div>

            {/* Bouton de réinitialisation des filtres */}
            {(searchTerm || selectedCours !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCours('all');
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table des inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Inscriptions ({filteredInscriptions.length})</CardTitle>
          <CardDescription>
            Gérez toutes les inscriptions des étudiants aux cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredInscriptions || filteredInscriptions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Aucune inscription trouvée pour cette recherche'
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
                {filteredInscriptions.map(inscription => {
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
