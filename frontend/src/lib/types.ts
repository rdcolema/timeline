export interface TimelineEvent {
  id: number;
  name: string;
  description: string;
  ai_summary: string | null;
  date_display: string;
  year: number;
  location_name: string;
  latitude: number;
  longitude: number;
  category: EventCategory;
  significance: number;
  location_precision: 'exact' | 'city' | 'region';
}

export type EventCategory =
  | 'military'
  | 'political'
  | 'cultural'
  | 'scientific'
  | 'disaster'
  | 'exploration'
  | 'religious'
  | 'other';

export interface Era {
  name: string;
  startYear: number;
  endYear: number;
  color: string;
}

export interface EventsResponse {
  events: TimelineEvent[];
  total: number;
}

export interface SearchResponse {
  results: TimelineEvent[];
  total: number;
}

export interface MapBounds {
  sw_lat: number;
  sw_lng: number;
  ne_lat: number;
  ne_lng: number;
}
