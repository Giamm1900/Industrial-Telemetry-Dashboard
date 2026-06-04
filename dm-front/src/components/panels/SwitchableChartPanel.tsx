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
