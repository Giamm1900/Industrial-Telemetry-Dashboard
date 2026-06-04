import { useMachine } from '../../hooks/useMachine';

export default function AppHeader() {
  const { selectedMachine } = useMachine();

  return (
    <div className="h-12 shrink-0 bg-white border-b border-slate-100 flex items-center px-4">
      <nav className="flex items-center gap-1.5 text-[12px]">
        <span className="text-slate-400">Home</span>
        <span className="text-slate-300 select-none">›</span>
        <span className="text-slate-400">Telemetrie</span>
        <span className="text-slate-300 select-none">›</span>
        <span className={selectedMachine ? 'text-slate-700 font-semibold' : 'text-slate-400'}>
          {selectedMachine?.name ?? 'Dettaglio Macchina'}
        </span>
      </nav>
    </div>
  );
}
