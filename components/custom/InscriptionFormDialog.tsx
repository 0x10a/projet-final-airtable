/**
 * InscriptionFormDialog - Formulaire modal pour créer/modifier une inscription
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inscriptionSchema, type InscriptionFormData } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface InscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inscription?: {
    id: string;
    fields: {
      Étudiant?: string[];
      Cours?: string[];
      "Date d'inscription"?: string;
      Statut?: 'Inscrit' | 'Terminé' | 'Annulé';
    };
  } | null;
  onSuccess: () => void;
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

export function InscriptionFormDialog({
  open,
  onOpenChange,
  inscription,
  onSuccess,
}: InscriptionFormDialogProps) {
  const isEditing = !!inscription;

  // Récupérer les étudiants pour le select
  const { data: etudiants, isLoading: etudiantsLoading } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Récupérer les cours pour le select
  const { data: cours, isLoading: coursLoading } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur lors du chargement des cours');
      const data = await res.json();
      return data.records || [];
    },
  });

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      Étudiant: [],
      Cours: [],
      "Date d'inscription": new Date().toISOString().split('T')[0],
      Statut: 'Inscrit',
    },
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (inscription) {
      form.reset({
        Étudiant: inscription.fields.Étudiant || [],
        Cours: inscription.fields.Cours || [],
        "Date d'inscription": inscription.fields["Date d'inscription"] || new Date().toISOString().split('T')[0],
        Statut: inscription.fields.Statut || 'Inscrit',
      });
    } else {
      form.reset({
        Étudiant: [],
        Cours: [],
        "Date d'inscription": new Date().toISOString().split('T')[0],
        Statut: 'Inscrit',
      });
    }
  }, [inscription, form]);

  const onSubmit = async (data: InscriptionFormData) => {
    try {
      const url = '/api/airtable';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            tableName: 'Inscriptions',
            recordId: inscription.id,
            fields: data,
          }
        : {
            tableName: 'Inscriptions',
            fields: data,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(
        isEditing
          ? 'Inscription mise à jour avec succès'
          : 'Inscription créée avec succès'
      );

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'inscription' : 'Créer une nouvelle inscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de l\'inscription'
              : 'Associez un étudiant à un cours'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Étudiant */}
            <FormField
              control={form.control}
              name="Étudiant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Étudiant</FormLabel>
                  <Select
                    disabled={etudiantsLoading}
                    onValueChange={(value) => field.onChange([value])}
                    value={field.value?.[0] || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un étudiant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {etudiantsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        etudiants?.map((etudiant) => (
                          <SelectItem key={etudiant.id} value={etudiant.id}>
                            {etudiant.fields.Prénom} {etudiant.fields.Nom}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cours */}
            <FormField
              control={form.control}
              name="Cours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours</FormLabel>
                  <Select
                    disabled={coursLoading}
                    onValueChange={(value) => field.onChange([value])}
                    value={field.value?.[0] || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un cours" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coursLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        cours?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.fields['Nom du cours']}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date d'inscription */}
            <FormField
              control={form.control}
              name="Date d'inscription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'inscription</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut */}
            <FormField
              control={form.control}
              name="Statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Inscrit">Inscrit</SelectItem>
                      <SelectItem value="Terminé">Terminé</SelectItem>
                      <SelectItem value="Annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
