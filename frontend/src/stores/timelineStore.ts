import { create } from 'zustand';
import { sliderToYear, yearToSlider } from '../lib/yearScale';

interface TimelineState {
  year: number;
  sliderPosition: number;
  isPlaying: boolean;
  playSpeed: number;
  setYear: (year: number) => void;
  setSliderPosition: (pos: number) => void;
  togglePlay: () => void;
  setPlaySpeed: (speed: number) => void;
  tick: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  year: 1900,
  sliderPosition: yearToSlider(1900),
  isPlaying: false,
  playSpeed: 5,

  setYear: (year) => set({ year, sliderPosition: yearToSlider(year) }),
  setSliderPosition: (pos) => set({ sliderPosition: pos, year: sliderToYear(pos) }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaySpeed: (speed) => set({ playSpeed: speed }),
  tick: () =>
    set((s) => {
      const next = s.year + 1;
      if (next > 2025) return { isPlaying: false };
      return { year: next, sliderPosition: yearToSlider(next) };
    }),
}));
