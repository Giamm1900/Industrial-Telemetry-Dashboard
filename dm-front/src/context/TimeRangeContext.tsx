import { createContext } from 'react';

export type Preset = '10m' | '1h' | '6h' | '24h' | '7d' | '14d';

export interface TimeRangeValue {
  mode: 'preset' | 'custom';
  preset: Preset;
  customFrom: string;
  customTo: string;
  viewDate: string;           // formato "YYYY-MM-DD"
  setPreset: (p: Preset) => void;
  setCustomRange: (from: string, to: string) => void;
  prevDay: () => void;
  nextDay: () => void;
  setViewDate: (date: string) => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const TimeRangeContext = createContext<TimeRangeValue>({
  mode: 'preset',
  preset: '1h',
  customFrom: '',
  customTo: '',
  viewDate: todayStr(),
  setPreset: () => {},
  setCustomRange: () => {},
  prevDay: () => {},
  nextDay: () => {},
  setViewDate: () => {},
});
