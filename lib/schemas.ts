/**
 * Schémas de validation Zod pour Design.academy
 * Tous les formulaires utilisent ces schémas pour la validation
 */

import { z } from 'zod';

// ========================================
// SCHÉMA ÉTUDIANT
// ========================================

export const etudiantSchema = z.object({
  Prénom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  Nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  Email: z.string().email('Adresse email invalide'),
  Téléphone: z.string().optional(),
  Adresse: z.string().optional(),
  Notes: z.string().optional(),
});

export type EtudiantFormData = z.infer<typeof etudiantSchema>;

// ========================================
// SCHÉMA COURS
// ========================================

export const coursSchema = z.object({
  Sujet: z.string().min(1, 'Le sujet est obligatoire'),
  Niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé', 'Expert']).optional(),
  'Date de début': z.string().min(1, 'La date de début est obligatoire'),
  'Durée (jours)': z.number().positive('La durée doit être positive').min(1, 'La durée est obligatoire'),
  Formateur: z.string().optional(),
  'Objectifs pédagogiques': z.string().optional(),
  Prérequis: z.string().optional(),
  Modalité: z.enum(['Présentiel', 'Distanciel', 'Hybride']),
});

export type CoursFormData = z.infer<typeof coursSchema>;

// ========================================
// SCHÉMA SESSION
// ========================================

export const sessionSchema = z.object({
  'Nom de la session': z.string().min(3, 'Le nom de la session doit contenir au moins 3 caractères'),
  'Date de la session': z.string().min(1, 'La date est requise'),
  Cours: z.array(z.string()).optional(), // Linked record IDs
});

export type SessionFormData = z.infer<typeof sessionSchema>;

// ========================================
// SCHÉMA INSCRIPTION
// ========================================

export const inscriptionSchema = z.object({
  Étudiant: z.array(z.string()).min(1, 'Veuillez sélectionner un étudiant'),
  Cours: z.array(z.string()).min(1, 'Veuillez sélectionner un cours'),
  "Date d'inscription": z.string().optional(),
  Statut: z.enum(['Inscrit', 'Terminé', 'Annulé']).optional(),
});

export type InscriptionFormData = z.infer<typeof inscriptionSchema>;

// ========================================
// SCHÉMA PRÉSENCE (ÉMARGEMENT)
// ========================================

export const presenceSchema = z.object({
  Session: z.array(z.string()).min(1, 'Session requise'),
  Étudiant: z.array(z.string()).min(1, 'Veuillez sélectionner votre nom'),
  'Présent ?': z.boolean().default(true),
  Signature: z.string().optional(),
  Horodatage: z.string().optional(),
});

export type PresenceFormData = z.infer<typeof presenceSchema>;

// ========================================
// SCHÉMA SIMPLIFIÉ POUR L'ÉMARGEMENT PUBLIC
// ========================================

export const emargementPublicSchema = z.object({
  presenceId: z.string().min(1, 'Veuillez sélectionner votre nom'),
  signature: z.string().min(1, 'La signature est requise'),
});

export type EmargementPublicFormData = z.infer<typeof emargementPublicSchema>;

// ========================================
// SCHÉMAS POUR LES FILTRES
// ========================================

export const coursFilterSchema = z.object({
  sujet: z.string().optional(),
  niveau: z.enum(['Débutant', 'Intermédiaire', 'Avancé', 'Expert', '']).optional(),
  formateur: z.string().optional(),
});

export type CoursFilterData = z.infer<typeof coursFilterSchema>;
