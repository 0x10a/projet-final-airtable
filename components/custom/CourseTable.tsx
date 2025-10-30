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
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CourseTableProps {
  courses: AirtableRecord<CoursFields>[];
}

export function CourseTable({ courses }: CourseTableProps) {
  const router = useRouter();

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
        if (!date) return '-';
        try {
          return format(new Date(date), 'dd MMM yyyy', { locale: fr });
        } catch {
          return date;
        }
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log('[CourseTable] Navigation vers cours:', courseId);
              if (!courseId || courseId === 'undefined') {
                console.error('[CourseTable] ID de cours invalide:', row.original);
                alert('Erreur: ID de cours invalide');
                return;
              }
              router.push(`/cours/${courseId}`);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Voir détails
          </Button>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={courses} />;
}
