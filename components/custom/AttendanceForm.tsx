/**
 * Composant AttendanceForm - Formulaire d'émargement individuel
 * Utilisé dans /app/emargement/[presenceId]/page.tsx
 * 
 * Les présences sont déjà créées par l'automate Airtable.
 * Ce formulaire permet uniquement de METTRE À JOUR la présence avec la signature manuscrite.
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
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Eraser } from 'lucide-react';
import { AirtableRecord, EtudiantFields } from '@/lib/airtable';
import { z } from 'zod';
import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

// Schéma simplifié pour émargement individuel (signature base64)
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
  const sigCanvas = useRef<SignatureCanvas>(null);

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signature: '',
    },
  });

  async function onSubmit(values: SignatureFormData) {
    setIsSubmitting(true);
    try {
      // Mettre à jour la checkbox Signature et l'horodatage
      const response = await fetch('/api/airtable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: 'Présences',
          recordId: presenceId,
          fields: {
            Signature: true, // Cocher la checkbox de signature
            Horodatage: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
      }

      setIsSuccess(true);
      toast.success('Votre présence a été confirmée avec succès !');
      form.reset();
    } catch (error: any) {
      console.error('Erreur émargement:', error);
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

  const handleClear = () => {
    sigCanvas.current?.clear();
    form.setValue('signature', '');
  };

  const handleSubmitWithSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si le canvas contient une signature
    if (sigCanvas.current?.isEmpty()) {
      form.setError('signature', {
        type: 'manual',
        message: 'Veuillez signer dans le cadre ci-dessus',
      });
      return;
    }

    // Récupérer la signature en base64 PNG
    const signatureData = sigCanvas.current?.toDataURL('image/png');
    
    if (signatureData) {
      form.setValue('signature', signatureData);
      await form.handleSubmit(onSubmit)();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithSignature} className="space-y-6">

        {/* Canvas de Signature */}
        <FormField
          control={form.control}
          name="signature"
          render={() => (
            <FormItem>
              <FormLabel>Signature manuscrite *</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-primary/20 rounded-lg overflow-hidden bg-white">
                    <SignatureCanvas
                      ref={sigCanvas}
                      canvasProps={{
                        className: 'w-full h-40 touch-none',
                        style: { touchAction: 'none' }
                      }}
                      backgroundColor="rgb(255, 255, 255)"
                      penColor="rgb(0, 0, 0)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="w-full"
                  >
                    <Eraser className="h-4 w-4 mr-2" />
                    Effacer et recommencer
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                Signez avec votre doigt (mobile) ou votre souris (ordinateur) dans le cadre ci-dessus
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
          Votre signature et l'horodatage seront automatiquement enregistrés.
        </p>
      </form>
    </Form>
  );
}
