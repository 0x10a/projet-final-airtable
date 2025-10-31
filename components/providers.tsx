/**
 * Providers globaux pour React Query et Toaster
 * Permet d'utiliser les hooks dans tous les composants client
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Créer une instance de QueryClient pour chaque utilisateur
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Les données restent fraîches pendant 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="bottom-right" 
        richColors 
        expand={true}
        visibleToasts={5}
        closeButton
      />
    </QueryClientProvider>
  );
}
