# [06] Chart Axis Readability — ECharts label improvements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migliorare la leggibilità degli assi X e Y in tutti e tre i grafici ECharts: font più grande, colore più scuro, margini grid più generosi, Y-axis heatmap con più tick.

**Architecture:** Modifiche esclusivamente agli oggetti `option` di ECharts in `PcStatsPanel.tsx`, `IgnitionPanel.tsx`, `ParquetHeatmapPanel.tsx`. Nessuna modifica alla logica di fetch, ai context o al layout.

**Prerequisito:** Piani 01–05 completati.

**Tech Stack:** ECharts 6, echarts-for-react 3, TypeScript

---

### Task 1: `PcStatsPanel` — assi e grid

**Files:**
- Modify: `dm-front/src/components/panels/PcStatsPanel.tsx`

Le uniche righe da cambiare sono nel blocco `option` restituito da `useMemo`. Ogni step mostra la riga esatta da trovare e quella con cui sostituirla.

- [ ] **Step 1: Aggiornare `grid`**

Trovare:
```ts
      grid: { top: 28, right: 12, bottom: 28, left: 38 },
```
Sostituire con:
```ts
      grid: { top: 32, right: 12, bottom: 36, left: 52 },
```

- [ ] **Step 2: Aggiornare `xAxis.axisLabel`**

Trovare:
```ts
        axisLabel: { fontSize: 10, color: '#94a3b8', formatter: (v: number) => fmtTs(v, rangeMs) },
```
Sostituire con:
```ts
        axisLabel: { fontSize: 12, color: '#64748b', formatter: (v: number) => fmtTs(v, rangeMs) },
```

- [ ] **Step 3: Aggiornare `yAxis.axisLabel`**

Trovare:
```ts
        axisLabel: { fontSize: 10, color: '#94a3b8', formatter: '{value}%' },
```
Sostituire con:
```ts
        axisLabel: { fontSize: 12, color: '#64748b', formatter: '{value}%' },
```

- [ ] **Step 4: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 2: `IgnitionPanel` — assi e grid

**Files:**
- Modify: `dm-front/src/components/panels/IgnitionPanel.tsx`

Stesse modifiche di `PcStatsPanel` — il blocco `option` ha struttura identica.

- [ ] **Step 1: Aggiornare `grid`**

Trovare:
```ts
    grid: { top: 28, right: 12, bottom: 28, left: 38 },
```
Sostituire con:
```ts
    grid: { top: 32, right: 12, bottom: 36, left: 52 },
```

- [ ] **Step 2: Aggiornare `xAxis.axisLabel`**

Trovare:
```ts
      axisLabel: { fontSize: 10, color: '#94a3b8', formatter: (v: number) => fmtTs(v, rangeMs) },
```
Sostituire con:
```ts
      axisLabel: { fontSize: 12, color: '#64748b', formatter: (v: number) => fmtTs(v, rangeMs) },
```

- [ ] **Step 3: Aggiornare `yAxis.axisLabel`**

Trovare:
```ts
      axisLabel: { fontSize: 10, color: '#94a3b8', formatter: '{value}%' },
```
Sostituire con:
```ts
      axisLabel: { fontSize: 12, color: '#64748b', formatter: '{value}%' },
```

- [ ] **Step 4: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 3: `ParquetHeatmapPanel` — assi e grid

**Files:**
- Modify: `dm-front/src/components/panels/ParquetHeatmapPanel.tsx`

La heatmap ha struttura diversa: asse X = ore (0–23), asse Y = slot da 2 minuti (30 valori: "00","02",…,"58"). Il miglioramento principale sull'asse Y è portare i tick da 3 (`%20`: `:00 :20 :40`) a 6 (`%10`: `:00 :10 :20 :30 :40 :50`).

- [ ] **Step 1: Aggiornare `grid`**

Trovare:
```ts
    grid: { top: 16, right: 12, bottom: 8, left: 44 },
```
Sostituire con:
```ts
    grid: { top: 16, right: 12, bottom: 36, left: 52 },
```

- [ ] **Step 2: Aggiornare `xAxis.axisLabel`**

Trovare:
```ts
      axisLabel: { fontSize: 10, color: '#64748b' },
```
Sostituire con:
```ts
      axisLabel: { fontSize: 12, color: '#475569' },
```

- [ ] **Step 3: Aggiornare `yAxis.axisLabel` — font e intervallo tick**

Trovare:
```ts
      axisLabel: {
        fontSize: 9,
        color: '#64748b',
        interval: (_index: number, val: string) => parseInt(val, 10) % 20 === 0,
        formatter: (val: string) => `:${val}`,
      },
```
Sostituire con:
```ts
      axisLabel: {
        fontSize: 11,
        color: '#475569',
        interval: (_index: number, val: string) => parseInt(val, 10) % 10 === 0,
        formatter: (val: string) => `:${val}`,
      },
```

> **Perché `% 10`:** I valori nell'asse Y sono multipli di 2 (`"00","02","04"…`). `% 10 === 0` mostra i valori `"00","10","20","30","40","50"` → 6 tick `:00 :10 :20 :30 :40 :50`, uno ogni 10 minuti. Leggibile e non affollato.

- [ ] **Step 4: Verificare TypeScript**

```bash
cd dm-front && npx tsc --noEmit
```

Atteso: zero errori.

---

### Task 4: Verifica visiva e commit

- [ ] **Step 1: Avviare il dev server**

```bash
cd dm-front && npm run dev
```

Aprire `http://localhost:5173`, selezionare una macchina. Verificare:

1. **PcStatsPanel** (toggle "PC Stats"): le label su asse X (ore/date) e asse Y (0%–100%) sono più grandi e scure, la griglia ha più respiro sui lati
2. **IgnitionPanel** (toggle "Ignition JVM"): stesso miglioramento
3. **ParquetHeatmapPanel** (colonna sinistra): l'asse Y mostra `:00 :10 :20 :30 :40 :50` (6 tick invece di 3), l'asse X ha le ore più leggibili
4. Nessuna label sovrapposta o troncata
5. Nessun errore in console

- [ ] **Step 2: Commit**

```bash
git add dm-front/src/components/panels/PcStatsPanel.tsx \
        dm-front/src/components/panels/IgnitionPanel.tsx \
        dm-front/src/components/panels/ParquetHeatmapPanel.tsx
git commit -m "style: improve ECharts axis readability — larger font, darker labels, wider grid margins"
```

---

## Riepilogo piani completati

| Piano | File principali | Stato |
|---|---|---|
| 01 | `TimeRangeContext`, `time-range-provider`, `ParquetHeatmapPanel` | [ ] |
| 02 | `TelemetryHeader` (nuovo), `Dashboard` | [ ] |
| 03 | `SwitchableChartPanel` (nuovo), `PcStatsPanel`, `IgnitionPanel` | [ ] |
| 04 | `KpiBar` → `KpiGrid` | [ ] |
| 05 | `Dashboard` (layout finale), elimina 3 file | [ ] |
| 06 | `PcStatsPanel`, `IgnitionPanel`, `ParquetHeatmapPanel` (assi) | [ ] |
