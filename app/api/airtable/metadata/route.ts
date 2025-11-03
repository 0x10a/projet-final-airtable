/**
 * Route API pour récupérer les métadonnées des tables Airtable
 * Permet de récupérer les options des champs Single Select
 */

import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

/**
 * GET - Récupère les métadonnées d'une table (structure des champs)
 * Query params: tableName
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('tableName');

    if (!tableName) {
      return NextResponse.json(
        { error: 'Le paramètre tableName est requis' },
        { status: 400 }
      );
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Configuration Airtable manquante' },
        { status: 500 }
      );
    }

    // Récupérer les métadonnées de la base
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erreur Airtable Metadata API:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des métadonnées', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Trouver la table spécifique
    const table = data.tables.find((t: any) => t.name === tableName);
    
    if (!table) {
      return NextResponse.json(
        { error: `Table "${tableName}" non trouvée` },
        { status: 404 }
      );
    }

    // Retourner les métadonnées de la table
    return NextResponse.json({
      table: {
        id: table.id,
        name: table.name,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          options: field.options || null, // Contient les options pour Single Select, Multiple Select, etc.
        })),
      },
    });

  } catch (error) {
    console.error('Erreur serveur metadata:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des métadonnées' },
      { status: 500 }
    );
  }
}
