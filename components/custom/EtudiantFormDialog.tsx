/**
 * EtudiantFormDialog - Formulaire modal pour créer/modifier un étudiant
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { etudiantSchema, type EtudiantFormData } from '@/lib/schemas';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EtudiantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etudiant?: {
    id: string;
    fields: {
      Prénom: string;
      Nom: string;
      Email: string;
      Téléphone?: string;
      Adresse?: string;
      Notes?: string;
    };
  } | null;
  onSuccess: () => void;
}

export function EtudiantFormDialog({
  open,
  onOpenChange,
  etudiant,
  onSuccess,
}: EtudiantFormDialogProps) {
  const isEditing = !!etudiant;

  const form = useForm<EtudiantFormData>({
    resolver: zodResolver(etudiantSchema),
    defaultValues: {
      Prénom: '',
      Nom: '',
      Email: '',
      Téléphone: '',
      Adresse: '',
      Notes: '',
    },
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (etudiant) {
      form.reset({
        Prénom: etudiant.fields.Prénom,
        Nom: etudiant.fields.Nom,
        Email: etudiant.fields.Email,
        Téléphone: etudiant.fields.Téléphone || '',
        Adresse: etudiant.fields.Adresse || '',
        Notes: etudiant.fields.Notes || '',
      });
    } else {
      form.reset({
        Prénom: '',
        Nom: '',
        Email: '',
        Téléphone: '',
        Adresse: '',
        Notes: '',
      });
    }
  }, [etudiant, form]);

  const onSubmit = async (data: EtudiantFormData) => {
    try {
      const url = '/api/airtable';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            tableName: 'Étudiants',
            recordId: etudiant.id,
            fields: data,
          }
        : {
            tableName: 'Étudiants',
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
          ? 'Étudiant mis à jour avec succès'
          : 'Étudiant créé avec succès'
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
            {isEditing ? 'Modifier l\'étudiant' : 'Créer un nouvel étudiant'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de l\'étudiant'
              : 'Remplissez les informations pour créer un nouvel étudiant'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Prénom */}
            <FormField
              control={form.control}
              name="Prénom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nom */}
            <FormField
              control={form.control}
              name="Nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean.dupont@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Téléphone */}
            <FormField
              control={form.control}
              name="Téléphone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="06 12 34 56 78"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Adresse */}
            <FormField
              control={form.control}
              name="Adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123 Rue de la Paix, 75001 Paris"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="Notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes supplémentaires..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
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
