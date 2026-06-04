import PcStatsPanel  from './PcStatsPanel';
import IgnitionPanel from './IgnitionPanel';

export type ChartTab = 'pc' | 'ignition';

interface Props {
  activeTab: ChartTab;
  onSwitch: (tab: ChartTab) => void;
}

export default function SwitchableChartPanel({ activeTab, onSwitch }: Props) {
  const toggle = (
    <div className="flex items-center gap-1 mr-1">
      <button
        type="button"
        onClick={() => onSwitch('pc')}
        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
          activeTab === 'pc'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        PC Stats
      </button>
      <button
        type="button"
        onClick={() => onSwitch('ignition')}
        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
          activeTab === 'ignition'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
        }`}
      >
        Ignition JVM
      </button>
    </div>
  );

  if (activeTab === 'pc') return <PcStatsPanel headerExtra={toggle} />;
  return <IgnitionPanel extraHeader={toggle} />;
}
