/**
 * Configuration et helpers pour l'intégration Airtable
 * Ce fichier gère toutes les interactions avec l'API Airtable
 */

import Airtable, { FieldSet, Records } from 'airtable';

// Vérification des variables d'environnement
if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('AIRTABLE_API_KEY manquante dans .env.local');
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('AIRTABLE_BASE_ID manquante dans .env.local');
}

// Configuration du client Airtable
const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
const base = airtable.base(process.env.AIRTABLE_BASE_ID);

// Types TypeScript pour les records Airtable
export interface AirtableRecord<T = FieldSet> {
  id: string;
  fields: T;
  createdTime?: string;
}

export interface AirtableResponse<T = FieldSet> {
  records: AirtableRecord<T>[];
  offset?: string;
}

// Type générique pour les champs personnalisés
export interface BaseFields extends FieldSet {
  [key: string]: any;
}

// ========================================
// TYPES SPÉCIFIQUES DESIGN.ACADEMY
// ========================================

// Table Étudiants
export interface EtudiantFields extends BaseFields {
  Prénom: string;
  Nom: string;
  Email: string;
  Téléphone?: string;
  Adresse?: string;
  Notes?: string;
}

// Table Cours
export interface CoursFields extends BaseFields {
  'Nom du cours': string;
  Sujet?: string;
  Niveau?: string;
  'Date de début'?: string;
  'Durée (jours)'?: number;
  Formateur?: string;
  'Objectifs pédagogiques'?: string;
  Prérequis?: string;
  Programme?: string;
  Modalité?: string;
  Sessions?: string[]; // Linked records IDs
  Inscriptions?: string[]; // Linked records IDs
}

// Table Sessions
export interface SessionFields extends BaseFields {
  'Nom de la session': string;
  'Date de la session': string;
  Cours?: string[]; // Linked record ID
  Présences?: string[]; // Linked records IDs
}

// Table Inscriptions
export interface InscriptionFields extends BaseFields {
  Étudiant?: string[]; // Linked record ID
  Cours?: string[]; // Linked record ID
  "Date d'inscription"?: string;
  Statut?: 'Inscrit' | 'Terminé' | 'Annulé';
}

// Table Présences
export interface PresenceFields extends BaseFields {
  Session?: string[]; // Linked record ID
  Étudiant?: string[]; // Linked record ID
  'Présent ?'?: boolean;
  Signature?: string;
  Horodatage?: string;
  'Date de la session (from Sessions)'?: string; // Lookup field
}

/**
 * Récupère tous les records d'une table Airtable
 * @param tableName - Nom de la table Airtable
 * @param options - Options de filtrage et tri (view, filterByFormula, sort, maxRecords)
 * @returns Liste des records avec leur ID et champs
 */
export async function getRecords<T extends FieldSet = BaseFields>(
  tableName: string,
  options?: {
    view?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction?: 'asc' | 'desc' }>;
    maxRecords?: number;
    fields?: string[];
  }
): Promise<AirtableRecord<T>[]> {
  try {
    // Build select options object, only including defined values
    const selectOptions: any = {};
    
    if (options?.view) selectOptions.view = options.view;
    if (options?.filterByFormula) selectOptions.filterByFormula = options.filterByFormula;
    if (options?.sort) selectOptions.sort = options.sort;
    if (options?.maxRecords) selectOptions.maxRecords = options.maxRecords;
    if (options?.fields) selectOptions.fields = options.fields;

    const query = base(tableName).select(selectOptions);

    const records: AirtableRecord<T>[] = [];
    
    await query.eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach((record) => {
        records.push({
          id: record.id,
          fields: record.fields as T,
          createdTime: record.get('Created') as string | undefined,
        });
      });
      fetchNextPage();
    });

    return records;
  } catch (error) {
    console.error('Erreur lors de la récupération des records:', error);
    throw new Error(`Impossible de récupérer les records de ${tableName}`);
  }
}

/**
 * Récupère un seul record par son ID
 * @param tableName - Nom de la table Airtable
 * @param recordId - ID unique du record
 * @returns Le record trouvé
 */
