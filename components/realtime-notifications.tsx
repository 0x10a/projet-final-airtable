/**
 * Composant client pour les notifications en temps réel
 * À utiliser dans le layout
 */

'use client';

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

export function RealtimeNotifications() {
  // Activer les notifications avec polling toutes les 5 secondes pour réduire le délai
  useRealtimeNotifications({
    enabled: true,
    pollingInterval: 5000, // 5 secondes
  });

  return null; // Ce composant n'affiche rien, il gère juste les notifications
}
