/**
 * Hook pour les notifications en temps réel
 * Détecte les nouveaux cours, sessions, étudiants et inscriptions
 */

'use client';

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NotificationConfig {
  enabled: boolean;
  pollingInterval?: number; // en ms
}

export function useRealtimeNotifications(config: NotificationConfig = { enabled: true, pollingInterval: 10000 }) {
  const previousCounts = useRef({
    cours: 0,
    sessions: 0,
    etudiants: 0,
    inscriptions: 0,
  });

  const isFirstRender = useRef(true);

  // Query pour les cours
  const { data: cours } = useQuery({
    queryKey: ['cours-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
    enabled: config.enabled,
    refetchInterval: config.pollingInterval,
    refetchOnWindowFocus: false,
  });

  // Query pour les sessions
  const { data: sessions } = useQuery({
    queryKey: ['sessions-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Sessions');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
    enabled: config.enabled,
    refetchInterval: config.pollingInterval,
    refetchOnWindowFocus: false,
  });

  // Query pour les étudiants
  const { data: etudiants } = useQuery({
    queryKey: ['etudiants-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
    enabled: config.enabled,
    refetchInterval: config.pollingInterval,
    refetchOnWindowFocus: false,
  });

  // Query pour les inscriptions
  const { data: inscriptions } = useQuery({
    queryKey: ['inscriptions-notifications'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Inscriptions');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      return data.records || [];
    },
    enabled: config.enabled,
    refetchInterval: config.pollingInterval,
    refetchOnWindowFocus: false,
  });

  // Détecter les changements et afficher les notifications
  useEffect(() => {
    if (!config.enabled) return;

    // Skip au premier rendu pour éviter les fausses notifications
    if (isFirstRender.current) {
      if (cours && sessions && etudiants && inscriptions) {
        previousCounts.current = {
          cours: cours.length,
          sessions: sessions.length,
          etudiants: etudiants.length,
          inscriptions: inscriptions.length,
        };
        isFirstRender.current = false;
      }
      return;
    }

    // Vérifier les nouveaux cours
    if (cours && cours.length > previousCounts.current.cours) {
      const diff = cours.length - previousCounts.current.cours;
      // Trier par date de création pour obtenir le plus récent
      const sortedCours = [...cours].sort((a: any, b: any) => {
        const dateA = new Date(a.createdTime || 0).getTime();
        const dateB = new Date(b.createdTime || 0).getTime();
        return dateB - dateA;
      });
      const latestCours = sortedCours[0];
      const coursName = latestCours?.fields?.['Nom du cours'] || latestCours?.fields?.Sujet || 'Nouveau cours';
      
      toast('📚 Nouveau cours créé', {
        description: coursName,
        duration: 4000,
        className: '[&_.sonner-toast-description]:text-foreground [&_.sonner-toast-description]:font-medium',
      });
      previousCounts.current.cours = cours.length;
    }

    // Vérifier les nouvelles sessions
    if (sessions && sessions.length > previousCounts.current.sessions) {
      const diff = sessions.length - previousCounts.current.sessions;
      // Trier par date de création pour obtenir la plus récente
      const sortedSessions = [...sessions].sort((a: any, b: any) => {
        const dateA = new Date(a.createdTime || 0).getTime();
        const dateB = new Date(b.createdTime || 0).getTime();
        return dateB - dateA;
      });
      const latestSession = sortedSessions[0];
      const sessionName = latestSession?.fields?.['Nom de la session'] || 'Nouvelle session';
      
      toast('📅 Nouvelle session créée', {
        description: sessionName,
        duration: 4000,
        style: {
          '--description-color': 'hsl(var(--foreground))',
        } as React.CSSProperties,
        className: '[&_[data-description]]:!text-[--description-color] [&_[data-description]]:font-medium',
      });
      previousCounts.current.sessions = sessions.length;
    }

    // Vérifier les nouveaux étudiants
    if (etudiants && etudiants.length > previousCounts.current.etudiants) {
      const diff = etudiants.length - previousCounts.current.etudiants;
      // Trier par date de création pour obtenir le plus récent
      const sortedEtudiants = [...etudiants].sort((a: any, b: any) => {
        const dateA = new Date(a.createdTime || 0).getTime();
        const dateB = new Date(b.createdTime || 0).getTime();
        return dateB - dateA;
      });
      const latestEtudiant = sortedEtudiants[0];
      const etudiantName = `${latestEtudiant?.fields?.Prénom || ''} ${latestEtudiant?.fields?.Nom || ''}`.trim() || 'Nouvel étudiant';
      
      toast('👤 Nouvel étudiant inscrit', {
        description: etudiantName,
        duration: 4000,
        className: '[&_.sonner-toast-description]:text-foreground [&_.sonner-toast-description]:font-medium',
      });
      previousCounts.current.etudiants = etudiants.length;
    }

    // Vérifier les nouvelles inscriptions
    if (inscriptions && inscriptions.length > previousCounts.current.inscriptions) {
      const diff = inscriptions.length - previousCounts.current.inscriptions;
      
      toast('✅ Nouvelle inscription', {
        description: `${diff} inscription${diff > 1 ? 's' : ''} ajoutée${diff > 1 ? 's' : ''}`,
        duration: 4000,
        className: '[&_.sonner-toast-description]:text-foreground [&_.sonner-toast-description]:font-medium',
      });
      previousCounts.current.inscriptions = inscriptions.length;
    }
  }, [cours, sessions, etudiants, inscriptions, config.enabled]);
}
