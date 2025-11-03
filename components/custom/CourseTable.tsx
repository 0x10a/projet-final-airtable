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
import { Eye, Edit, Trash2, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDateShort } from '@/lib/date-utils';
import { toast } from 'sonner';
import Link from 'next/link';

interface CourseTableProps {
  courses: AirtableRecord<CoursFields>[];
  onEdit?: (cours: AirtableRecord<CoursFields>) => void;
  onRefetch?: () => void;
  onSort?: (column: 'date' | 'nom') => void;
  sortColumn?: 'date' | 'nom' | null;
  sortDirection?: 'asc' | 'desc';
}

export function CourseTable({ courses, onEdit, onRefetch, onSort, sortColumn, sortDirection }: CourseTableProps) {
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
      header: () => (
        <div 
          onClick={() => onSort?.('nom')} 
          className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
        >
          Nom du cours
          {sortColumn === 'nom' ? (
            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </div>
      ),
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
      header: () => (
        <div 
          onClick={() => onSort?.('date')} 
          className="cursor-pointer flex items-center gap-1 hover:text-primary transition-colors"
        >
          Date de début
          {sortColumn === 'date' ? (
            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : <ArrowUpDown className="h-4 w-4 opacity-50" />}
        </div>
      ),
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
      accessorKey: 'fields.Nb inscriptions',
      header: 'Étudiants inscrits',
      cell: ({ row }) => {
        const nbInscriptions = row.original.fields['Nb inscriptions'] || 0;
        const coursName = row.original.fields['Nom du cours'];
        
        if (nbInscriptions === 0) {
          return (
            <Badge variant="secondary">
              0
            </Badge>
          );
        }
        
        return (
          <Link href={`/inscriptions?cours=${encodeURIComponent(coursName)}`}>
            <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
              {nbInscriptions}
            </Badge>
          </Link>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const courseId = row.original.id;
        const coursName = row.original.fields['Nom du cours'];
        
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
              title="Voir le détail"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Rediriger vers la page Sessions avec le filtre pré-sélectionné
                router.push(`/sessions?cours=${encodeURIComponent(coursName)}`);
              }}
              title="Voir toutes les sessions"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row.original)}
                title="Modifier"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(courseId)}
              title="Supprimer"
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
