# [02] TelemetryHeader — Header unificato

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Creare il componente `TelemetryHeader` che unifica machine select, date nav globale (‹ data ›), LIVE toggle, refresh e preset time range in un unico header fisso.

**Architecture:** Nuovo file `TelemetryHeader.tsx` che consolida la logica di `MachineBar.tsx` e `TimeRangeBar.tsx` (entrambi eliminati). In `Dashboard.tsx` si rimuovono `<MachineBar />` e la riga intermedia `[KpiBar + TimeRangeBar]`, sostituiti con `<TelemetryHeader />`. La KpiBar viene temporaneamente rimossa dall'UI (ritornerà nella colonna destra nel piano 05).

**Prerequisito:** Piano 01 completato (`viewDate`, `prevDay`, `nextDay` disponibili in `useTimeRange()`).

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4

---

### Task 1: Creare `TelemetryHeader.tsx`

**Files:**
- Create: `dm-front/src/components/layout/TelemetryHeader.tsx`

- [ ] **Step 1: Creare il file con il componente completo**

```tsx
import { useState } from 'react';
import { useApiTree } from '../../hooks/useApiTree';
import type { MachineStatus, Machine } from '../../data/mockTree';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useMachine } from '../../hooks/useMachine';
import { useTimeRange } from '../../hooks/useTimeRange';
import type { Preset } from '../../context/TimeRangeContext';

const PRESETS: { value: Preset; label: string }[] = [
  { value: '10m', label: '10 min' },
  { value: '1h',  label: '1 h' },
  { value: '6h',  label: '6 h' },
  { value: '24h', label: '24 h' },
  { value: '7d',  label: '7 g' },
  { value: '14d', label: '14 g' },
];

function dotClass(status: MachineStatus): string {
  if (status === 'online')  return 'bg-green-500';
  if (status === 'offline') return 'bg-red-500';
  return 'bg-slate-400';
}

function fmtDt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ` +
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  );
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function TelemetryHeader() {
  const { selectedMachine, setSelectedMachine } = useMachine();
  const { tree, loading } = useApiTree();
  const { isLive, setLive, refresh } = useTelemetry();
  const {
    mode, preset, customFrom, customTo,
    viewDate, prevDay, nextDay,
    setPreset, setCustomRange,
  } = useTimeRange();

  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo,   setDraftTo]   = useState(customTo);
  const [showCustom, setShowCustom] = useState(mode === 'custom');
  const [rangeError, setRangeError] = useState('');

  function findById(id: string): Machine | null {
    for (const c of tree)
      for (const p of c.plants) {
        const m = p.machines.find(m => m.id === id);
        if (m) return m;
      }
    return null;
  }

  function getBreadcrumb(id: string): string {
    for (const c of tree)
      for (const p of c.plants)
        if (p.machines.some(m => m.id === id))
          return `${c.name} › ${p.name}`;
    return '';
  }

  function handlePreset(p: Preset) {
    setPreset(p);
    setShowCustom(false);
    setRangeError('');
  }

  function handleCustomToggle() {
    setShowCustom(v => !v);
    setRangeError('');
  }

  function handleApply() {
    if (!draftFrom || !draftTo) { setRangeError('Inserisci entrambe le date.'); return; }
    if (draftFrom >= draftTo)   { setRangeError('"Da" deve essere precedente a "A".'); return; }
    setRangeError('');
    setCustomRange(draftFrom, draftTo);
  }

  const breadcrumb   = selectedMachine ? getBreadcrumb(selectedMachine.id) : '';
  const liveDisabled = !selectedMachine || mode === 'custom';
  const displayDate  = viewDate.split('-').reverse().join('/');
  const isToday      = viewDate === todayStr();

  return (
    <div className="bg-white border-b border-slate-200 px-4 shrink-0">
      {/* Riga principale */}
      <div className="flex items-center gap-3 h-14 flex-wrap">

        {/* Machine select */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Macchina</span>
          {selectedMachine && (
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass(selectedMachine.status)}`} />
          )}
          <div className="flex flex-col min-w-0">
            <select
              value={selectedMachine?.id ?? ''}
              onChange={e => setSelectedMachine(findById(e.target.value))}
              disabled={loading}
              title="Seleziona macchina"
              className="border-2 border-slate-300 rounded-md px-2.5 py-1 text-sm font-medium text-slate-800 bg-white appearance-none cursor-pointer outline-none focus:border-blue-500 max-w-56 disabled:text-slate-400 disabled:border-slate-200"
            >
              <option value="">{loading ? 'Caricamento…' : '— seleziona —'}</option>
              {tree.map(client =>
                client.plants.map(plant => (
                  <optgroup key={plant.id} label={`${client.name} › ${plant.name}`}>
                    {plant.machines.map(machine => (
                      <option key={machine.id} value={machine.id}>{machine.name}</option>
                    ))}
                  </optgroup>
                ))
              )}
            </select>
            {breadcrumb && (
              <span className="text-[11px] text-slate-400 leading-none mt-0.5 truncate max-w-56">
                {breadcrumb}
              </span>
            )}
          </div>
        </div>

        {/* Separatore */}
        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Date nav */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={prevDay}
            title="Giorno precedente"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold"
          >‹</button>
          <span className="text-xs text-slate-800 font-semibold font-mono min-w-[5.5rem] text-center bg-slate-100 rounded px-2 py-1">
            {displayDate}
          </span>
          <button
            type="button"
            onClick={nextDay}
            disabled={isToday}
            title={isToday ? 'Giorno corrente' : 'Giorno successivo'}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >›</button>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={refresh}
          disabled={!selectedMachine}
          title="Aggiorna dati ora"
          className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
            <path d="M4 10a6 6 0 1 0 1.17-3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="1 4 4 7 7 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* LIVE toggle */}
        <button
          type="button"
          onClick={() => setLive(!isLive)}
          disabled={liveDisabled}
          title={
            liveDisabled
              ? (mode === 'custom' ? 'Non disponibile in custom' : 'Seleziona una macchina')
              : isLive ? 'Disattiva aggiornamento automatico' : 'Attiva aggiornamento ogni 30s'
          }
          className={`flex items-center gap-1.5 border rounded px-2.5 py-1 text-xs transition-colors shrink-0 ${
            isLive
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          LIVE
        </button>

        {/* Separatore */}
        <div className="w-px h-5 bg-slate-200 shrink-0" />

        {/* Preset pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePreset(p.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === 'preset' && preset === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomToggle}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              mode === 'custom'
                ? 'bg-blue-600 text-white shadow-sm'
                : showCustom
                ? 'bg-slate-200 text-slate-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Riga custom — visibile solo quando showCustom è attivo */}
      {showCustom && (
        <div className="flex items-center gap-1.5 flex-wrap pb-2">
          <label htmlFor="th-from" className="text-xs text-slate-500 font-medium">Da</label>
          <input
            id="th-from"
            type="datetime-local"
            value={draftFrom}
            onChange={e => { setDraftFrom(e.target.value); setRangeError(''); }}
            className="text-xs text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="th-to" className="text-xs text-slate-500 font-medium">A</label>
          <input
            id="th-to"
            type="datetime-local"
            value={draftTo}
            onChange={e => { setDraftTo(e.target.value); setRangeError(''); }}
            className="text-xs text-slate-700 border border-slate-200 rounded-md px-2 py-1 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Applica
          </button>
          {rangeError && <span className="text-[11px] text-red-500">{rangeError}</span>}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori su `TelemetryHeader.tsx`. Eventuali errori residui su altri file verranno risolti nel task successivo.

---

### Task 2: Aggiornare `Dashboard.tsx`

**Files:**
- Modify: `dm-front/src/pages/Dashboard.tsx`

- [ ] **Step 1: Sostituire gli import obsoleti**

Sostituire l'intero blocco di import in cima al file:

```tsx
// Prima
import Sidebar                  from '../components/layout/Sidebar';
import MachineBar               from '../components/layout/MachineBar';
import TimeRangeBar             from '../components/layout/TimeRangeBar';
import KpiBar                   from '../components/panels/KpiBar';
import PcStatsPanel             from '../components/panels/PcStatsPanel';
import IgnitionPanel            from '../components/panels/IgnitionPanel';
import ParquetHeatmapPanel      from '../components/panels/ParquetHeatmapPanel';
import EdgeStatusPanel          from '../components/panels/EdgeStatusPanel';
import { TelemetryProvider }    from '../providers/telemetry-provider';
import { useMachine }           from '../hooks/useMachine';
import { MachineProvider }      from '../providers/machine-provider';
import { TimeRangeProvider }    from '../providers/time-range-provider';

// Dopo
import Sidebar               from '../components/layout/Sidebar';
import TelemetryHeader       from '../components/layout/TelemetryHeader';
import PcStatsPanel          from '../components/panels/PcStatsPanel';
import IgnitionPanel         from '../components/panels/IgnitionPanel';
import ParquetHeatmapPanel   from '../components/panels/ParquetHeatmapPanel';
import EdgeStatusPanel       from '../components/panels/EdgeStatusPanel';
import { TelemetryProvider } from '../providers/telemetry-provider';
import { useMachine }        from '../hooks/useMachine';
import { MachineProvider }   from '../providers/machine-provider';
import { TimeRangeProvider } from '../providers/time-range-provider';
```

- [ ] **Step 2: Aggiornare `PanelArea`**

Sostituire la funzione `PanelArea` con:

```tsx
function PanelArea() {
  const { selectedMachine } = useMachine();

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden relative">
      <TelemetryHeader />

      <div className="grid grid-cols-[55fr_45fr] gap-3 flex-1 min-h-0 p-2 overflow-hidden">
        <ParquetHeatmapPanel />
        <div className="grid grid-rows-[1fr_1fr_9rem] gap-3 min-h-0">
          <PcStatsPanel />
          <IgnitionPanel />
          <EdgeStatusPanel />
        </div>
      </div>

      {!selectedMachine && (
        <div className="absolute inset-0 top-14 flex flex-col items-center justify-center gap-3 bg-slate-100/90 backdrop-blur-[2px] z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="w-14 h-14">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">Nessuna macchina selezionata</p>
            <p className="text-xs text-slate-400 mt-0.5">Seleziona una macchina dal menu in alto per visualizzare i dati</p>
          </div>
        </div>
      )}
    </div>
  );
}
```

> **Nota:** `KpiBar`, `MachineBar`, `TimeRangeBar` sono rimossi dall'area. `EdgeStatusPanel` rimane temporaneamente nel grid (verrà eliminato nel piano 05).

- [ ] **Step 3: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

- [ ] **Step 4: Avviare il dev server e verificare manualmente**

```bash
cd dm-front && npm run dev
```

Aprire `http://localhost:5173`. Verificare:
1. L'header mostra: selettore macchina · ‹ data › · refresh · LIVE · preset pills
2. La freccetta `›` è disabilitata se la data è oggi
3. Cliccando `‹` la data nel badge retrocede di un giorno
4. Selezionando una macchina si popola il breadcrumb
5. I preset (10 min, 1 h, …) funzionano — pill attiva evidenziata in blu
6. Il toggle Custom mostra/nasconde i campi datetime
7. Nessun errore in console

- [ ] **Step 5: Commit**

```bash
git add dm-front/src/components/layout/TelemetryHeader.tsx \
        dm-front/src/pages/Dashboard.tsx
git commit -m "feat: add TelemetryHeader — unified header with machine select, date nav, time range"
```
