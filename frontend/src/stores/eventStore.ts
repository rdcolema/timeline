import { create } from 'zustand';
import type { TimelineEvent, EventCategory } from '../lib/types';
import { ALL_CATEGORIES } from '../lib/constants';
import * as api from '../lib/api';

interface EventState {
  events: TimelineEvent[];
  selectedEvent: TimelineEvent | null;
  isLoading: boolean;
  isGenerating: boolean;
  isEnriching: boolean;
  generateError: string | null;
  generateMessage: string | null;
  searchQuery: string;
  searchResults: TimelineEvent[];
  activeCategories: Set<EventCategory>;
  minSignificance: number;

  fetchEvents: (year: number, bounds?: string) => Promise<void>;
  generateForLocation: (lat: number, lng: number, year: number) => Promise<void>;
  selectEvent: (event: TimelineEvent | null) => void;
  enrichSelectedEvent: () => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  toggleCategory: (cat: EventCategory) => void;
  setMinSignificance: (val: number) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  selectedEvent: null,
  isLoading: false,
  isGenerating: false,
  isEnriching: false,
  generateError: null,
  generateMessage: null,
  searchQuery: '',
  searchResults: [],
  activeCategories: new Set(ALL_CATEGORIES),
  minSignificance: 0,

  fetchEvents: async (year, bounds) => {
    set({ isLoading: true });
    try {
      const res = await api.fetchEvents({ year, bounds });
      set({ events: res.events, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  generateForLocation: async (lat, lng, year) => {
    set({ isGenerating: true, generateError: null, generateMessage: null });
    try {
      const res = await api.generateEvents(lat, lng, year);
      const existing = get().events;
      const existingIds = new Set(existing.map(e => e.id));
      const newEvents = res.events.filter(e => !existingIds.has(e.id));
      if (newEvents.length === 0) {
        set({ events: existing, isGenerating: false, generateMessage: 'No historical events found for this region and time period.' });
        setTimeout(() => set({ generateMessage: null }), 4000);
      } else {
        set({ events: [...existing, ...newEvents], isGenerating: false });
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to generate events';
      set({ isGenerating: false, generateError: msg, generateMessage: msg });
      setTimeout(() => set({ generateMessage: null }), 5000);
    }
  },

  selectEvent: (event) => set({ selectedEvent: event }),

  enrichSelectedEvent: async () => {
    const event = get().selectedEvent;
    if (!event) return;
    if (event.ai_summary) return;
    set({ isEnriching: true });
    try {
      const updated = await api.enrichEvent(event.id);
      set({
        selectedEvent: updated,
        isEnriching: false,
        events: get().events.map((e) => (e.id === updated.id ? updated : e)),
      });
    } catch (err) {
      set({ isEnriching: false });
      throw err;
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ searchQuery: '', searchResults: [] });
      return;
    }
    set({ searchQuery: query });
    try {
      const res = await api.searchEvents(query);
      set({ searchResults: res.results });
    } catch {
      set({ searchResults: [] });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  toggleCategory: (cat) =>
    set((s) => {
      const next = new Set(s.activeCategories);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return { activeCategories: next };
    }),

  setMinSignificance: (val) => set({ minSignificance: val }),
}));
