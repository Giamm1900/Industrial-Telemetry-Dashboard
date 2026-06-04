import { useState } from 'react';
import Sidebar               from '../components/layout/Sidebar';
import AppHeader             from '../components/layout/AppHeader';
import TelemetryHeader       from '../components/layout/TelemetryHeader';
import ParquetHeatmapPanel   from '../components/panels/ParquetHeatmapPanel';
import SwitchableChartPanel  from '../components/panels/SwitchableChartPanel';
import KpiGrid               from '../components/panels/KpiBar';
import { TelemetryProvider } from '../providers/telemetry-provider';
import { useMachine }        from '../hooks/useMachine';
import { MachineProvider }   from '../providers/machine-provider';
import { TimeRangeProvider } from '../providers/time-range-provider';
import type { ChartTab }     from '../components/panels/SwitchableChartPanel';

function PanelArea() {
  const { selectedMachine } = useMachine();
  const [activeTab, setActiveTab] = useState<ChartTab>('pc');

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <AppHeader />
      <TelemetryHeader />

      <div className="flex flex-1 min-h-0 gap-2 p-2 relative">
        {/* Colonna sinistra — 66% */}
        <div className="flex-[66] min-w-0 min-h-0 h-full">
          <ParquetHeatmapPanel />
        </div>

        {/* Colonna destra — 34% */}
        <div className="flex-34 flex flex-col gap-2 min-h-0 h-full">
          <div className="min-h-0" style={{ flex: '70 70 0' }}>
            <SwitchableChartPanel activeTab={activeTab} onSwitch={setActiveTab} />
          </div>
          <div className="min-h-0" style={{ flex: '30 30 0' }}>
            <KpiGrid activeTab={activeTab} />
          </div>
        </div>

        {!selectedMachine && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100/90 backdrop-blur-[2px] z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="w-14 h-14">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Nessuna macchina selezionata</p>
              <p className="text-xs text-slate-400 mt-0.5">Seleziona una macchina dal menu in alto per visualizzare i dati</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <TimeRangeProvider>
      <MachineProvider>
        <TelemetryProvider>
          <div className="h-screen overflow-hidden flex bg-slate-100">
            <Sidebar />
            <PanelArea />
          </div>
        </TelemetryProvider>
      </MachineProvider>
    </TimeRangeProvider>
  );
}
