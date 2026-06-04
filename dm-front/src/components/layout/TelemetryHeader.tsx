import { useRef } from 'react';
import { useApiTree } from '../../hooks/useApiTree';
import type { MachineStatus, Machine } from '../../data/mockTree';
import { useTelemetry } from '../../hooks/useTelemetry';
import { useMachine } from '../../hooks/useMachine';
import { useTimeRange } from '../../hooks/useTimeRange';
import type { Preset } from '../../context/TimeRangeContext';

const PRESETS: { value: Preset; label: string }[] = [
  { value: '1h',  label: '1h' },
  { value: '6h',  label: '6h' },
  { value: '7d',  label: '7g' },
  { value: '14d', label: '14g' },
];

function dotClass(status: MachineStatus): string {
  if (status === 'online')  return 'bg-green-500';
  if (status === 'offline') return 'bg-red-500';
  return 'bg-slate-400';
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
    mode, preset,
    viewDate, prevDay, nextDay, setViewDate,
    setPreset,
  } = useTimeRange();

  function findById(id: string): Machine | null {
    for (const c of tree)
      for (const p of c.plants) {
        const m = p.machines.find(m => m.id === id);
        if (m) return m;
      }
    return null;
  }

  const dateInputRef = useRef<HTMLInputElement>(null);

  const liveDisabled = !selectedMachine;
  const displayDate  = viewDate.split('-').reverse().join('/');
  const isToday      = viewDate === todayStr();

  return (
    <div className="bg-white border-b border-slate-200 px-3 shrink-0">
      <div className="flex items-center gap-2 h-14">

        {/* Machine select */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">Macchina</span>
          {selectedMachine && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass(selectedMachine.status)}`} />
          )}
          <select
            value={selectedMachine?.id ?? ''}
            onChange={e => setSelectedMachine(findById(e.target.value))}
            disabled={loading}
            title="Seleziona macchina"
            className="border-2 border-slate-300 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-slate-800 bg-white appearance-none cursor-pointer outline-none focus:border-blue-500 max-w-48 disabled:text-slate-400 disabled:border-slate-200"
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
        </div>

        <div className="w-px h-4 bg-slate-200 shrink-0" />

        {/* Date nav — click sulla data apre il date picker nativo */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={prevDay}
            title="Giorno precedente"
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors text-base font-bold"
          >‹</button>

          <span
            onClick={() => dateInputRef.current?.showPicker()}
            className="text-[13px] text-slate-800 font-semibold font-mono bg-slate-100 hover:bg-slate-200 transition-colors rounded px-2 py-1.5 select-none cursor-pointer"
          >
            {displayDate}
          </span>
          <input
            ref={dateInputRef}
            type="date"
            value={viewDate}
            max={todayStr()}
            onChange={e => { if (e.target.value) setViewDate(e.target.value); }}
            className="sr-only"
          />

          <button
            type="button"
            onClick={nextDay}
            disabled={isToday}
            title={isToday ? 'Giorno corrente' : 'Giorno successivo'}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors text-base font-bold disabled:opacity-30 disabled:cursor-not-allowed"
          >›</button>
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={refresh}
          disabled={!selectedMachine}
          title="Aggiorna dati ora"
          className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
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
              ? 'Seleziona una macchina'
              : isLive ? 'Disattiva aggiornamento automatico' : 'Attiva aggiornamento ogni 30s'
          }
          className={`flex items-center gap-1.5 border rounded px-2.5 py-1.5 text-[12px] transition-colors shrink-0 ${
            isLive
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
          LIVE
        </button>

        <div className="w-px h-4 bg-slate-200 shrink-0" />

        {/* Preset pills */}
        <div className="flex items-center gap-1 shrink-0">
          {PRESETS.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPreset(p.value)}
              className={`px-2.5 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                mode === 'preset' && preset === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
