/**
 * Page Gestion des Étudiants - /app/etudiants/page.tsx
 * Page admin pour CRUD sur les étudiants
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Mail, Phone, Plus, Edit, Trash2, Search } from 'lucide-react';
import { EtudiantFormDialog } from '@/components/custom/EtudiantFormDialog';
import { toast } from 'sonner';

interface Etudiant {
  id: string;
  fields: {
    Prénom: string;
    Nom: string;
    Email: string;
    Téléphone?: string;
    Adresse?: string;
    Notes?: string;
  };
}

export default function EtudiantsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEtudiant, setEditingEtudiant] = useState<Etudiant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Récupérer tous les étudiants
  const { data: etudiants, isLoading, refetch } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Supprimer un étudiant
  const handleDelete = async (etudiantId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;

    try {
      const res = await fetch('/api/airtable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Étudiants',
          recordId: etudiantId,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Étudiant supprimé avec succès');
      refetch();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression de l\'étudiant');
    }
  };

  // Ouvrir le dialog pour créer un nouvel étudiant
  const handleCreate = () => {
    setEditingEtudiant(null);
    setIsDialogOpen(true);
  };

  // Ouvrir le dialog pour modifier un étudiant
  const handleEdit = (etudiant: Etudiant) => {
    setEditingEtudiant(etudiant);
    setIsDialogOpen(true);
  };

  // Callback après succès du formulaire
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingEtudiant(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des étudiants...</p>
      </div>
    );
  }

  // Filtrer les étudiants selon la recherche
  const filteredEtudiants = etudiants?.filter(etudiant => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      etudiant.fields.Prénom?.toLowerCase().includes(searchLower) ||
      etudiant.fields.Nom?.toLowerCase().includes(searchLower) ||
      etudiant.fields.Email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gestion des Étudiants</h1>
          <p className="text-muted-foreground mt-2">
            Créer, modifier et supprimer des étudiants
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel Étudiant
        </Button>
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
            <div className="text-3xl font-bold">{etudiants?.length || 0}</div>
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
              {etudiants?.filter(e => e.fields.Email).length || 0}
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
              {etudiants?.filter(e => e.fields.Téléphone).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un étudiant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des étudiants */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Étudiants ({filteredEtudiants.length})</CardTitle>
          <CardDescription>
            Gérez tous les étudiants inscrits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredEtudiants || filteredEtudiants.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Aucun étudiant trouvé pour cette recherche'
                : 'Aucun étudiant créé. Cliquez sur "Nouvel Étudiant" pour commencer.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEtudiants.map(etudiant => (
                  <TableRow key={etudiant.id}>
                    <TableCell className="font-medium">
                      {etudiant.fields.Prénom} {etudiant.fields.Nom}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {etudiant.fields.Email || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {etudiant.fields.Téléphone || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {etudiant.fields.Adresse || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(etudiant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(etudiant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulaire */}
      <EtudiantFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        etudiant={editingEtudiant}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