export async function getRecord<T extends FieldSet = BaseFields>(
  tableName: string,
  recordId: string
): Promise<AirtableRecord<T>> {
  try {
    const record = await base(tableName).find(recordId);
    
    // Vérifier que le record existe
    if (!record || !record.id) {
      throw new Error(`Record ${recordId} introuvable dans ${tableName}`);
    }
    
    return {
      id: record.id,
      fields: record.fields as T,
      createdTime: record.get('Created') as string | undefined,
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du record ${recordId}:`, error);
    throw new Error(`Record ${recordId} introuvable dans ${tableName}`);
  }
}

/**
 * Crée un nouveau record dans Airtable
 * @param tableName - Nom de la table Airtable
 * @param fields - Données du nouveau record
 * @returns Le record créé avec son ID
 */
export async function createRecord<T extends FieldSet = BaseFields>(
  tableName: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  try {
    const record = await base(tableName).create(fields as FieldSet);
    return {
      id: record.id,
      fields: record.fields as T,
      createdTime: record.get('Created') as string | undefined,
    };
  } catch (error) {
    console.error('Erreur lors de la création du record:', error);
    throw new Error(`Impossible de créer le record dans ${tableName}`);
  }
}

/**
 * Crée plusieurs records en une seule requête (max 10)
 * @param tableName - Nom de la table Airtable
 * @param recordsData - Tableau de données pour les nouveaux records
 * @returns Les records créés
 */
export async function createRecords<T extends FieldSet = BaseFields>(
  tableName: string,
  recordsData: Array<Partial<T>>
): Promise<AirtableRecord<T>[]> {
  try {
    // Airtable limite à 10 records par requête
    if (recordsData.length > 10) {
      throw new Error('Maximum 10 records par requête');
    }

    const records = await base(tableName).create(
      recordsData.map(fields => ({ fields: fields as FieldSet }))
    );

    return records.map(record => ({
      id: record.id,
      fields: record.fields as T,
      createdTime: record.get('Created') as string | undefined,
    }));
  } catch (error) {
    console.error('Erreur lors de la création des records:', error);
    throw new Error(`Impossible de créer les records dans ${tableName}`);
  }
}

/**
 * Met à jour un record existant
 * @param tableName - Nom de la table Airtable
 * @param recordId - ID du record à mettre à jour
 * @param fields - Champs à mettre à jour (fusion partielle)
 * @returns Le record mis à jour
 */
export async function updateRecord<T extends FieldSet = BaseFields>(
  tableName: string,
  recordId: string,
  fields: Partial<T>
): Promise<AirtableRecord<T>> {
  try {
    const record = await base(tableName).update(recordId, fields as FieldSet);
    return {
      id: record.id,
      fields: record.fields as T,
      createdTime: record.get('Created') as string | undefined,
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du record ${recordId}:`, error);
    throw new Error(`Impossible de mettre à jour le record ${recordId}`);
  }
}

/**
 * Remplace complètement un record (tous les champs non spécifiés seront supprimés)
 * @param tableName - Nom de la table Airtable
 * @param recordId - ID du record à remplacer
 * @param fields - Nouveaux champs du record
 * @returns Le record remplacé
 */
export async function replaceRecord<T extends FieldSet = BaseFields>(
  tableName: string,
  recordId: string,
  fields: T
): Promise<AirtableRecord<T>> {
  try {
    const record = await base(tableName).replace(recordId, fields as FieldSet);
    return {
      id: record.id,
      fields: record.fields as T,
      createdTime: record.get('Created') as string | undefined,
    };
  } catch (error) {
    console.error(`Erreur lors du remplacement du record ${recordId}:`, error);
    throw new Error(`Impossible de remplacer le record ${recordId}`);
  }
}

/**
 * Supprime un record de la table
 * @param tableName - Nom de la table Airtable
 * @param recordId - ID du record à supprimer
 * @returns True si la suppression a réussi
 */
export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<boolean> {
  try {
    await base(tableName).destroy(recordId);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du record ${recordId}:`, error);
    throw new Error(`Impossible de supprimer le record ${recordId}`);
  }
}

/**
 * Supprime plusieurs records en une seule requête (max 10)
 * @param tableName - Nom de la table Airtable
 * @param recordIds - IDs des records à supprimer
 * @returns True si la suppression a réussi
 */
export async function deleteRecords(
  tableName: string,
  recordIds: string[]
): Promise<boolean> {
  try {
    if (recordIds.length > 10) {
      throw new Error('Maximum 10 records par requête');
    }
    
    await base(tableName).destroy(recordIds);
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression des records:', error);
    throw new Error(`Impossible de supprimer les records`);
  }
}

// Export de l'instance base pour usage avancé si nécessaire
export { base };
export default base;
