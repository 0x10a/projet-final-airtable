/**
 * Page Dashboard - Exemple d'utilisation complète
 * Affiche les données Airtable avec graphiques et gestion CRUD
 */

'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { FormExample } from '@/components/form-example';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAirtableRecords, useDeleteRecord } from '@/lib/hooks/use-airtable';
import { AirtableRecord, BaseFields } from '@/lib/airtable';
import { Plus, Pencil, Trash2, RefreshCw, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Type pour vos données Airtable (personnalisez selon votre structure)
interface MyRecord extends BaseFields {
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
}

export default function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AirtableRecord<MyRecord> | null>(null);

  // Récupérer les données avec React Query
  const { data: records, isLoading, error, refetch } = useAirtableRecords<MyRecord>({
    // tableName: 'YourTableName', // Spécifiez votre table ou utilisez .env
  });

  const deleteMutation = useDeleteRecord();

  // Définir les colonnes du tableau
  const columns: ColumnDef<AirtableRecord<MyRecord>>[] = [
    {
      accessorKey: 'fields.name',
      header: 'Nom',
    },
    {
      accessorKey: 'fields.email',
      header: 'Email',
    },
    {
      accessorKey: 'fields.status',
      header: 'Statut',
      cell: ({ row }) => {
        const status = row.original.fields.status;
        const colors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'fields.description',
      header: 'Description',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEditingRecord(row.original);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Handler pour supprimer un record
  const handleDelete = async (recordId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce record ?')) return;

    try {
      await deleteMutation.mutateAsync({ recordId });
      toast.success('Record supprimé avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  // Préparer les données pour le graphique
  const chartData = records
    ? [
        { name: 'Actif', value: records.filter((r) => r.fields.status === 'active').length },
        { name: 'Inactif', value: records.filter((r) => r.fields.status === 'inactive').length },
        { name: 'En attente', value: records.filter((r) => r.fields.status === 'pending').length },
      ]
    : [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Airtable</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos données Airtable avec Next.js 15
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau record
          </Button>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records?.length || 0}</div>
            <p className="text-xs text-muted-foreground">dans votre base Airtable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {records?.filter((r) => r.fields.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">records actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {records?.filter((r) => r.fields.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">en attente de validation</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution des statuts</CardTitle>
          <CardDescription>Visualisation des records par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tableau de données */}
      <Card>
        <CardHeader>
          <CardTitle>Tous les records</CardTitle>
          <CardDescription>
            Liste complète des records Airtable avec actions CRUD
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Erreur : {error.message}
            </div>
          ) : (
            <DataTable columns={columns} data={records || []} />
          )}
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau record</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour ajouter un nouveau record à Airtable.
            </DialogDescription>
          </DialogHeader>
          <FormExample
            onSuccess={() => setIsCreateOpen(false)}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={!!editingRecord} onOpenChange={() => setEditingRecord(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le record</DialogTitle>
            <DialogDescription>
              Modifiez les informations du record.
            </DialogDescription>
          </DialogHeader>
          {editingRecord && (
            <FormExample
              recordId={editingRecord.id}
              initialData={editingRecord.fields}
              onSuccess={() => setEditingRecord(null)}
              onCancel={() => setEditingRecord(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
