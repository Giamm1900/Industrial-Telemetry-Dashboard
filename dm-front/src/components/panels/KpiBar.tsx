import { useMemo } from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import type { Preset } from '../../context/TimeRangeContext';
import { useTimeRange } from '../../hooks/useTimeRange';
import PanelWrapper from './PanelWrapper';
import type { ChartTab } from './SwitchableChartPanel';

type TrendStatus = 'ok' | 'warn' | 'err';

interface KpiItemProps {
  label: string;
  value?: string;
  sub?: string;
  valueStatus?: TrendStatus;
}

const valueColors: Record<TrendStatus, string> = {
  ok:   'text-green-600',
  warn: 'text-amber-600',
  err:  'text-red-600',
};

function KpiItem({ label, value, sub, valueStatus }: KpiItemProps) {
  const valColor = valueStatus ? valueColors[valueStatus] : 'text-slate-900';
  return (
    <div className="flex flex-col items-center justify-center gap-1 h-full px-2 border-r border-slate-100 last:border-r-0">
      <span
        className="font-bold uppercase tracking-widest text-slate-400 text-center"
        style={{ fontSize: 'clamp(7px, 0.6vw, 9px)' }}
      >
        {label}
      </span>
      <span
        className={`font-black leading-none ${valColor}`}
        style={{ fontSize: 'clamp(15px, 1.9vw, 24px)' }}
      >
        {value ?? '—'}
      </span>
      {sub && (
        <span
          className="text-slate-400 text-center leading-tight"
          style={{ fontSize: 'clamp(6px, 0.5vw, 8px)' }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function avg(arr: (number | null)[]): number | null {
  const vals = arr.filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function statusOf(val: number | null, warnAt: number, errAt: number): TrendStatus {
  if (val === null) return 'ok';
  return val >= errAt ? 'err' : val >= warnAt ? 'warn' : 'ok';
}

const RANGE_SUB: Record<Preset, string> = {
  '10m': 'ultimi 10 min',
  '1h':  'ultima ora',
  '6h':  'ultime 6 ore',
  '24h': 'ultime 24 ore',
  '7d':  'ultimi 7 giorni',
  '14d': 'ultimi 14 giorni',
};

interface Props {
  activeTab: ChartTab;
}

export default function KpiGrid({ activeTab }: Props) {
  const { mode, preset } = useTimeRange();
  const { pcSeries, ignSeries, ignLatestDbStatus, loading, error } = useTelemetry();

  const rangeSub = mode === 'preset' ? RANGE_SUB[preset] : 'range personalizzato';
  const fmt = (v: number | null) => v !== null ? `${v.toFixed(1)}%` : '—';

  const cpu  = useMemo(() => avg(pcSeries.map(p => p.cpu)),    [pcSeries]);
  const ram  = useMemo(() => avg(pcSeries.map(p => p.memory)), [pcSeries]);
  const disk = useMemo(() => avg(pcSeries.map(p => p.disk)),   [pcSeries]);

  const jvmHeap = useMemo(() => avg(ignSeries.map(p => p.jvm_memory)), [ignSeries]);
  const jvmCpu  = useMemo(() => avg(ignSeries.map(p => p.cpu)),        [ignSeries]);
  const dbOk    = !ignLatestDbStatus ||
    ignLatestDbStatus.toUpperCase() === 'OK' ||
    ignLatestDbStatus.toUpperCase() === 'CONNECTED';

  if (activeTab === 'ignition') {
    const dbStatus: TrendStatus = error ? 'err' : !ignLatestDbStatus ? 'ok' : dbOk ? 'ok' : 'err';
    const overallStatus =
      error   ? 'err'  :
      loading ? 'idle' :
      [statusOf(jvmHeap, 60, 80), statusOf(jvmCpu, 50, 80), dbStatus].includes('err')  ? 'err'  :
      [statusOf(jvmHeap, 60, 80), statusOf(jvmCpu, 50, 80), dbStatus].includes('warn') ? 'warn' :
      'ok';

    return (
      <PanelWrapper
        title="Medie JVM"
        description="Valori medi del processo Ignition nel periodo selezionato. Heap > 80% indica memory pressure; CPU proc > 80% indica carico elevato."
        status={overallStatus}
      >
        <div className="grid grid-cols-3 h-full">
          <KpiItem
            label="Heap JVM medio"
            value={fmt(jvmHeap)}
            sub={rangeSub}
            valueStatus={statusOf(jvmHeap, 60, 80)}
          />
          <KpiItem
            label="CPU Proc. media"
            value={fmt(jvmCpu)}
            sub={rangeSub}
            valueStatus={statusOf(jvmCpu, 50, 80)}
          />
          <KpiItem
            label="DB Status"
            value={ignLatestDbStatus ?? '—'}
            sub="ultimo rilevato"
            valueStatus={dbStatus}
          />
        </div>
      </PanelWrapper>
    );
  }

  const overallStatus =
    error   ? 'err'  :
    loading ? 'idle' :
    [statusOf(cpu, 50, 75), statusOf(ram, 70, 85), statusOf(disk, 70, 85)].includes('err')  ? 'err'  :
    [statusOf(cpu, 50, 75), statusOf(ram, 70, 85), statusOf(disk, 70, 85)].includes('warn') ? 'warn' :
    'ok';

  return (
    <PanelWrapper
      title="Medie Hardware"
      description="Valori medi di CPU, RAM e disco nel periodo selezionato. Amber = soglia di attenzione, rosso = soglia critica."
      status={overallStatus}
    >
      <div className="grid grid-cols-3 h-full">
        <KpiItem
          label="CPU medio"
          value={fmt(cpu)}
          sub={rangeSub}
          valueStatus={statusOf(cpu, 50, 75)}
        />
        <KpiItem
          label="RAM medio"
          value={fmt(ram)}
          sub={rangeSub}
          valueStatus={statusOf(ram, 70, 85)}
        />
        <KpiItem
          label="Disco medio"
          value={fmt(disk)}
          sub="media nel range"
          valueStatus={statusOf(disk, 70, 85)}
        />
      </div>
    </PanelWrapper>
  );
}
