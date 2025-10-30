/**
 * Route API sécurisée pour les opérations Airtable
 * Toutes les interactions avec Airtable se font côté serveur pour protéger l'API Key
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getRecords,
  getRecord,
  createRecord,
  createRecords,
  updateRecord,
  deleteRecord,
  deleteRecords,
  BaseFields,
} from '@/lib/airtable';

// Type pour les paramètres de requête
interface QueryParams {
  tableName?: string;
  recordId?: string;
  view?: string;
  filterByFormula?: string;
  maxRecords?: string;
  fields?: string;
}

/**
 * GET - Récupère les records d'une table
 * Query params:
 * - tableName: nom de la table (obligatoire)
 * - recordId: ID d'un record spécifique (optionnel)
 * - view: vue Airtable à utiliser (optionnel)
 * - filterByFormula: formule de filtre Airtable (optionnel)
 * - maxRecords: nombre max de records (optionnel)
 * - fields: champs à retourner, séparés par des virgules (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('tableName') || process.env.AIRTABLE_TABLE_NAME;
    const recordId = searchParams.get('recordId');
    const view = searchParams.get('view') || undefined;
    const filterByFormula = searchParams.get('filterByFormula') || undefined;
    const maxRecords = searchParams.get('maxRecords');
    const fieldsParam = searchParams.get('fields');

    if (!tableName) {
      return NextResponse.json(
        { error: 'Le paramètre tableName est requis' },
        { status: 400 }
      );
    }

    // Si un recordId est fourni, récupérer un seul record
    if (recordId) {
      const record = await getRecord<BaseFields>(tableName, recordId);
      return NextResponse.json({ record });
    }

    // Sinon, récupérer tous les records avec les options de filtrage
    const options: any = {};
    if (view) options.view = view;
    if (filterByFormula) options.filterByFormula = filterByFormula;
    if (maxRecords) options.maxRecords = parseInt(maxRecords);
    if (fieldsParam) options.fields = fieldsParam.split(',').map((f: string) => f.trim());

    const records = await getRecords<BaseFields>(tableName, options);
    
    return NextResponse.json({ 
      records,
      count: records.length 
    });

  } catch (error: any) {
    console.error('Erreur GET /api/airtable:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

/**
 * POST - Crée un ou plusieurs nouveaux records
 * Body JSON:
 * - tableName: nom de la table (obligatoire)
 * - fields: objet contenant les champs du record (pour un seul record)
 * - records: tableau d'objets fields (pour plusieurs records, max 10)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, fields, records } = body;

    const table = tableName || process.env.AIRTABLE_TABLE_NAME;

    if (!table) {
      return NextResponse.json(
        { error: 'Le paramètre tableName est requis' },
        { status: 400 }
      );
    }

    // Création multiple de records
    if (records && Array.isArray(records)) {
      if (records.length === 0) {
        return NextResponse.json(
          { error: 'Le tableau records ne peut pas être vide' },
          { status: 400 }
        );
      }

      if (records.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 records par requête' },
          { status: 400 }
        );
      }

      const createdRecords = await createRecords<BaseFields>(table, records);
      return NextResponse.json({ 
        records: createdRecords,
        count: createdRecords.length,
        message: `${createdRecords.length} record(s) créé(s) avec succès`
      });
    }

    // Création d'un seul record
    if (!fields || Object.keys(fields).length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre fields est requis et ne peut pas être vide' },
        { status: 400 }
      );
    }

    const record = await createRecord<BaseFields>(table, fields);
    return NextResponse.json({ 
      record,
      message: 'Record créé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur POST /api/airtable:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du record' },
      { status: 500 }
    );
  }
}

/**
 * PUT/PATCH - Met à jour un record existant
 * Body JSON:
 * - tableName: nom de la table (obligatoire)
 * - recordId: ID du record à mettre à jour (obligatoire)
 * - fields: champs à mettre à jour (obligatoire)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, recordId, fields } = body;

    const table = tableName || process.env.AIRTABLE_TABLE_NAME;

    if (!table) {
      return NextResponse.json(
        { error: 'Le paramètre tableName est requis' },
        { status: 400 }
      );
    }

    if (!recordId) {
      return NextResponse.json(
        { error: 'Le paramètre recordId est requis' },
        { status: 400 }
      );
    }

    if (!fields || Object.keys(fields).length === 0) {
      return NextResponse.json(
        { error: 'Le paramètre fields est requis et ne peut pas être vide' },
        { status: 400 }
      );
    }

    const record = await updateRecord<BaseFields>(table, recordId, fields);
    return NextResponse.json({ 
      record,
      message: 'Record mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('Erreur PUT /api/airtable:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du record' },
      { status: 500 }
    );
  }
}

// Alias PATCH pour PUT
export async function PATCH(request: NextRequest) {
  return PUT(request);
}

/**
 * DELETE - Supprime un ou plusieurs records
 * Body JSON:
 * - tableName: nom de la table (obligatoire)
 * - recordId: ID du record à supprimer (pour un seul)
 * - recordIds: tableau d'IDs de records à supprimer (pour plusieurs, max 10)
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableName, recordId, recordIds } = body;

    const table = tableName || process.env.AIRTABLE_TABLE_NAME;

    if (!table) {
      return NextResponse.json(
        { error: 'Le paramètre tableName est requis' },
        { status: 400 }
      );
    }

    // Suppression multiple de records
    if (recordIds && Array.isArray(recordIds)) {
      if (recordIds.length === 0) {
        return NextResponse.json(
          { error: 'Le tableau recordIds ne peut pas être vide' },
          { status: 400 }
        );
      }

      if (recordIds.length > 10) {
        return NextResponse.json(
          { error: 'Maximum 10 records par requête' },
          { status: 400 }
        );
      }

      await deleteRecords(table, recordIds);
      return NextResponse.json({ 
        success: true,
        count: recordIds.length,
        message: `${recordIds.length} record(s) supprimé(s) avec succès`
      });
    }

    // Suppression d'un seul record
    if (!recordId) {
      return NextResponse.json(
        { error: 'Le paramètre recordId ou recordIds est requis' },
        { status: 400 }
      );
    }

    await deleteRecord(table, recordId);
    return NextResponse.json({ 
      success: true,
      message: 'Record supprimé avec succès'
    });

  } catch (error: any) {
    console.error('Erreur DELETE /api/airtable:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du record' },
      { status: 500 }
    );
  }
}
