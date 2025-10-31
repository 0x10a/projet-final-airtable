/**
 * Composant AttendanceForm - Formulaire d'émargement individuel
 * Utilisé dans /app/emargement/[presenceId]/page.tsx
 * 
 * Les présences sont déjà créées par l'automate Airtable.
 * Ce formulaire permet uniquement de METTRE À JOUR la présence avec la signature.
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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AirtableRecord, EtudiantFields } from '@/lib/airtable';
import { z } from 'zod';
import { useState } from 'react';

// Schéma simplifié pour émargement individuel
const signatureSchema = z.object({
  signature: z.string().min(1, 'La signature est requise'),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

interface AttendanceFormProps {
  presenceId: string;
  etudiant: AirtableRecord<EtudiantFields>;
  isAlreadySigned: boolean;
}

export function AttendanceForm({ presenceId, etudiant, isAlreadySigned }: AttendanceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signature: '',
    },
  });

  async function onSubmit(values: SignatureFormData) {
    setIsSubmitting(true);
    try {
      // Mettre à jour l'enregistrement de présence existant via l'API
      const response = await fetch('/api/airtable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Présences',
          recordId: presenceId,
          fields: {
            'Présent ?': 'Oui', // Mettre à jour le statut
            Signature: values.signature,
            Horodatage: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement');
      }

      setIsSuccess(true);
      toast.success('Votre présence a été confirmée avec succès !');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'émargement');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Déjà signé
  if (isAlreadySigned) {
    return (
      <div className="text-center py-8 space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
        <div>
          <h3 className="text-xl font-semibold">Présence déjà confirmée</h3>
          <p className="text-muted-foreground mt-2">
            Votre présence a déjà été enregistrée pour cette session.
          </p>
        </div>
      </div>
    );
  }

  // Succès
  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-semibold">Présence confirmée !</h3>
        <p className="text-muted-foreground">
          Merci {etudiant.fields.Prénom}, votre présence a été enregistrée avec succès.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
