/**
 * Composant SessionsCalendar - Calendrier interactif des sessions
 * Affiche les sessions avec navigation mensuelle et changement de vue (mois/semaine/jour)
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configuration du localizer avec date-fns en français
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

interface Session {
  id: string;
  fields: {
    'Nom de la session': string;
    'Date de la session': string;
    Cours?: string[];
  };
}

interface Cours {
  id: string;
  fields: {
    'Nom du cours': string;
  };
}

interface SessionsCalendarProps {
  sessions: Session[];
  cours: Cours[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    sessionName: string;
    courseName: string;
  };
}

export function SessionsCalendar({ sessions, cours }: SessionsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  // Transformer les sessions en événements de calendrier
  const events = useMemo<CalendarEvent[]>(() => {
    if (!sessions || !cours) return [];

    return sessions.map(session => {
      const sessionDate = new Date(session.fields['Date de la session']);
      const coursId = session.fields.Cours?.[0];
      const coursObj = cours.find(c => c.id === coursId);
      const coursName = coursObj?.fields['Nom du cours'] || 'Cours non spécifié';

      // Événement d'une journée (9h à 17h par défaut)
      const startDate = new Date(sessionDate);
      startDate.setHours(9, 0, 0);
      const endDate = new Date(sessionDate);
      endDate.setHours(17, 0, 0);

      return {
        id: session.id,
        title: `${session.fields['Nom de la session']} - ${coursName}`,
        start: startDate,
        end: endDate,
        resource: {
          sessionName: session.fields['Nom de la session'],
          courseName: coursName,
        },
      };
    });
  }, [sessions, cours]);

  // Navigation
  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    if (action === 'PREV') {
      setCurrentDate(prev => subMonths(prev, 1));
    } else if (action === 'NEXT') {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setCurrentDate(new Date());
    }
  }, []);

  // Style personnalisé pour les événements
  const eventStyleGetter = useCallback(() => {
    return {
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
      },
    };
  }, []);

  // Messages en français
  const messages = {
    allDay: 'Toute la journée',
    previous: 'Précédent',
    next: 'Suivant',
    today: "Aujourd'hui",
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement',
    noEventsInRange: 'Aucune session dans cette période.',
    showMore: (total: number) => `+ ${total} session(s)`,
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec navigation et sélection de vue */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate('PREV')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate('TODAY')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Aujourd'hui
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleNavigate('NEXT')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-4 text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('month')}
          >
            Mois
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Semaine
          </Button>
          <Button
            variant={view === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Jour
          </Button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg border p-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="fr"
          messages={messages}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          eventPropGetter={eventStyleGetter}
          popup
          selectable
          style={{ height: '100%' }}
          toolbar={false} // On utilise notre propre toolbar
        />
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span>Session planifiée</span>
        </div>
        <span className="ml-auto">
          {events.length} session{events.length > 1 ? 's' : ''} ce mois
        </span>
      </div>
    </div>
  );
}
