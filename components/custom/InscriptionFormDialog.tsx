/**
 * InscriptionFormDialog - Formulaire modal pour créer/modifier une inscription
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { inscriptionSchema, type InscriptionFormData } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Check, ChevronsUpDown } from 'lucide-react';
import { EtudiantFormDialog } from '@/components/custom/EtudiantFormDialog';
import { cn } from '@/lib/utils';

interface InscriptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inscription?: {
    id: string;
    fields: {
      Étudiant?: string[];
      Cours?: string[];
      "Date d'inscription"?: string;
      Statut?: 'Inscrit' | 'Terminé' | 'Annulé';
    };
  } | null;
  onSuccess: () => void;
}

interface Etudiant {
  id: string;
  fields: {
    Prénom: string;
    Nom: string;
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
  };
}

export function InscriptionFormDialog({
  open,
  onOpenChange,
  inscription,
  onSuccess,
}: InscriptionFormDialogProps) {
  const isEditing = !!inscription;
  const [etudiantSearch, setEtudiantSearch] = useState('');
  const [etudiantOpen, setEtudiantOpen] = useState(false);
  const [isEtudiantDialogOpen, setIsEtudiantDialogOpen] = useState(false);
  const [coursSearch, setCoursSearch] = useState('');
  const [coursOpen, setCoursOpen] = useState(false);

  // Récupérer les étudiants pour le select
  const { data: etudiants, isLoading: etudiantsLoading, refetch: refetchEtudiants } = useQuery<Etudiant[]>({
    queryKey: ['etudiants'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Étudiants');
      if (!res.ok) throw new Error('Erreur lors du chargement des étudiants');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Filtrer les étudiants selon la recherche
  const filteredEtudiants = useMemo(() => {
    if (!etudiants) return [];
    if (!etudiantSearch) return etudiants;
    
    const search = etudiantSearch.toLowerCase();
    return etudiants.filter(e => {
      const fullName = `${e.fields.Prénom} ${e.fields.Nom}`.toLowerCase();
      return fullName.includes(search);
    });
  }, [etudiants, etudiantSearch]);

  // Récupérer les cours pour le select
  const { data: cours, isLoading: coursLoading } = useQuery<Cours[]>({
    queryKey: ['cours'],
    queryFn: async () => {
      const res = await fetch('/api/airtable?tableName=Cours');
      if (!res.ok) throw new Error('Erreur lors du chargement des cours');
      const data = await res.json();
      return data.records || [];
    },
  });

  // Filtrer les cours selon la recherche
  const filteredCours = useMemo(() => {
    if (!cours) return [];
    if (!coursSearch) return cours;
    
    const search = coursSearch.toLowerCase();
    return cours.filter(c => {
      const coursName = c.fields['Nom du cours'].toLowerCase();
      return coursName.includes(search);
    });
  }, [cours, coursSearch]);

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(inscriptionSchema),
    defaultValues: {
      Étudiant: [],
      Cours: [],
      "Date d'inscription": new Date().toISOString().split('T')[0],
      Statut: 'Inscrit',
    },
  });

  // Charger les données en mode édition
  useEffect(() => {
    if (inscription) {
      form.reset({
        Étudiant: inscription.fields.Étudiant || [],
        Cours: inscription.fields.Cours || [],
        "Date d'inscription": inscription.fields["Date d'inscription"] || new Date().toISOString().split('T')[0],
        Statut: inscription.fields.Statut || 'Inscrit',
      });
    } else {
      form.reset({
        Étudiant: [],
        Cours: [],
        "Date d'inscription": new Date().toISOString().split('T')[0],
        Statut: 'Inscrit',
      });
    }
  }, [inscription, form]);

  const onSubmit = async (data: InscriptionFormData) => {
    try {
      const url = '/api/airtable';
      const method = isEditing ? 'PUT' : 'POST';

      const body = isEditing
        ? {
            tableName: 'Inscriptions',
            recordId: inscription.id,
            fields: data,
          }
        : {
            tableName: 'Inscriptions',
            fields: data,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(
        isEditing
          ? 'Inscription mise à jour avec succès'
          : 'Inscription créée avec succès'
      );

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors de la sauvegarde'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier l\'inscription' : 'Créer une nouvelle inscription'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations de l\'inscription'
              : 'Associez un étudiant à un cours'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Étudiant avec recherche */}
            <FormField
              control={form.control}
              name="Étudiant"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <FormLabel>Étudiant</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEtudiantDialogOpen(true)}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Nouvel étudiant
                    </Button>
                  </div>
                  <Popover open={etudiantOpen} onOpenChange={setEtudiantOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.[0] && "text-muted-foreground"
                          )}
                        >
                          {field.value?.[0]
                            ? etudiants?.find((e) => e.id === field.value?.[0])
                                ? `${etudiants.find((e) => e.id === field.value?.[0])?.fields.Prénom} ${etudiants.find((e) => e.id === field.value?.[0])?.fields.Nom}`
                                : "Sélectionner un étudiant"
                            : "Sélectionner un étudiant"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" onWheel={(e) => e.stopPropagation()}>
                      <div className="p-2">
                        <Input
                          placeholder="Rechercher un étudiant..."
                          value={etudiantSearch}
                          onChange={(e) => setEtudiantSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                        {etudiantsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : filteredEtudiants.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Aucun étudiant trouvé
                          </div>
                        ) : (
                          filteredEtudiants.map((etudiant) => (
                            <button
                              key={etudiant.id}
                              type="button"
                              onClick={() => {
                                field.onChange([etudiant.id]);
                                setEtudiantOpen(false);
                                setEtudiantSearch('');
                              }}
                              className={cn(
                                "w-full flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer",
                                field.value?.[0] === etudiant.id && "bg-accent"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.[0] === etudiant.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {etudiant.fields.Prénom} {etudiant.fields.Nom}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cours avec recherche */}
            <FormField
              control={form.control}
              name="Cours"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Cours</FormLabel>
                  <Popover open={coursOpen} onOpenChange={setCoursOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value?.[0] && "text-muted-foreground"
                          )}
                        >
                          {field.value?.[0]
                            ? cours?.find((c) => c.id === field.value?.[0])?.fields['Nom du cours'] || "Sélectionner un cours"
                            : "Sélectionner un cours"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0" onWheel={(e) => e.stopPropagation()}>
                      <div className="p-2">
                        <Input
                          placeholder="Rechercher un cours..."
                          value={coursSearch}
                          onChange={(e) => setCoursSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto overscroll-contain">
                        {coursLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : filteredCours.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">
                            Aucun cours trouvé
                          </div>
                        ) : (
                          filteredCours.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                field.onChange([c.id]);
                                setCoursOpen(false);
                                setCoursSearch('');
                              }}
                              className={cn(
                                "w-full flex items-center px-3 py-2 text-sm hover:bg-accent cursor-pointer",
                                field.value?.[0] === c.id && "bg-accent"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.[0] === c.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {c.fields['Nom du cours']}
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date d'inscription */}
            <FormField
              control={form.control}
              name="Date d'inscription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date d'inscription</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Statut */}
            <FormField
              control={form.control}
              name="Statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Inscrit">Inscrit</SelectItem>
                      <SelectItem value="Terminé">Terminé</SelectItem>
                      <SelectItem value="Annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : isEditing ? (
                  'Mettre à jour'
                ) : (
                  'Créer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {/* Dialog pour ajouter un étudiant */}
      <EtudiantFormDialog
        open={isEtudiantDialogOpen}
        onOpenChange={setIsEtudiantDialogOpen}
        etudiant={null}
        onSuccess={() => {
          refetchEtudiants();
          setIsEtudiantDialogOpen(false);
          toast.success('Étudiant ajouté ! Vous pouvez maintenant le sélectionner.');
        }}
      />
    </Dialog>
  );
}
