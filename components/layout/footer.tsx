/**
 * Footer global - informations techniques et copyright
 * Une seule ligne discrète en bas de toutes les pages
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Database } from 'lucide-react';

export function Footer() {
  // Récupérer les informations de toutes les tables pour calculer les stats
  const { data: stats } = useQuery({
    queryKey: ['airtable-stats'],
    queryFn: async () => {
      const tables = ['Étudiants', 'Cours', 'Sessions', 'Inscriptions', 'Présences'];
      const results = await Promise.all(
        tables.map(async (table) => {
          try {
            const res = await fetch(`/api/airtable?tableName=${table}`);
            if (!res.ok) return { table, count: 0 };
            const data = await res.json();
            return { table, count: data.records?.length || 0 };
          } catch {
            return { table, count: 0 };
          }
        })
      );
      
      const totalRecords = results.reduce((sum, r) => sum + r.count, 0);
      const tableCount = tables.length;
      
      return {
        totalRecords,
        tableCount,
        status: totalRecords > 0 ? 'Connecté' : 'Déconnecté',
        breakdown: results,
      };
    },
    refetchInterval: 60000, // Rafraîchir toutes les minutes
    staleTime: 30000,
  });

  const appVersion = 'v1.0.3'; // À incrémenter à chaque modification importante

  return (
    <footer className="border-t bg-muted/30 py-3 text-xs text-muted-foreground">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span>© 2025 Projet final Airtable Design.academy</span>
          <span className="hidden sm:inline">•</span>
          <span>Mehdi Tebourbi</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <Database className="h-3 w-3" />
            <span>Airtable: {stats?.status || 'Chargement...'}</span>
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">
            {stats?.totalRecords || 0} records • {stats?.tableCount || 5} tables
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono">{appVersion}</span>
        </div>
      </div>
    </footer>
  );
}
