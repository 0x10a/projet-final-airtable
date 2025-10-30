/**
 * Composant formulaire exemple avec validation Zod et React Hook Form
 * Peut être utilisé pour créer ou modifier des records Airtable
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateRecord, useUpdateRecord } from '@/lib/hooks/use-airtable';
import { Loader2 } from 'lucide-react';

// Schéma de validation Zod - Personnalisez selon vos besoins
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom doit contenir au moins 2 caractères.',
  }),
  email: z.string().email({
    message: 'Adresse email invalide.',
  }),
  status: z.enum(['active', 'inactive', 'pending']),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FormExampleProps {
  tableName?: string;
  recordId?: string;
  initialData?: Partial<FormValues>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function FormExample({
  tableName,
  recordId,
  initialData,
  onSuccess,
  onCancel,
}: FormExampleProps) {
  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord();

  const isEditing = !!recordId;

  // Initialiser le formulaire avec React Hook Form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      email: '',
      status: 'pending',
      description: '',
    },
  });

  // Handler de soumission
  async function onSubmit(values: FormValues) {
    try {
      if (isEditing && recordId) {
        // Mode édition
        await updateMutation.mutateAsync({
          tableName,
          recordId,
          fields: values,
        });
        toast.success('Record mis à jour avec succès !');
      } else {
        // Mode création
        await createMutation.mutateAsync({
          tableName,
          fields: values,
        });
        toast.success('Record créé avec succès !');
        form.reset();
      }

      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Une erreur est survenue');
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Champ Nom */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                Le nom complet de la personne.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champ Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormDescription>
                Adresse email de contact.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champ Statut */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un statut" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Statut actuel du record.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Champ Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Notes additionnelles..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Boutons d'action */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Mettre à jour' : 'Créer'}
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
