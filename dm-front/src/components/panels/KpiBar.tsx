import { useMemo } from 'react';
import { useTelemetry } from '../../hooks/useTelemetry';
import type { Preset } from '../../context/TimeRangeContext';
import { useTimeRange } from '../../hooks/useTimeRange';

type TrendStatus = 'ok' | 'warn' | 'err';

interface KpiCardProps {
  label: string;
  value?: string;
  sub?: string;
  accentClass: string;
  valueStatus?: TrendStatus;
}

const valueColors: Record<TrendStatus, string> = {
  ok:   'text-green-600',
  warn: 'text-amber-600',
  err:  'text-red-600',
};

function KpiCard({ label, value, sub, accentClass, valueStatus }: KpiCardProps) {
  const valColor = valueStatus ? valueColors[valueStatus] : 'text-slate-900';
  return (
    <div className={`bg-white border border-slate-200 border-t-2 ${accentClass} rounded-md px-3 py-2 flex flex-col gap-0.5`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-[22px] font-bold leading-none ${valColor}`}>{value ?? '—'}</span>
      {sub && <span className="text-[10px] text-slate-400 leading-tight">{sub}</span>}
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

export default function KpiGrid() {
  const { mode, preset } = useTimeRange();
  const { pcSeries } = useTelemetry();

  const cpu  = useMemo(() => avg(pcSeries.map(p => p.cpu)),    [pcSeries]);
  const ram  = useMemo(() => avg(pcSeries.map(p => p.memory)), [pcSeries]);
  const disk = useMemo(() => avg(pcSeries.map(p => p.disk)),   [pcSeries]);

  const rangeSub = mode === 'preset' ? RANGE_SUB[preset] : 'range personalizzato';
  const fmt      = (v: number | null) => v !== null ? `${v.toFixed(1)}%` : '—';

  return (
    <div className="grid grid-cols-3 gap-2 shrink-0">
      <KpiCard
        label="CPU medio"
        value={fmt(cpu)}
        sub={rangeSub}
        accentClass="border-t-blue-600"
        valueStatus={statusOf(cpu, 50, 75)}
      />
      <KpiCard
        label="RAM medio"
        value={fmt(ram)}
        sub={rangeSub}
        accentClass="border-t-violet-500"
        valueStatus={statusOf(ram, 70, 85)}
      />
      <KpiCard
        label="Disco medio"
        value={fmt(disk)}
        sub="media nel range"
        accentClass="border-t-amber-500"
        valueStatus={statusOf(disk, 70, 85)}
      />
    </div>
  );
}
