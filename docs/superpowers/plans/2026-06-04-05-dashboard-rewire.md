# [05] Dashboard Rewire — Layout finale 66/34

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Assemblare il layout finale: colonna sinistra 66% (heatmap full-height) + colonna destra 34% (SwitchableChartPanel in alto, KpiGrid in basso). Eliminare `EdgeStatusPanel.tsx` e `MachineBar.tsx`.

**Architecture:** Riscrittura di `Dashboard.tsx` con `flex-[66]/flex-[34]`. I componenti dei piani 01–04 vengono cablati nella posizione definitiva. I file `EdgeStatusPanel.tsx` e `MachineBar.tsx` vengono eliminati.

**Prerequisito:** Piani 01–04 completati.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4

---

### Task 1: Riscrivere `Dashboard.tsx`

**Files:**
- Modify: `dm-front/src/pages/Dashboard.tsx`

- [ ] **Step 1: Sostituire l'intero file**

```tsx
import Sidebar               from '../components/layout/Sidebar';
import TelemetryHeader       from '../components/layout/TelemetryHeader';
import ParquetHeatmapPanel   from '../components/panels/ParquetHeatmapPanel';
import SwitchableChartPanel  from '../components/panels/SwitchableChartPanel';
import KpiGrid               from '../components/panels/KpiBar';
import { TelemetryProvider } from '../providers/telemetry-provider';
import { useMachine }        from '../hooks/useMachine';
import { MachineProvider }   from '../providers/machine-provider';
import { TimeRangeProvider } from '../providers/time-range-provider';

function PanelArea() {
  const { selectedMachine } = useMachine();

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 relative">
      <TelemetryHeader />

      <div className="flex flex-1 min-h-0 gap-2 p-2">
        {/* Colonna sinistra — 66% */}
        <div className="flex-[66] min-w-0 min-h-0">
          <ParquetHeatmapPanel />
        </div>

        {/* Colonna destra — 34% */}
        <div className="flex-[34] flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0">
            <SwitchableChartPanel />
          </div>
          <KpiGrid />
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

export default function Dashboard() {
  return (
    <TimeRangeProvider>
      <MachineProvider>
        <TelemetryProvider>
          <div className="h-screen overflow-hidden flex bg-slate-100">
            <Sidebar />
            <PanelArea />
          </div>
        </TelemetryProvider>
      </MachineProvider>
    </TimeRangeProvider>
  );
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 2: Eliminare i file obsoleti

**Files:**
- Delete: `dm-front/src/components/panels/EdgeStatusPanel.tsx`
- Delete: `dm-front/src/components/layout/MachineBar.tsx`
- Delete: `dm-front/src/components/layout/TimeRangeBar.tsx`

> `TimeRangeBar.tsx` è anch'esso obsoleto: la sua logica è stata assorbita integralmente da `TelemetryHeader.tsx`.

- [ ] **Step 1: Eliminare i tre file**

```bash
rm dm-front/src/components/panels/EdgeStatusPanel.tsx
rm dm-front/src/components/layout/MachineBar.tsx
rm dm-front/src/components/layout/TimeRangeBar.tsx
```

- [ ] **Step 2: Verificare che nessun altro file li importi**

```bash
cd dm-front && grep -r "EdgeStatusPanel\|MachineBar\|TimeRangeBar" src/
```

Atteso: nessun output (zero riferimenti residui).

- [ ] **Step 3: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 3: Verifica visiva e commit

- [ ] **Step 1: Avviare il dev server**

```bash
cd dm-front && npm run dev
```

Aprire `http://localhost:5173`. Verificare il contratto di layout:

1. **No scroll** — nessuna barra di scorrimento verticale né orizzontale visibile
2. **Header fisso** — `TelemetryHeader` in cima con machine select · ‹ data › · refresh · LIVE · preset pills
3. **Colonna sinistra (66%)** — la heatmap occupa tutta l'altezza disponibile sotto l'header
4. **Colonna destra (34%)** — in alto `SwitchableChartPanel` (toggle PC Stats / Ignition JVM), in basso `KpiGrid` con tre card (CPU medio · RAM medio · Disco medio)
5. **Empty state** — senza macchina selezionata appare l'overlay centrato
6. **Navigazione data** — le freccette ‹ › nell'header aggiornano la heatmap (il grafico ricarica i dati)
7. Nessun errore in console

- [ ] **Step 2: Commit**

```bash
git add dm-front/src/pages/Dashboard.tsx
git rm dm-front/src/components/panels/EdgeStatusPanel.tsx \
       dm-front/src/components/layout/MachineBar.tsx \
       dm-front/src/components/layout/TimeRangeBar.tsx
git commit -m "feat: final dashboard layout 66/34 — remove EdgeStatusPanel, MachineBar, TimeRangeBar"
```
