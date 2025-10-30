/**
 * Page Formulaire d'Émargement Public - /app/formulaires/[sessionId]/page.tsx
 * Page publique pour que les étudiants confirment leur présence
 */

import { getRecord, getRecords } from '@/lib/airtable';
import type { SessionFields, CoursFields, InscriptionFields, EtudiantFields } from '@/lib/airtable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceForm } from '@/components/custom/AttendanceForm';
import { Calendar, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EmargementPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function EmargementPage({ params }: EmargementPageProps) {
  // Next.js 15: params est maintenant une Promise
  const { sessionId } = await params;

  // Récupérer la session
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

  // Récupérer toutes les inscriptions pour ce cours
  const inscriptions = coursId
    ? await getRecords<InscriptionFields>(
        process.env.AIRTABLE_TABLE_INSCRIPTIONS || 'Inscriptions',
        {
          filterByFormula: `FIND("${coursId}", ARRAYJOIN({Cours}))`,
        }
      )
    : [];

  // Récupérer les étudiants inscrits
  const etudiantIds = inscriptions
    .map(i => i.fields.Étudiant?.[0])
    .filter(Boolean) as string[];

  const etudiants = etudiantIds.length > 0
    ? await Promise.all(
        etudiantIds.map(etudiantId =>
          getRecord<EtudiantFields>(
            process.env.AIRTABLE_TABLE_ETUDIANTS || 'Étudiants',
            etudiantId
          )
        )
      )
    : [];

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
                  {format(
                    new Date(session.fields['Date de la session']),
                    'EEEE dd MMMM yyyy',
                    { locale: fr }
                  )}
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
              Sélectionnez votre nom et signez pour confirmer votre présence à cette session.
              Conformément aux exigences Qualiopi, votre signature électronique et l'horodatage
              seront enregistrés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {etudiants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun étudiant inscrit à ce cours
              </div>
            ) : (
              <AttendanceForm
                session={session}
                etudiants={etudiants}
                onSuccess={() => {
                  // Optionnel : redirection ou message supplémentaire
                }}
              />
            )}
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
