/**
 * Composant CourseTable - Affiche tous les cours avec filtres
 * Utilisé dans /app/cours/page.tsx
 */

'use client';

import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { AirtableRecord, CoursFields } from '@/lib/airtable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDateShort } from '@/lib/date-utils';
import { toast } from 'sonner';

interface CourseTableProps {
  courses: AirtableRecord<CoursFields>[];
  onEdit?: (cours: AirtableRecord<CoursFields>) => void;
  onRefetch?: () => void;
}

export function CourseTable({ courses, onEdit, onRefetch }: CourseTableProps) {
  const router = useRouter();

  const handleDelete = async (coursId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;

    try {
      const res = await fetch('/api/airtable', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Cours',
          recordId: coursId,
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');

      toast.success('Cours supprimé avec succès');
      if (onRefetch) onRefetch();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression du cours');
    }
  };

  const columns: ColumnDef<AirtableRecord<CoursFields>>[] = [
    {
      accessorKey: 'fields.Nom du cours',
      header: 'Nom du cours',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.fields['Nom du cours']}</div>
      ),
    },
    {
      accessorKey: 'fields.Sujet',
      header: 'Sujet',
      cell: ({ row }) => row.original.fields.Sujet || '-',
    },
    {
      accessorKey: 'fields.Niveau',
      header: 'Niveau',
      cell: ({ row }) => {
        const niveau = row.original.fields.Niveau;
        if (!niveau) return '-';
        
        const colors: Record<string, string> = {
          Débutant: 'bg-green-100 text-green-800',
          Intermédiaire: 'bg-blue-100 text-blue-800',
          Avancé: 'bg-orange-100 text-orange-800',
          Expert: 'bg-red-100 text-red-800',
        };

        return (
          <Badge variant="outline" className={colors[niveau] || ''}>
            {niveau}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'fields.Date de début',
      header: 'Date de début',
      cell: ({ row }) => {
        const date = row.original.fields['Date de début'];
        return formatDateShort(date);
      },
    },
    {
      accessorKey: 'fields.Durée (jours)',
      header: 'Durée',
      cell: ({ row }) => {
        const duree = row.original.fields['Durée (jours)'];
        return duree ? `${duree} jour${duree > 1 ? 's' : ''}` : '-';
      },
    },
    {
      accessorKey: 'fields.Formateur',
      header: 'Formateur',
      cell: ({ row }) => row.original.fields.Formateur || '-',
    },
    {
      accessorKey: 'fields.Modalité',
      header: 'Modalité',
      cell: ({ row }) => {
        const modalite = row.original.fields.Modalité;
        if (!modalite) return '-';
        
        const colors: Record<string, string> = {
          Présentiel: 'bg-blue-100 text-blue-800',
          Distanciel: 'bg-purple-100 text-purple-800',
          Hybride: 'bg-indigo-100 text-indigo-800',
        };

        return (
          <Badge variant="outline" className={colors[modalite] || ''}>
            {modalite}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const courseId = row.original.id;
        
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (!courseId || courseId === 'undefined') {
                  alert('Erreur: ID de cours invalide');
                  return;
                }
                router.push(`/cours/${courseId}`);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(courseId)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={courses} />;
}
