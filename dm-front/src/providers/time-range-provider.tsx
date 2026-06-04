import { useState, useCallback, type ReactNode } from "react";
import { TimeRangeContext, type Preset } from "../context/TimeRangeContext";

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function TimeRangeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [preset, setPresetState] = useState<Preset>('1h');
  const [customFrom, setCustomFrom] = useState(
    () => new Date(Date.now() - 24 * 60 * 60_000).toISOString().slice(0, 16)
  );
  const [customTo, setCustomTo] = useState(
    () => new Date().toISOString().slice(0, 16)
  );
  const [viewDate, setViewDate_] = useState(todayStr);

  const prevDay = useCallback(() => {
    setViewDate_(d => offsetDate(d, -1));
  }, []);

  const nextDay = useCallback(() => {
    setViewDate_(d => {
      const today = todayStr();
      if (d >= today) return d;
      return offsetDate(d, +1);
    });
  }, []);

  function setPreset(p: Preset) {
    setPresetState(p);
    setMode('preset');
  }

  function setCustomRange(from: string, to: string) {
    setCustomFrom(from);
    setCustomTo(to);
    setMode('custom');
  }

  const setViewDate = useCallback((date: string) => {
    const today = todayStr();
    if (date && date <= today) setViewDate_(date);
  }, [setViewDate_]);

  return (
    <TimeRangeContext.Provider value={{
      mode, preset, customFrom, customTo,
      viewDate,
      setPreset, setCustomRange,
      prevDay, nextDay, setViewDate,
    }}>
      {children}
    </TimeRangeContext.Provider>
  );
}
