/**
 * Hook React Query pour gérer les données Airtable
 * Fournit des hooks réutilisables pour GET, POST, PUT, DELETE avec cache automatique
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AirtableRecord, BaseFields } from '@/lib/airtable';

// Types pour les paramètres d'API
interface GetRecordsParams {
  tableName?: string;
  view?: string;
  filterByFormula?: string;
  maxRecords?: number;
  fields?: string[];
}

interface CreateRecordParams {
  tableName?: string;
  fields: Record<string, any>;
}

interface UpdateRecordParams {
  tableName?: string;
  recordId: string;
  fields: Record<string, any>;
}

interface DeleteRecordParams {
  tableName?: string;
  recordId: string;
}

/**
 * Hook pour récupérer les records d'une table
 */
export function useAirtableRecords<T extends BaseFields = BaseFields>(
  params: GetRecordsParams,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['airtable-records', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params.tableName) searchParams.append('tableName', params.tableName);
      if (params.view) searchParams.append('view', params.view);
      if (params.filterByFormula) searchParams.append('filterByFormula', params.filterByFormula);
      if (params.maxRecords) searchParams.append('maxRecords', params.maxRecords.toString());
      if (params.fields) searchParams.append('fields', params.fields.join(','));

      const response = await fetch(`/api/airtable?${searchParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération des données');
      }

      const data = await response.json();
      return data.records as AirtableRecord<T>[];
    },
    enabled,
  });
}

/**
 * Hook pour récupérer un seul record par son ID
 */
export function useAirtableRecord<T extends BaseFields = BaseFields>(
  tableName: string | undefined,
  recordId: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['airtable-record', tableName, recordId],
    queryFn: async () => {
      if (!recordId) throw new Error('recordId est requis');

      const searchParams = new URLSearchParams();
      if (tableName) searchParams.append('tableName', tableName);
      searchParams.append('recordId', recordId);

      const response = await fetch(`/api/airtable?${searchParams.toString()}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la récupération du record');
      }

      const data = await response.json();
      return data.record as AirtableRecord<T>;
    },
    enabled: enabled && !!recordId,
  });
}

/**
 * Hook pour créer un nouveau record
 */
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateRecordParams) => {
      const response = await fetch('/api/airtable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du record');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['airtable-records'] });
    },
  });
}

/**
 * Hook pour mettre à jour un record existant
 */
export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateRecordParams) => {
      const response = await fetch('/api/airtable', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du record');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalider le cache pour ce record spécifique et la liste
      queryClient.invalidateQueries({ queryKey: ['airtable-records'] });
      queryClient.invalidateQueries({ 
        queryKey: ['airtable-record', variables.tableName, variables.recordId] 
      });
    },
  });
}

/**
 * Hook pour supprimer un record
 */
export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: DeleteRecordParams) => {
      const response = await fetch('/api/airtable', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la suppression du record');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalider le cache pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: ['airtable-records'] });
    },
  });
}
