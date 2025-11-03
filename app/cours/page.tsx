/**
 * Page Gestion des Cours - /app/cours/page.tsx
 * Page admin pour CRUD sur les cours
 */

'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CourseTable } from '@/components/custom/CourseTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { CoursFormDialog } from '@/components/custom/CoursFormDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    'Nb inscriptions'?: number;
  };
}

export default function CoursPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCours, setEditingCours] = useState<Cours | null>(null);
  const [filterNiveau, setFilterNiveau] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<'date' | 'nom' | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  // Gérer le clic sur un en-tête de colonne pour le tri
  const handleSort = (column: 'date' | 'nom') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filtrer et trier les cours
  const filteredAndSortedCourses = useMemo(() => {
    if (!courses) return [];

    let filtered = [...courses];

    // Filtrer par niveau
    if (filterNiveau !== 'all') {
      filtered = filtered.filter(c => c.fields.Niveau === filterNiveau);
    }

    // Trier selon la colonne et direction
    if (sortColumn) {
      filtered.sort((a, b) => {
        let comparison = 0;
        
        if (sortColumn === 'date') {
          const dateA = a.fields['Date de début'] ? new Date(a.fields['Date de début']).getTime() : 0;
          const dateB = b.fields['Date de début'] ? new Date(b.fields['Date de début']).getTime() : 0;
          comparison = dateA - dateB;
        } else if (sortColumn === 'nom') {
          const nomA = a.fields['Nom du cours'] || '';
          const nomB = b.fields['Nom du cours'] || '';
          comparison = nomA.localeCompare(nomB);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [courses, filterNiveau, sortColumn, sortDirection]);

  // Extraire les valeurs uniques pour les filtres
  const niveaux = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map(c => c.fields.Niveau).filter(Boolean))) as string[];
  }, [courses]);

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
          <h1 className="text-4xl font-bold">Cours</h1>
          <p className="text-muted-foreground mt-2">
            Créer, modifier et supprimer des cours
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau Cours
        </Button>
      </div>

      {/* Filtres et Tri */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-6">
            {/* Titre */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span className="font-semibold">Filtres</span>
            </div>

            {/* Filtre Niveau */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium whitespace-nowrap">Niveau</label>
              <Select value={filterNiveau} onValueChange={setFilterNiveau}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {niveaux.map(niveau => (
                    <SelectItem key={niveau} value={niveau}>
                      {niveau}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des cours */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les Cours ({filteredAndSortedCourses.length})</CardTitle>
          <CardDescription>
            Gérez tous les cours disponibles chez Design.academy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseTable 
            courses={filteredAndSortedCourses} 
            onEdit={handleEdit} 
            onRefetch={refetch}
            onSort={handleSort}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
          />
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
