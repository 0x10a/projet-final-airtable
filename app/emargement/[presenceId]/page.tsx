/**
 * Page Émargement Individuel - /app/emargement/[presenceId]/page.tsx
 * Page publique pour qu'un étudiant confirme SA présence
 * Accessible via lien unique envoyé par email
 */

import { getRecord } from '@/lib/airtable';
import type { PresenceFields, SessionFields, CoursFields, EtudiantFields } from '@/lib/airtable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceForm } from '@/components/custom/AttendanceForm';
import { Calendar, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseAirtableDate } from '@/lib/date-utils';

interface EmargementPageProps {
  params: Promise<{
    presenceId: string;
  }>;
}

export default async function EmargementPage({ params }: EmargementPageProps) {
  // Next.js 15: params est maintenant une Promise
  const { presenceId } = await params;

  // Récupérer la présence
  const presence = await getRecord<PresenceFields>(
    process.env.AIRTABLE_TABLE_PRESENCES || 'Présences',
    presenceId
  );

  // Récupérer l'étudiant
  const etudiantId = presence.fields.Étudiant?.[0];
  if (!etudiantId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Aucun étudiant associé à cette présence</p>
      </div>
    );
  }

  const etudiant = await getRecord<EtudiantFields>(
    process.env.AIRTABLE_TABLE_ETUDIANTS || 'Étudiants',
    etudiantId
  );

  // Récupérer la session
  const sessionId = presence.fields.Session?.[0];
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Aucune session associée à cette présence</p>
      </div>
    );
  }

  const session = await getRecord<SessionFields>(
    process.env.AIRTABLE_TABLE_SESSIONS || 'Sessions',
    sessionId
  );

  // Récupérer le cours associé
  const coursId = session.fields.Cours?.[0];
  const cours = coursId
    ? await getRecord<CoursFields>(
        process.env.AIRTABLE_TABLE_COURS || 'Cours',
        coursId
      )
    : null;

  // Vérifier si déjà signé
  const presentValue: any = presence.fields['Présent ?'];
  const isAlreadySigned = 
    (typeof presentValue === 'string' && 
     (presentValue.toLowerCase() === 'oui' || 
      presentValue.toLowerCase() === 'présent' ||
      presentValue.toLowerCase() === 'present')) ||
    (typeof presentValue === 'boolean' && presentValue === true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-black py-12">
      <div className="container mx-auto max-w-2xl px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Feuille d'Émargement</h1>
          <p className="text-muted-foreground">
            Confirmez votre présence pour cette session de formation
          </p>
        </div>

        {/* Informations de l'étudiant */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Étudiant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {etudiant.fields.Prénom} {etudiant.fields.Nom}
            </p>
            {etudiant.fields.Email && (
              <p className="text-sm text-muted-foreground mt-1">
                {etudiant.fields.Email}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Informations de la session */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informations de la Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Session</p>
              <p className="font-medium">{session.fields['Nom de la session']}</p>
            </div>
            {session.fields['Date de la session'] && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="font-medium">
                  {(() => {
                    const date = parseAirtableDate(session.fields['Date de la session']);
                    return date ? format(date, 'EEEE dd MMMM yyyy', { locale: fr }) : '-';
                  })()}
                </p>
              </div>
            )}
            {cours && (
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Cours
                </p>
                <p className="font-medium">{cours.fields['Nom du cours']}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulaire d'émargement */}
        <Card>
          <CardHeader>
            <CardTitle>Confirmer ma Présence</CardTitle>
            <CardDescription>
              Signez pour confirmer votre présence à cette session.
              Conformément aux exigences Qualiopi, votre signature électronique et l'horodatage
              seront enregistrés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceForm
              presenceId={presence.id}
              etudiant={etudiant}
              isAlreadySigned={isAlreadySigned}
            />
          </CardContent>
        </Card>

        {/* Note informative */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            Cette feuille d'émargement numérique respecte les exigences de traçabilité Qualiopi.
          </p>
          <p className="mt-2">
            Design.academy • Formation professionnelle
          </p>
        </div>
      </div>
    </div>
  );
}
