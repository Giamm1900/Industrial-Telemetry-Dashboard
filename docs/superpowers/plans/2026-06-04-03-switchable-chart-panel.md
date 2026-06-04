# [03] SwitchableChartPanel — Grafico switchabile PC Stats / Ignition

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Creare `SwitchableChartPanel` — un wrapper che mostra `PcStatsPanel` o `IgnitionPanel` con un toggle visibile nell'header del pannello stesso.

**Architecture:** Il toggle viene iniettato nell'header del pannello attivo tramite la prop `headerExtra` già supportata da `PanelWrapper`. Modifiche minime a `PcStatsPanel` (aggiungere `headerExtra` forwarding) e `IgnitionPanel` (prepend del toggle al DbStatusBadge esistente). Nessuna modifica alla logica ECharts.

**Prerequisito:** Piani 01 e 02 completati.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4

---

### Task 1: Aggiungere `headerExtra` a `PcStatsPanel`

**Files:**
- Modify: `dm-front/src/components/panels/PcStatsPanel.tsx`

`PcStatsPanel` attualmente non accetta `headerExtra`. Aggiungere il forwarding in 3 passi.

- [ ] **Step 1: Aggiungere la prop all'interfaccia e al componente**

In `PcStatsPanel.tsx`, la funzione inizia così:
```tsx
export default function PcStatsPanel() {
```

Sostituirla con:
```tsx
export default function PcStatsPanel({ headerExtra }: { headerExtra?: React.ReactNode }) {
```

Aggiungere `import React from 'react'` oppure aggiungere `type ReactNode` agli import esistenti. Il file importa già da `'react'`:
```ts
import { useMemo } from 'react';
```
Aggiornare a:
```ts
import { useMemo, type ReactNode } from 'react';
```

- [ ] **Step 2: Passare `headerExtra` a `PanelWrapper`**

Trovare la riga:
```tsx
    <PanelWrapper
      title="PC Stats — Hardware"
      description="Utilizzo hardware del PC industriale (CPU, RAM, Disco) nel periodo selezionato. Valori sostenuti > 80% indicano rischio di saturazione o rallentamenti operativi."
      status={error ? 'err' : loading ? 'idle' : 'ok'}
    >
```

Sostituirla con:
```tsx
    <PanelWrapper
      title="PC Stats — Hardware"
      description="Utilizzo hardware del PC industriale (CPU, RAM, Disco) nel periodo selezionato. Valori sostenuti > 80% indicano rischio di saturazione o rallentamenti operativi."
      status={error ? 'err' : loading ? 'idle' : 'ok'}
      headerExtra={headerExtra}
    >
```

- [ ] **Step 3: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 2: Aggiungere `extraHeader` a `IgnitionPanel`

**Files:**
- Modify: `dm-front/src/components/panels/IgnitionPanel.tsx`

`IgnitionPanel` già usa `headerExtra` per il `DbStatusBadge`. Aggiungere una prop `extraHeader` che viene preposta al badge.

- [ ] **Step 1: Aggiornare l'interfaccia della funzione**

Trovare:
```tsx
export default function IgnitionPanel() {
```

Sostituire con:
```tsx
export default function IgnitionPanel({ extraHeader }: { extraHeader?: React.ReactNode }) {
```

Aggiornare l'import React esistente (il file importa già `{ useMemo }` da `'react'`):
```ts
import { useMemo, type ReactNode } from 'react';
```

- [ ] **Step 2: Aggiornare `headerExtra` nel `PanelWrapper`**

Trovare la riga:
```tsx
      headerExtra={<DbStatusBadge status={ignLatestDbStatus} />}
```

Sostituirla con:
```tsx
      headerExtra={<>{extraHeader}<DbStatusBadge status={ignLatestDbStatus} /></>}
```

- [ ] **Step 3: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 3: Creare `SwitchableChartPanel`

**Files:**
- Create: `dm-front/src/components/panels/SwitchableChartPanel.tsx`

- [ ] **Step 1: Creare il file**

```tsx
import { useState } from 'react';
import PcStatsPanel  from './PcStatsPanel';
import IgnitionPanel from './IgnitionPanel';

type Tab = 'pc' | 'ignition';

export default function SwitchableChartPanel() {
  const [active, setActive] = useState<Tab>('pc');

  const toggle = (
    <div className="flex items-center gap-1 mr-1">
      <button
        type="button"
        onClick={() => setActive('pc')}
        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
          active === 'pc'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        PC Stats
      </button>
      <button
        type="button"
        onClick={() => setActive('ignition')}
        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
          active === 'ignition'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Ignition JVM
      </button>
    </div>
  );

  if (active === 'pc') {
    return <PcStatsPanel headerExtra={toggle} />;
  }
  return <IgnitionPanel extraHeader={toggle} />;
}
```

- [ ] **Step 2: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 4: Usare `SwitchableChartPanel` in `Dashboard.tsx`

**Files:**
- Modify: `dm-front/src/pages/Dashboard.tsx`

Il grafico switchabile verrà posizionato definitivamente nella colonna destra nel piano 05. Per ora, aggiungerlo temporaneamente al posto di `PcStatsPanel` nella griglia esistente, per poterlo testare visivamente senza toccare il layout complessivo.

- [ ] **Step 1: Aggiornare import**

Trovare in `Dashboard.tsx`:
```tsx
import PcStatsPanel          from '../components/panels/PcStatsPanel';
import IgnitionPanel         from '../components/panels/IgnitionPanel';
```

Sostituire con:
```tsx
import PcStatsPanel           from '../components/panels/PcStatsPanel';
import IgnitionPanel          from '../components/panels/IgnitionPanel';
import SwitchableChartPanel   from '../components/panels/SwitchableChartPanel';
```

- [ ] **Step 2: Inserire `SwitchableChartPanel` nel grid provvisorio**

Trovare in `PanelArea`:
```tsx
        <div className="grid grid-rows-[1fr_1fr_9rem] gap-3 min-h-0">
          <PcStatsPanel />
          <IgnitionPanel />
          <EdgeStatusPanel />
        </div>
```

Sostituire con:
```tsx
        <div className="grid grid-rows-[1fr_1fr_9rem] gap-3 min-h-0">
          <SwitchableChartPanel />
          <IgnitionPanel />
          <EdgeStatusPanel />
        </div>
```

> **Nota:** `IgnitionPanel` resta nella riga sotto come placeholder temporaneo; verrà rimosso nel piano 05 quando il layout finale sarà definito.

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
1. Nella riga superiore destra compare il pannello con i pulsanti `PC Stats` e `Ignition JVM` nel suo header
2. Cliccando `PC Stats` (default) si vede il grafico CPU/RAM/Disco
3. Cliccando `Ignition JVM` il pannello mostra Proc. CPU e JVM Heap, con il badge DB affiancato al toggle
4. Il toggle è visibile e ben leggibile nell'header del pannello
5. Nessun errore in console

- [ ] **Step 5: Commit**

```bash
git add dm-front/src/components/panels/PcStatsPanel.tsx \
        dm-front/src/components/panels/IgnitionPanel.tsx \
        dm-front/src/components/panels/SwitchableChartPanel.tsx \
        dm-front/src/pages/Dashboard.tsx
git commit -m "feat: add SwitchableChartPanel with PC Stats / Ignition JVM toggle"
```
