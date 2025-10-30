/**
 * Page Gestion des Cours - /app/cours/page.tsx
 * Page admin pour CRUD sur les cours
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseTable } from '@/components/custom/CourseTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CoursFormDialog } from '@/components/custom/CoursFormDialog';

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
    Sujet?: string;
    Niveau?: string;
    'Date de début'?: string;
    'Durée (jours)'?: number;
    Formateur?: string;
    'Objectifs pédagogiques'?: string;
    Prérequis?: string;
    Programme?: string;
    Modalité?: string;
    Sessions?: string[];
    Inscriptions?: string[];
  };
}

export default function CoursPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCours, setEditingCours] = useState<Cours | null>(null);

  // Récupérer tous les cours
  const { data: courses, isLoading, refetch } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur lors du chargement des cours');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Ouvrir le dialog pour créer un nouveau cours
  const handleCreate = () => {
    setEditingCours(null);
    setIsDialogOpen(true);
  };

  // Callback pour éditer un cours (appelé depuis CourseTable)
  const handleEdit = (cours: Cours) => {
    setEditingCours(cours);
    setIsDialogOpen(true);
  };

  // Callback après succès du formulaire
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingCours(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement des cours...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Gestion des Cours</h1>
          <p className="text-muted-foreground mt-2">
            Créer, modifier et supprimer des cours
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Cours
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Niveaux Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(courses?.map(c => c.fields.Niveau).filter(Boolean)).size || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(courses?.map(c => c.fields.Formateur).filter(Boolean)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Cours</CardTitle>
          <CardDescription>
            Gérez tous les cours disponibles chez Design.academy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseTable courses={courses || []} onEdit={handleEdit} onRefetch={refetch} />
        </CardContent>
      </Card>

      {/* Dialog de formulaire */}
      <CoursFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        cours={editingCours}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
