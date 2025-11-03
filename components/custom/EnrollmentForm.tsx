/**
 * Composant EnrollmentForm - Formulaire d'inscription d'un étudiant à un cours
 * Permet de créer un enregistrement dans la table Inscriptions
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateRecord } from '@/lib/hooks/use-airtable';
import { Loader2 } from 'lucide-react';
import { AirtableRecord, CoursFields, EtudiantFields } from '@/lib/airtable';
import { inscriptionSchema, InscriptionFormData } from '@/lib/schemas';

interface EnrollmentFormProps {
  etudiants: AirtableRecord<EtudiantFields>[];
  cours: AirtableRecord<CoursFields>[];
  onSuccess?: () => void;
  onCancel?: () => void;
  preselectedCoursId?: string;
}

export function EnrollmentForm({
  etudiants,
  cours,
  onSuccess,
  onCancel,
  preselectedCoursId,
}: EnrollmentFormProps) {
  const createMutation = useCreateRecord();

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      Étudiant: [],
      Cours: preselectedCoursId ? [preselectedCoursId] : [],
      "Date d'inscription": new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(values: InscriptionFormData) {
    try {
      // Statut est un champ calculé dans Airtable, on ne l'envoie pas
      await createMutation.mutateAsync({
        tableName: process.env.NEXT_PUBLIC_AIRTABLE_TABLE_INSCRIPTIONS || 'Inscriptions',
        fields: values,
      });

      toast.success('Inscription créée avec succès !');
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    }
  }

  const isSubmitting = createMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sélection de l'étudiant */}
        <FormField
          control={form.control}
          name="Étudiant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Étudiant *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([value])}
                value={field.value?.[0]}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un étudiant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {etudiants.map((etudiant) => (
                    <SelectItem key={etudiant.id} value={etudiant.id}>
                      {etudiant.fields.Prénom} {etudiant.fields.Nom} ({etudiant.fields.Email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Sélectionnez l'étudiant à inscrire
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sélection du cours */}
        <FormField
          control={form.control}
          name="Cours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cours *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange([value])}
                value={field.value?.[0]}
                disabled={!!preselectedCoursId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un cours" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cours.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fields['Nom du cours']} - {c.fields.Niveau || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Sélectionnez le cours pour l'inscription
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Inscrire l'étudiant
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
