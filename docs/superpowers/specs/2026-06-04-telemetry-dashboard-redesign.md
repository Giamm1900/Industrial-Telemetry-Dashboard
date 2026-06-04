# Telemetry Dashboard Redesign — Spec

**Data:** 2026-06-04  
**Stack:** React 19, Tailwind CSS v4, ECharts (echarts-for-react), TypeScript, Vite

---

## Obiettivo

Riorganizzare il layout della dashboard di telemetria seguendo un contratto preciso:
- Pagina a 100vh, zero scroll
- Header fisso in alto con filtri globali (macchina + data + time range)
- Area contenuti a due colonne sotto l'header (66% heatmap | 34% grafico switchabile + KPI)
- Assi dei grafici ECharts più leggibili

---

## Contratto di Layout

```
[Sidebar collassabile]  |  [TelemetryHeader — altezza fissa ~56px]
                        |  [Content Area — flex-1, min-h-0]
                        |    [ParquetHeatmapPanel — 66%, h-full]
                        |    [ColonnaDestra — 34%, flex col, gap-2]
                        |      [SwitchableChartPanel — flex-1]
                        |      [KpiGrid — altezza fissa ~5.5rem]
```

La pagina usa `h-screen overflow-hidden` sul root; ogni livello usa `flex-1 min-h-0` per non sbordare. Nessuna scrollbar deve apparire.

---

## Stato Globale — TimeRangeContext

Aggiungere a `TimeRangeContext` e al relativo provider:

```ts
viewDate: string          // formato "YYYY-MM-DD", default: oggi
setViewDate: (d: string) => void
prevDay: () => void       // decrementa viewDate di 1 giorno
nextDay: () => void       // incrementa viewDate di 1 giorno (disabilitato se viewDate === oggi)
```

Tutti i pannelli che consumano la data (attualmente solo `ParquetHeatmapPanel`) useranno `useTimeRange()` invece di stato locale.

---

## Componenti — Azioni

### NUOVO: `TelemetryHeader`
**Path:** `dm-front/src/components/layout/TelemetryHeader.tsx`

Sostituisce `MachineBar` (eliminato) e la vecchia riga `KpiBar + TimeRangeBar` sopra la griglia.

Layout interno (flex row, items-center, gap-4):
```
[● Macchina ▾]  [‹  04/06/2026  ›]  [🔄 Refresh]  [● LIVE]  |divider|  [10m][1h][6h][24h][7d][14d][Custom]
```

- Machine select: identico all'attuale `MachineBar`, con status dot e breadcrumb sotto
- Date nav: `‹` `DD/MM/YYYY` `›` — chiama `prevDay`/`nextDay` da context; `›` disabilitato se oggi
- Refresh e LIVE toggle: identici all'attuale `MachineBar`
- Separatore verticale (`w-px h-5 bg-slate-200`)
- TimeRangeBar inline: preset pills + custom (logica invariata, solo senza il wrapper card attuale)

### NUOVO: `SwitchableChartPanel`
**Path:** `dm-front/src/components/panels/SwitchableChartPanel.tsx`

Wrapper con toggle visibile per switchare tra due viste:
- **"Statistiche PC"** → renderizza `<PcStatsPanel />`
- **"Ignition JVM"** → renderizza `<IgnitionPanel />`

Toggle: due pulsanti affiancati stile pill/tab, ben visibili nell'header del pannello. Default: "Statistiche PC".

`PcStatsPanel` e `IgnitionPanel` rimangono invariati internamente; ricevono semplicemente `style={{ height: '100%' }}` dal wrapper.

### MODIFICATO: `KpiBar` → `KpiGrid`
**Path:** `dm-front/src/components/panels/KpiBar.tsx` — il file mantiene il nome attuale, ma il componente esportato di default viene rinominato da `KpiBar` a `KpiGrid`. L'import in `Dashboard.tsx` usa `import KpiGrid from '../components/panels/KpiBar'`.

Cambiamenti:
- Rimuovere la card "Edge uptime" (usava `edgeData`)
- Aggiungere la card "RAM medio" (usa `pcSeries.map(p => p.memory)`)
- Layout: `grid grid-cols-3 gap-2` con card di altezza fissa (~5.5rem) — card quadrate/compatte
- Le card stesse rimangono identiche (stessa struttura `KpiCard`)

Ordine card: **CPU medio** | **RAM medio** | **Disco medio**

### MODIFICATO: `TimeRangeContext` + `TimeRangeProvider`
**Path:** `dm-front/src/context/TimeRangeContext.tsx` e `dm-front/src/providers/time-range-provider.tsx`

Aggiungere `viewDate`, `setViewDate`, `prevDay`, `nextDay` come descritto sopra.

### MODIFICATO: `ParquetHeatmapPanel`
- Rimuovere `useState(viewDate)` locale, `prevDay`, `nextDay`, `isToday`
- Consumare da `useTimeRange()`: `{ viewDate, prevDay, nextDay }`
- Rimuovere il date nav dall'`headerExtra` (ora è nell'header globale)
- Rimuovere l'import `useCallback` se non più usato

### MODIFICATO: `Dashboard.tsx`
Nuovo layout:
```tsx
<div className="h-screen overflow-hidden flex bg-slate-100">
  <Sidebar />
  <div className="flex flex-col flex-1 min-h-0 min-w-0">
    <TelemetryHeader />
    <div className="flex flex-1 min-h-0 gap-2 p-2">
      <div className="flex-[66] min-w-0 min-h-0">
        <ParquetHeatmapPanel />
      </div>
      <div className="flex-[34] flex flex-col gap-2 min-h-0">
        <SwitchableChartPanel />
        <KpiGrid />
      </div>
    </div>
    {/* empty state overlay invariato */}
  </div>
</div>
```

### ELIMINATI
- `dm-front/src/components/panels/EdgeStatusPanel.tsx`
- `dm-front/src/components/layout/MachineBar.tsx`

---

## Miglioramenti Assi ECharts

Applicare a `PcStatsPanel`, `IgnitionPanel`, `ParquetHeatmapPanel`:

| Parametro | Prima | Dopo |
|---|---|---|
| `axisLabel.fontSize` (x, y) | 10 | 12 |
| `axisLabel.color` | `#94a3b8` | `#64748b` |
| `grid.left` | 38–44 | 52 |
| `grid.bottom` | 8–28 | 36 |
| `grid.top` (line charts) | 28 | 32 |

**Heatmap asse Y** — cambiare l'intervallo:
```ts
// Prima: mostra solo :00 e :40
interval: (_i, val) => parseInt(val, 10) % 20 === 0

// Dopo: mostra :00 :10 :20 :30 :40 :50
interval: (_i, val) => parseInt(val, 10) % 5 === 0
```

**Heatmap asse X** — font 10→12px, già mostra tutte le 24 ore.

---

## Invarianti

- Tutti i context provider (`TimeRangeProvider`, `MachineProvider`, `TelemetryProvider`) rimangono nel loro ordine attuale in `Dashboard.tsx`
- La logica di fetch, i hook (`useTelemetry`, `useMachine`, `useTimeRange`, `useApiTree`) non vengono toccati
- `PcStatsPanel` e `IgnitionPanel` non vengono modificati tranne per i margini/font degli assi
- Il drawer di dettaglio della heatmap rimane invariato
- L'empty state overlay in `Dashboard.tsx` rimane invariato
