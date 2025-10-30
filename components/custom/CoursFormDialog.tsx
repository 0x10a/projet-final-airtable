/**
 * CoursFormDialog - Formulaire modal pour créer/modifier un cours
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { coursSchema, type CoursFormData } from '@/lib/schemas';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CoursFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cours?: {
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
    };
  } | null;
  onSuccess: () => void;
}

export function CoursFormDialog({
  open,
  onOpenChange,
  cours,
  onSuccess,
}: CoursFormDialogProps) {
  const isEditing = !!cours;

  const form = useForm<CoursFormData>({
    resolver: zodResolver(coursSchema),
    defaultValues: {
      'Nom du cours': '',
      Sujet: '',
      Niveau: undefined,
      'Date de début': '',
      'Durée (jours)': undefined,
      Formateur: '',
      'Objectifs pédagogiques': '',
      Prérequis: '',
      Programme: '',
      Modalité: undefined,
    },
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (cours) {
      form.reset({
        'Nom du cours': cours.fields['Nom du cours'],
        Sujet: cours.fields.Sujet || '',
        Niveau: cours.fields.Niveau as any,
        'Date de début': cours.fields['Date de début'] || '',
        'Durée (jours)': cours.fields['Durée (jours)'],
        Formateur: cours.fields.Formateur || '',
        'Objectifs pédagogiques': cours.fields['Objectifs pédagogiques'] || '',
        Prérequis: cours.fields.Prérequis || '',
        Programme: cours.fields.Programme || '',
        Modalité: cours.fields.Modalité as any,
      });
    } else {
      form.reset({
        'Nom du cours': '',
        Sujet: '',
        Niveau: undefined,
        'Date de début': '',
        'Durée (jours)': undefined,
        Formateur: '',
        'Objectifs pédagogiques': '',
        Prérequis: '',
        Programme: '',
        Modalité: undefined,
      });
    }
  }, [cours, form]);

  const onSubmit = async (data: CoursFormData) => {
    try {
      const url = '/api/airtable';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            tableName: 'Cours',
            recordId: cours.id,
            fields: data,
          }
        : {
            tableName: 'Cours',
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
          ? 'Cours mis à jour avec succès'
          : 'Cours créé avec succès'
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le cours' : 'Créer un nouveau cours'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations du cours'
              : 'Remplissez les informations pour créer un nouveau cours'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom du cours */}
            <FormField
              control={form.control}
              name="Nom du cours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du cours</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Photoshop Avancé" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sujet */}
            <FormField
              control={form.control}
              name="Sujet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sujet (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Design graphique" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Niveau et Modalité sur la même ligne */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Niveau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau (optionnel)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Débutant">Débutant</SelectItem>
                        <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                        <SelectItem value="Avancé">Avancé</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Modalité"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalité (optionnel)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Présentiel">Présentiel</SelectItem>
                        <SelectItem value="Distanciel">Distanciel</SelectItem>
                        <SelectItem value="Hybride">Hybride</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date et Durée sur la même ligne */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="Date de début"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début (optionnel)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="Durée (jours)"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée en jours (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 5"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : undefined;
                          field.onChange(value);
                        }}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Formateur */}
            <FormField
              control={form.control}
              name="Formateur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formateur (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Marie Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Objectifs pédagogiques */}
            <FormField
              control={form.control}
              name="Objectifs pédagogiques"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objectifs pédagogiques (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez les objectifs du cours..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prérequis */}
            <FormField
              control={form.control}
              name="Prérequis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prérequis (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Connaissances requises..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Programme */}
            <FormField
              control={form.control}
              name="Programme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programme (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Détails du programme..."
                      className="resize-none"
                      rows={4}
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
