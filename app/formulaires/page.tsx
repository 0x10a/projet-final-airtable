/**
 * Page Formulaires - Exemple de page dédiée aux formulaires
 * Démontre l'utilisation du composant FormExample
 */

'use client';

import { FormExample } from '@/components/form-example';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FormulairesPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      {/* Bouton retour */}
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au dashboard
        </Button>
      </Link>

      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Formulaires</h1>
        <p className="text-muted-foreground mt-2">
          Créez de nouveaux records dans Airtable avec validation
        </p>
      </div>

      {/* Formulaire principal */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau record</CardTitle>
          <CardDescription>
            Tous les champs sont validés avec Zod avant l'envoi à Airtable.
            Les modifications sont gérées avec React Hook Form.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormExample
            onSuccess={() => {
              // Rediriger ou afficher un message
            }}
          />
        </CardContent>
      </Card>

      {/* Section d'information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>À propos de ce formulaire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Technologies utilisées :</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>React Hook Form pour la gestion des formulaires</li>
              <li>Zod pour la validation des données</li>
              <li>shadcn/ui pour les composants UI</li>
              <li>React Query pour les mutations API</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Fonctionnalités :</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Validation en temps réel des champs</li>
              <li>Messages d'erreur personnalisés</li>
              <li>Toasts de succès/erreur</li>
              <li>États de chargement lors de la soumission</li>
              <li>Réinitialisation automatique après création</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Personnalisation :</h3>
            <p className="text-sm text-muted-foreground">
              Modifiez le schéma Zod dans <code className="bg-muted px-1 py-0.5 rounded">components/form-example.tsx</code> pour adapter les champs à votre structure Airtable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
