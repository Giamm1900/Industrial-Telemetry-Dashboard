# [01] Extend TimeRangeContext — viewDate globale

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere `viewDate` (data selezionata per la heatmap) come stato globale in `TimeRangeContext`, rimuovendolo dallo stato locale di `ParquetHeatmapPanel`.

**Architecture:** Estensione minimale del context esistente: aggiungere tre campi (`viewDate`, `prevDay`, `nextDay`) a `TimeRangeValue` e implementarli in `TimeRangeProvider`. `ParquetHeatmapPanel` smette di gestire il proprio stato data e lo consuma via `useTimeRange()`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4

---

> **Nota:** Il progetto non ha un test runner configurato (niente vitest/jest nel package.json). I passi di verifica usano il dev server (`npm run dev`) al posto di test automatici.

---

### Task 1: Estendere `TimeRangeValue` con viewDate

**Files:**
- Modify: `dm-front/src/context/TimeRangeContext.tsx`

- [ ] **Step 1: Aprire il file del context**

Path: `dm-front/src/context/TimeRangeContext.tsx`

Contenuto attuale:
```ts
export interface TimeRangeValue {
  mode: 'preset' | 'custom';
  preset: Preset;
  customFrom: string;
  customTo: string;
  setPreset: (p: Preset) => void;
  setCustomRange: (from: string, to: string) => void;
}
```

- [ ] **Step 2: Aggiungere i nuovi campi al tipo e al default**

Sostituire l'intero file con:
```ts
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
});
```

- [ ] **Step 3: Verificare che TypeScript non segnali errori**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: nessun errore su `TimeRangeContext.tsx` (ci saranno errori sul provider e sul pannello — normali, li risolviamo nei task successivi).

---

### Task 2: Implementare viewDate nel provider

**Files:**
- Modify: `dm-front/src/providers/time-range-provider.tsx`

- [ ] **Step 1: Aggiungere la helper `todayStr` e lo stato `viewDate`**

Sostituire l'intero file con:
```ts
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
  const [viewDate, setViewDate] = useState(todayStr);

  const prevDay = useCallback(() => {
    setViewDate(d => offsetDate(d, -1));
  }, []);

  const nextDay = useCallback(() => {
    setViewDate(d => {
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

  return (
    <TimeRangeContext.Provider value={{
      mode, preset, customFrom, customTo,
      viewDate,
      setPreset, setCustomRange,
      prevDay, nextDay,
    }}>
      {children}
    </TimeRangeContext.Provider>
  );
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: nessun errore su `time-range-provider.tsx`. Eventuali errori residui saranno solo su `ParquetHeatmapPanel.tsx` (task successivo).

---

### Task 3: Rimuovere lo stato locale viewDate da ParquetHeatmapPanel

**Files:**
- Modify: `dm-front/src/components/panels/ParquetHeatmapPanel.tsx`

- [ ] **Step 1: Aggiornare gli import**

Trovare la riga degli import del componente. Aggiungere `useTimeRange` agli import:
```ts
import { useMachine } from '../../hooks/useMachine';
import { useTimeRange } from '../../hooks/useTimeRange';
```

- [ ] **Step 2: Sostituire lo stato locale con il context**

Trovare e rimuovere queste righe nel corpo del componente `ParquetHeatmapPanel`:
```ts
const [viewDate, setViewDate] = useState(toLocalDateString(new Date()));

const today = toLocalDateString(new Date());
const isToday = viewDate === today;

const prevDay = useCallback(() => {
  setViewDate(d => {
    const prev = new Date(d + 'T12:00:00');
    prev.setDate(prev.getDate() - 1);
    return toLocalDateString(prev);
  });
}, []);

const nextDay = useCallback(() => {
  if (isToday) return;
  setViewDate(d => {
    const next = new Date(d + 'T12:00:00');
    next.setDate(next.getDate() + 1);
    return toLocalDateString(next);
  });
}, [isToday]);
```

Sostituirle con:
```ts
const { viewDate, prevDay, nextDay } = useTimeRange();
const today = toLocalDateString(new Date());
const isToday = viewDate === today;
```

- [ ] **Step 3: Aggiornare la riga degli import React**

`useCallback` era usato solo per `prevDay` e `nextDay`, ora rimossi. `onEvents` usa `useMemo`. `toLocalDateString` rimane (usata per `today` e `displayDate`).

Sostituire la riga import in cima al file:
```ts
// Prima
import { useMemo, useState, useEffect, useCallback } from 'react';

// Dopo
import { useMemo, useState, useEffect } from 'react';
```

- [ ] **Step 4: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

- [ ] **Step 5: Avviare il dev server e verificare manualmente**

```bash
cd dm-front && npm run dev
```

Aprire `http://localhost:5173`. Verificare:
1. La heatmap si carica normalmente
2. Le freccette ‹ › nel header della heatmap funzionano ancora (per ora sono ancora lì — verranno spostate nell'header globale nel piano 02)
3. Nessun errore in console

- [ ] **Step 6: Commit**

```bash
git add dm-front/src/context/TimeRangeContext.tsx \
        dm-front/src/providers/time-range-provider.tsx \
        dm-front/src/components/panels/ParquetHeatmapPanel.tsx
git commit -m "feat: lift viewDate to TimeRangeContext as global state"
```
