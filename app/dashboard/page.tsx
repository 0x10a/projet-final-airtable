/**
 * Page Dashboard Admin - Design.academy
 * Vue synthèse avec statistiques, graphiques de présence, et accès rapides
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardCards } from '@/components/custom/DashboardCards';
import { SessionsCalendar } from '@/components/custom/SessionsCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { BookOpen, Calendar, Users, FileText, TrendingUp, AlertTriangle, Award, CheckCircle2 } from 'lucide-react';
import { format, isFuture, subDays, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { parseAirtableDate, formatDateShort } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';

interface Etudiant {
  id: string;
  fields: {
    Prénom: string;
    Nom: string;
    Email: string;
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
    Sessions?: string[];
  };
}

interface Session {
  id: string;
  fields: {
    'Nom de la session': string;
    'Date de la session': string;
    Cours?: string[];
    Présences?: string[];
  };
}

interface Presence {
  id: string;
  fields: {
    Session?: string[];
    Étudiant?: string[];
    'Présent ?'?: boolean;
    Horodatage?: string;
  };
}

interface Inscription {
  id: string;
  fields: {
    Étudiant?: string[];
    Cours?: string[];
    "Date d'inscription"?: string;
    Statut?: string;
  };
}

export default function DashboardPage() {
  // Récupérer toutes les données
  const { data: etudiants, isLoading: etudiantsLoading } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: cours } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Sessions');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: presences } = useQuery<Presence[]>({
    queryKey: ['presences'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Présences');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: inscriptions } = useQuery<Inscription[]>({
    queryKey: ['inscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Inscriptions');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Calculs des statistiques
  const stats = useMemo(() => {
    const totalEtudiants = etudiants?.length || 0;
    const totalCours = cours?.length || 0;
    const sessionsAVenir = sessions?.filter(s => {
      const date = s.fields['Date de la session'];
      const parsedDate = parseAirtableDate(date);
      return parsedDate && isFuture(parsedDate);
    }).length || 0;
    
    const totalPresences = presences?.length || 0;
    const presentsCount = presences?.filter(p => p.fields['Présent ?']).length || 0;
    const tauxPresence = totalPresences > 0 ? (presentsCount / totalPresences) * 100 : 0;

    // Inscriptions ce mois
    const startMonth = startOfMonth(new Date());
    const inscriptionsCeMois = inscriptions?.filter(i => {
      const date = i.fields["Date d'inscription"];
      const parsedDate = parseAirtableDate(date);
      return parsedDate && parsedDate >= startMonth;
    }).length || 0;

    // Sessions sans émargement
    const sessionsSansEmargement = sessions?.filter(s => {
      const date = s.fields['Date de la session'];
      const parsedDate = parseAirtableDate(date);
      const isPast = parsedDate && !isFuture(parsedDate);
      const hasPresences = (s.fields.Présences?.length || 0) > 0;
      return isPast && !hasPresences;
    }).length || 0;

    // Étudiants actifs (avec au moins une présence dans les 30 derniers jours)
    const date30DaysAgo = subDays(new Date(), 30);
    const etudiantsActifsIds = new Set(
      presences
        ?.filter(p => {
          const horodatage = p.fields.Horodatage;
          const parsedDate = parseAirtableDate(horodatage);
          return parsedDate && parsedDate >= date30DaysAgo;
        })
        .map(p => p.fields.Étudiant?.[0])
        .filter(Boolean) || []
    );
    const etudiantsActifs = etudiantsActifsIds.size;

    return {
      totalEtudiants,
      totalCours,
      sessionsAVenir,
      tauxPresence,
      inscriptionsCeMois,
      sessionsSansEmargement,
      etudiantsActifs,
    };
  }, [etudiants, cours, sessions, presences, inscriptions]);

  // Données graphique de présence par cours
  const attendanceData = useMemo(() => {
    if (!cours || !presences) return [];
    
    return cours.map(c => {
      const coursId = c.id;
      const coursSessionIds = c.fields.Sessions || [];
      
      const sessionPresences = presences.filter(p => {
        const sessionId = p.fields.Session?.[0];
        return sessionId && coursSessionIds.includes(sessionId);
      });
      
      const total = sessionPresences.length;
      const presents = sessionPresences.filter(p => p.fields['Présent ?']).length;
      const taux = total > 0 ? (presents / total) * 100 : 0;

      return {
        cours: c.fields['Nom du cours'].substring(0, 20) + (c.fields['Nom du cours'].length > 20 ? '...' : ''),
        taux,
        presents,
        total,
      };
    }).filter(d => d.total > 0);
  }, [cours, presences]);

  // Prochaines sessions
  const prochainesSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions
      .filter(s => {
        const date = s.fields['Date de la session'];
        const parsedDate = parseAirtableDate(date);
        return parsedDate && isFuture(parsedDate);
      })
      .slice(0, 5);
  }, [sessions]);

  // Top étudiants (les plus assidus)
  const topEtudiants = useMemo(() => {
    if (!etudiants || !presences) return [];
    
    const etudiantStats = etudiants.map(etudiant => {
      const etudiantPresences = presences.filter(p => p.fields.Étudiant?.[0] === etudiant.id);
      const totalPresences = etudiantPresences.length;
      const presents = etudiantPresences.filter(p => p.fields['Présent ?']).length;
      const taux = totalPresences > 0 ? (presents / totalPresences) * 100 : 0;
      
      return {
        id: etudiant.id,
        nom: `${etudiant.fields.Prénom} ${etudiant.fields.Nom}`,
        totalPresences,
        presents,
        taux,
      };
    });
    
    return etudiantStats
      .filter(e => e.totalPresences > 0)
      .sort((a, b) => b.taux - a.taux)
      .slice(0, 5);
  }, [etudiants, presences]);

  // Helper: nom du cours par ID
  const getCoursName = (coursId?: string) => {
    if (!coursId || !cours) return '-';
    const c = cours.find(c => c.id === coursId);
    return c?.fields['Nom du cours'] || '-';
  };

  if (etudiantsLoading) {
    return (
      <div className="container mx-auto py-10">
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard Design.academy</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de votre centre de formation
        </p>
      </div>

      {/* Cartes statistiques principales */}
      <DashboardCards
        totalEtudiants={stats.totalEtudiants}
        totalCours={stats.totalCours}
        sessionsAVenir={stats.sessionsAVenir}
        tauxPresence={stats.tauxPresence}
      />

      {/* Nouvelles métriques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inscriptionsCeMois}</div>
            <p className="text-xs text-muted-foreground">
              Nouvelles inscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.etudiantsActifs}</div>
            <p className="text-xs text-muted-foreground">
              Présents dans les 30 derniers jours
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions sans émargement</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.sessionsSansEmargement}</div>
            <p className="text-xs text-muted-foreground">
              Sessions passées non émargées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier des sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendrier des Sessions
          </CardTitle>
          <CardDescription>
            Visualisez toutes vos sessions planifiées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsCalendar sessions={sessions || []} cours={cours || []} />
        </CardContent>
      </Card>

      {/* Deux colonnes: Prochaines sessions + Top étudiants */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Prochaines sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Prochaines Sessions
            </CardTitle>
            <CardDescription>
              Les 5 prochaines sessions planifiées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prochainesSessions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune session à venir
              </p>
            ) : (
              <div className="space-y-3">
                {prochainesSessions.map(session => (
                  <div key={session.id} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.fields['Nom de la session']}</p>
                      <p className="text-sm text-muted-foreground">
                        {getCoursName(session.fields.Cours?.[0])}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {formatDateShort(session.fields['Date de la session'])}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top étudiants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Étudiants
            </CardTitle>
            <CardDescription>
              Les 5 étudiants les plus assidus
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topEtudiants.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Aucune donnée de présence
              </p>
            ) : (
              <div className="space-y-3">
                {topEtudiants.map((etudiant, index) => (
                  <div key={etudiant.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{etudiant.nom}</p>
                        <p className="text-sm text-muted-foreground">
                          {etudiant.presents}/{etudiant.totalPresences} présences
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {etudiant.taux.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accès rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/cours">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Cours</CardTitle>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gérer les formations
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sessions">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Sessions</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Planifier les sessions
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/etudiants">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Étudiants</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats.totalEtudiants} inscrits
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/presences">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Présences</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Historique complet
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
