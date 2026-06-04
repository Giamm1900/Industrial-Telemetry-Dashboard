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
