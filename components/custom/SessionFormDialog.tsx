/**
 * SessionFormDialog - Formulaire modal pour créer/modifier une session
 */

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sessionSchema, type SessionFormData } from '@/lib/schemas';
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

interface SessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: {
    id: string;
    fields: {
      'Nom de la session': string;
      'Date de la session': string;
      Cours?: string[];
    };
  } | null;
  onSuccess: () => void;
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
  };
}

export function SessionFormDialog({
  open,
  onOpenChange,
  session,
  onSuccess,
}: SessionFormDialogProps) {
  const isEditing = !!session;

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

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      'Nom de la session': '',
      'Date de la session': '',
      Cours: [],
    },
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (session) {
      form.reset({
        'Nom de la session': session.fields['Nom de la session'],
        'Date de la session': session.fields['Date de la session'],
        Cours: session.fields.Cours || [],
      });
    } else {
      form.reset({
        'Nom de la session': '',
        'Date de la session': '',
        Cours: [],
      });
    }
  }, [session, form]);

  const onSubmit = async (data: SessionFormData) => {
    try {
      const url = '/api/airtable';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            tableName: 'Sessions',
            recordId: session.id,
            fields: data,
          }
        : {
            tableName: 'Sessions',
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
          ? 'Session mise à jour avec succès'
          : 'Session créée avec succès'
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
            {isEditing ? 'Modifier la session' : 'Créer une nouvelle session'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de la session'
              : 'Remplissez les informations pour créer une nouvelle session'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom de la session */}
            <FormField
              control={form.control}
              name="Nom de la session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la session</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Session Photoshop - Janvier 2025"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date de la session */}
            <FormField
              control={form.control}
              name="Date de la session"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de la session</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cours associé */}
            <FormField
              control={form.control}
              name="Cours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cours associé</FormLabel>
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
