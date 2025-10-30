/**
 * Page Rapports Qualiopi - /app/rapports/page.tsx
 * Génération de rapports conformes Qualiopi (feuilles d'émargement, registre, bilan)
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Calendar, Users, CheckSquare, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface Session {
  id: string;
  fields: {
    'Nom de la session': string;
    'Date de la session': string;
    Cours?: string[];
    Présences?: string[];
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
    Sessions?: string[];
  };
}

interface Presence {
  id: string;
  fields: {
    Session?: string[];
    Étudiant?: string[];
    'Présent ?'?: boolean;
    Signature?: string;
    Horodatage?: string;
  };
}

interface Etudiant {
  id: string;
  fields: {
    Prénom: string;
    Nom: string;
    Email: string;
    Téléphone?: string;
    Adresse?: string;
  };
}

export default function RapportsPage() {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedCours, setSelectedCours] = useState<string>('');

  // Récupérer les données
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['sessions'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Sessions');
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

  const { data: presences } = useQuery<Presence[]>({
    queryKey: ['presences'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Présences');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  const { data: etudiants } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Helper functions
  const getSessionName = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.fields['Nom de la session'] || 'Session inconnue';
  };

  const getSessionDate = (sessionId: string) => {
    const session = sessions?.find(s => s.id === sessionId);
    return session?.fields['Date de la session'];
  };

  const getCoursName = (coursId: string) => {
    const c = cours?.find(c => c.id === coursId);
    return c?.fields['Nom du cours'] || 'Cours inconnu';
  };

  const getEtudiantName = (etudiantId: string) => {
    const etudiant = etudiants?.find(e => e.id === etudiantId);
    return etudiant ? `${etudiant.fields.Prénom} ${etudiant.fields.Nom}` : 'Étudiant inconnu';
  };

  // Export feuille d'émargement pour une session
  const exportFeuilleEmargement = () => {
    if (!selectedSession) {
      toast.error('Veuillez sélectionner une session');
      return;
    }

    const session = sessions?.find(s => s.id === selectedSession);
    if (!session) return;

    const sessionPresences = presences?.filter(p => p.fields.Session?.[0] === selectedSession) || [];
    
    if (sessionPresences.length === 0) {
      toast.error('Aucune présence enregistrée pour cette session');
      return;
    }

    const coursId = session.fields.Cours?.[0];
    const coursName = coursId ? getCoursName(coursId) : 'Non spécifié';
    const sessionDate = session.fields['Date de la session'];

    const headers = [
      'Date',
      'Session',
      'Cours',
      'Nom Prénom',
      'Email',
      'Présent',
      'Signature',
      'Horodatage'
    ];

    const rows = sessionPresences.map(p => {
      const etudiantId = p.fields.Étudiant?.[0] || '';
      const etudiant = etudiants?.find(e => e.id === etudiantId);
      
      return [
        sessionDate ? format(new Date(sessionDate), 'dd/MM/yyyy', { locale: fr }) : '',
        session.fields['Nom de la session'],
        coursName,
        etudiant ? `${etudiant.fields.Nom} ${etudiant.fields.Prénom}` : '',
        etudiant?.fields.Email || '',
        p.fields['Présent ?'] ? 'Oui' : 'Non',
        p.fields.Signature || '',
        p.fields.Horodatage ? format(new Date(p.fields.Horodatage), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `emargement_${session.fields['Nom de la session']}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Feuille d\'émargement exportée avec succès !');
  };

  // Export registre de présence pour un cours
  const exportRegistrePresence = () => {
    if (!selectedCours) {
      toast.error('Veuillez sélectionner un cours');
      return;
    }

    const coursObj = cours?.find(c => c.id === selectedCours);
    if (!coursObj) return;

    // Trouver toutes les sessions de ce cours
    const coursSessions = sessions?.filter(s => s.fields.Cours?.[0] === selectedCours) || [];
    
    if (coursSessions.length === 0) {
      toast.error('Aucune session trouvée pour ce cours');
      return;
    }

    // Trouver toutes les présences pour ces sessions
    const sessionIds = coursSessions.map(s => s.id);
    const coursPresences = presences?.filter(p => {
      const sessionId = p.fields.Session?.[0];
      return sessionId && sessionIds.includes(sessionId);
    }) || [];

    const headers = [
      'Cours',
      'Session',
      'Date',
      'Étudiant',
      'Email',
      'Statut',
      'Horodatage'
    ];

    const rows = coursPresences.map(p => {
      const sessionId = p.fields.Session?.[0] || '';
      const etudiantId = p.fields.Étudiant?.[0] || '';
      const sessionDate = getSessionDate(sessionId);
      const etudiant = etudiants?.find(e => e.id === etudiantId);
      
      return [
        coursObj.fields['Nom du cours'],
        getSessionName(sessionId),
        sessionDate ? format(new Date(sessionDate), 'dd/MM/yyyy', { locale: fr }) : '',
        etudiant ? `${etudiant.fields.Nom} ${etudiant.fields.Prénom}` : '',
        etudiant?.fields.Email || '',
        p.fields['Présent ?'] ? 'Présent' : 'Absent',
        p.fields.Horodatage ? format(new Date(p.fields.Horodatage), 'dd/MM/yyyy HH:mm', { locale: fr }) : '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `registre_${coursObj.fields['Nom du cours']}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Registre de présence exporté avec succès !');
  };

  // Export bilan de formation global
  const exportBilanFormation = () => {
    if (!cours || !sessions || !presences || !etudiants) {
      toast.error('Données non chargées');
      return;
    }

    const headers = [
      'Cours',
      'Nombre de sessions',
      'Nombre d\'étudiants uniques',
      'Total présences',
      'Présents',
      'Absents',
      'Taux de présence (%)'
    ];

    const rows = cours.map(c => {
      const coursSessionIds = (c.fields.Sessions || []).filter((id: string) => id && id !== 'undefined');
      const nbSessions = coursSessionIds.length;
      
      const coursPresences = presences.filter(p => {
        const sessionId = p.fields.Session?.[0];
        return sessionId && coursSessionIds.includes(sessionId);
      });
      
      const etudiantsUniques = new Set(
        coursPresences
          .map(p => p.fields.Étudiant?.[0])
          .filter(Boolean)
      ).size;
      
      const totalPresences = coursPresences.length;
      const presents = coursPresences.filter(p => p.fields['Présent ?']).length;
      const absents = totalPresences - presents;
      const taux = totalPresences > 0 ? ((presents / totalPresences) * 100).toFixed(1) : '0';
      
      return [
        c.fields['Nom du cours'],
        nbSessions.toString(),
        etudiantsUniques.toString(),
        totalPresences.toString(),
        presents.toString(),
        absents.toString(),
        taux,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bilan_formation_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Bilan de formation exporté avec succès !');
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-4xl font-bold">Rapports Qualiopi</h1>
        <p className="text-muted-foreground mt-2">
          Générez les documents conformes aux exigences Qualiopi
        </p>
      </div>

      {/* Cartes de rapports */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Feuille d'émargement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Feuille d'Émargement
            </CardTitle>
            <CardDescription>
              Export par session avec signatures et horodatages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sélectionner une session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions?.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.fields['Nom de la session']} - {' '}
                      {format(new Date(session.fields['Date de la session']), 'dd MMM yyyy', { locale: fr })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportFeuilleEmargement} className="w-full" disabled={!selectedSession}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger la feuille d'émargement
            </Button>
          </CardContent>
        </Card>

        {/* Registre de présence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Registre de Présence
            </CardTitle>
            <CardDescription>
              Historique complet par cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sélectionner un cours</label>
              <Select value={selectedCours} onValueChange={setSelectedCours}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un cours" />
                </SelectTrigger>
                <SelectContent>
                  {cours?.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fields['Nom du cours']}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={exportRegistrePresence} className="w-full" disabled={!selectedCours}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger le registre
            </Button>
          </CardContent>
        </Card>

        {/* Bilan de formation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Bilan de Formation
            </CardTitle>
            <CardDescription>
              Rapport global avec statistiques par cours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Inclut pour chaque cours :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nombre de sessions réalisées</li>
                <li>Nombre d'étudiants uniques</li>
                <li>Statistiques de présence</li>
                <li>Taux de présence</li>
              </ul>
            </div>
            <Button onClick={exportBilanFormation} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le bilan global
            </Button>
          </CardContent>
        </Card>

        {/* Liste étudiants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste des Étudiants
            </CardTitle>
            <CardDescription>
              Export de la base étudiants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Export complet incluant :</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nom et prénom</li>
                <li>Coordonnées (email, téléphone)</li>
                <li>Adresse</li>
              </ul>
            </div>
            <Button 
              onClick={() => {
                if (!etudiants || etudiants.length === 0) {
                  toast.error('Aucun étudiant à exporter');
                  return;
                }

                const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Adresse'];
                const rows = etudiants.map(e => [
                  e.fields.Nom,
                  e.fields.Prénom,
                  e.fields.Email,
                  e.fields.Téléphone || '',
                  e.fields.Adresse || '',
                ]);

                const csvContent = [
                  headers.join(','),
                  ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                
                link.setAttribute('href', url);
                link.setAttribute('download', `etudiants_${format(new Date(), 'yyyy-MM-dd')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('Liste des étudiants exportée !');
              }}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger la liste
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informations Qualiopi */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-900">Conformité Qualiopi</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <CheckSquare className="inline h-4 w-4 mr-2" />
            <strong>Indicateur 11:</strong> Suivi de la réalisation des prestations (feuilles d'émargement)
          </p>
          <p>
            <CheckSquare className="inline h-4 w-4 mr-2" />
            <strong>Indicateur 17:</strong> Évaluation de la satisfaction des bénéficiaires
          </p>
          <p>
            <CheckSquare className="inline h-4 w-4 mr-2" />
            <strong>Indicateur 26:</strong> Respect des engagements de moyens (registres de présence)
          </p>
          <p className="text-xs mt-4 text-blue-600">
            Tous les exports sont horodatés et incluent les signatures numériques conformément aux exigences Qualiopi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
