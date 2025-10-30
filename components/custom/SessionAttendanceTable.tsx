/**
 * Composant SessionAttendanceTable - Affiche les présences pour une session
 * Utilisé dans les détails d'un cours et les vues sessions
 */

'use client';

import * as React from 'react';
import { AirtableRecord, EtudiantFields, PresenceFields } from '@/lib/airtable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionAttendanceTableProps {
  etudiants: AirtableRecord<EtudiantFields>[];
  presences: AirtableRecord<PresenceFields>[];
  sessionDate?: string;
}

export function SessionAttendanceTable({
  etudiants,
  presences,
  sessionDate,
}: SessionAttendanceTableProps) {
  // Créer une map des présences par étudiant
  const presenceMap = new Map(
    presences.map((p) => [p.fields.Étudiant?.[0], p])
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Étudiant</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Signature</TableHead>
            <TableHead>Horodatage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {etudiants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucun étudiant inscrit
              </TableCell>
            </TableRow>
          ) : (
            etudiants.map((etudiant) => {
              const presence = presenceMap.get(etudiant.id);
              const isPresent = presence?.fields['Présent ?'];

              return (
                <TableRow key={etudiant.id}>
                  <TableCell className="font-medium">
                    {etudiant.fields.Prénom} {etudiant.fields.Nom}
                  </TableCell>
                  <TableCell>{etudiant.fields.Email}</TableCell>
                  <TableCell>
                    {presence ? (
                      isPresent ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Présent
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Absent
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {presence?.fields.Signature ? (
                      <span className="text-sm text-muted-foreground">
                        ✓ Signé
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {presence?.fields.Horodatage ? (
                      <span className="text-sm text-muted-foreground">
                        {format(
                          new Date(presence.fields.Horodatage),
                          'dd/MM/yyyy HH:mm',
                          { locale: fr }
                        )}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
