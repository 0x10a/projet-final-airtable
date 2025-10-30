/**
 * Composant AttendanceForm - Formulaire d'émargement public pour les étudiants
 * Utilisé dans /app/formulaires/[sessionId]/page.tsx
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { AirtableRecord, EtudiantFields, SessionFields } from '@/lib/airtable';
import { emargementPublicSchema, EmargementPublicFormData } from '@/lib/schemas';
import { useState } from 'react';

interface AttendanceFormProps {
  session: AirtableRecord<SessionFields>;
  etudiants: AirtableRecord<EtudiantFields>[];
  onSuccess?: () => void;
}

export function AttendanceForm({ session, etudiants, onSuccess }: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<EmargementPublicFormData>({
    resolver: zodResolver(emargementPublicSchema),
    defaultValues: {
      etudiantId: '',
      signature: '',
    },
  });

  async function onSubmit(values: EmargementPublicFormData) {
    setIsSubmitting(true);
    try {
      // Créer l'enregistrement de présence via l'API
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Présences',
          fields: {
            Session: [session.id],
            Étudiant: [values.etudiantId],
            'Présent ?': values.present !== undefined ? values.present : true,
            Signature: values.signature,
            Horodatage: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      setIsSuccess(true);
      toast.success('Votre présence a été enregistrée avec succès !');
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'émargement');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-semibold">Présence confirmée !</h3>
        <p className="text-muted-foreground">
          Merci, votre présence a été enregistrée pour cette session.
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Enregistrer une autre présence
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations de la session */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold">{session.fields['Nom de la session']}</h3>
          <p className="text-sm text-muted-foreground">
            Date : {session.fields['Date de la session']}
          </p>
        </div>

        {/* Sélection de l'étudiant */}
        <FormField
          control={form.control}
          name="etudiantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre nom *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre nom" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {etudiants.map((etudiant) => (
                    <SelectItem key={etudiant.id} value={etudiant.id}>
                      {etudiant.fields.Prénom} {etudiant.fields.Nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Sélectionnez votre nom dans la liste
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Signature */}
        <FormField
          control={form.control}
          name="signature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature *</FormLabel>
              <FormControl>
                <Input placeholder="Tapez votre nom complet" {...field} />
              </FormControl>
              <FormDescription>
                Entrez votre nom complet en guise de signature électronique
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bouton de soumission */}
        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirmer ma présence
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          En validant, vous confirmez votre présence à cette session de formation.
          L'horodatage sera automatiquement enregistré.
        </p>
      </form>
    </Form>
  );
}
