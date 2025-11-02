/**
 * Composants DashboardCards - Cartes statistiques pour le dashboard admin
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';

interface DashboardCardsProps {
  totalEtudiants: number;
  totalCours: number;
  sessionsAVenir: number;
  inscriptionsCoursNonTermines: number;
}

export function DashboardCards({
  totalEtudiants,
  totalCours,
  sessionsAVenir,
  inscriptionsCoursNonTermines,
}: DashboardCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Étudiants
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEtudiants}</div>
          <p className="text-xs text-muted-foreground">
            Étudiants inscrits
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Cours Actifs
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCours}</div>
          <p className="text-xs text-muted-foreground">
            Formations disponibles
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sessions à venir
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sessionsAVenir}</div>
          <p className="text-xs text-muted-foreground">
            Prochaines sessions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Inscriptions (Cours non terminés)
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{inscriptionsCoursNonTermines}</div>
          <p className="text-xs text-muted-foreground">
            Nombre d'inscriptions en total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
