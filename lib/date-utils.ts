/**
 * Utilitaires pour le formatage des dates Airtable
 * Gère le parsing sécurisé des dates au format ISO et européen depuis Airtable
 */

import { format, parseISO, parse, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Parse une date depuis différents formats possibles
 * @param dateString - Date au format ISO (YYYY-MM-DD) ou européen (DD/MM/YYYY)
 * @returns Objet Date ou null
 */
function parseDateString(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    // Tenter format ISO d'abord (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss.sssZ)
    let date = parseISO(dateString);
    if (isValid(date)) return date;
    
    // Tenter format européen (DD/MM/YYYY)
    date = parse(dateString, 'dd/MM/yyyy', new Date());
    if (isValid(date)) return date;
    
    // Tenter format européen avec heure (DD/MM/YYYY HH:mm)
    date = parse(dateString, 'dd/MM/yyyy HH:mm', new Date());
    if (isValid(date)) return date;
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Formate une date Airtable (string ISO ou européen) en format lisible
 * @param dateString - Date au format ISO (YYYY-MM-DD) ou européen (DD/MM/YYYY)
 * @param formatString - Format de sortie date-fns (défaut: 'dd MMM yyyy')
 * @returns Date formatée ou '-' si invalide
 */
export function formatAirtableDate(
  dateString: string | undefined | null,
  formatString: string = 'dd MMM yyyy'
): string {
  if (!dateString) return '-';
  
  try {
    const date = parseDateString(dateString);
    return date && isValid(date) ? format(date, formatString, { locale: fr }) : '-';
  } catch {
    return '-';
  }
}

/**
 * Formate une date Airtable en format court
 * @param dateString - Date au format ISO string
 * @returns Date formatée (ex: "15 Oct 2025") ou '-'
 */
export function formatDateShort(dateString: string | undefined | null): string {
  return formatAirtableDate(dateString, 'dd MMM yyyy');
}

/**
 * Formate une date Airtable en format long
 * @param dateString - Date au format ISO string
 * @returns Date formatée (ex: "15 octobre 2025") ou '-'
 */
export function formatDateLong(dateString: string | undefined | null): string {
  return formatAirtableDate(dateString, 'dd MMMM yyyy');
}

/**
 * Formate une date Airtable avec l'heure
 * @param dateString - Date au format ISO string avec heure
 * @returns Date et heure formatées (ex: "15/10/2025 14:30") ou '-'
 */
export function formatDateTime(dateString: string | undefined | null): string {
  return formatAirtableDate(dateString, 'dd/MM/yyyy HH:mm');
}

/**
 * Formate une date Airtable en format numérique
 * @param dateString - Date au format ISO string
 * @returns Date formatée (ex: "15/10/2025") ou '-'
 */
export function formatDateNumeric(dateString: string | undefined | null): string {
  return formatAirtableDate(dateString, 'dd/MM/yyyy');
}

/**
 * Parse une date Airtable en objet Date
 * @param dateString - Date au format ISO (YYYY-MM-DD) ou européen (DD/MM/YYYY)
 * @returns Objet Date ou null si invalide
 */
export function parseAirtableDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  return parseDateString(dateString);
}

/**
 * Vérifie si une date Airtable est valide
 * @param dateString - Date au format ISO string
 * @returns true si la date est valide
 */
export function isValidAirtableDate(dateString: string | undefined | null): boolean {
  return parseAirtableDate(dateString) !== null;
}
