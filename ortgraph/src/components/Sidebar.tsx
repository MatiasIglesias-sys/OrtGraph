/**
 * Left sidebar with stats, legend, and filters.
 */

import { useMemo } from 'react';
import { GraduationCap, Zap, CheckCircle2, RotateCcw, Filter } from 'lucide-react';
import { useProgressStore } from '../store/useProgressStore';

export function Sidebar() {
  const {
    approved,
    filterYear,
    showOnlyAvailable,
    showElectives,
    setFilterYear,
    setShowOnlyAvailable,
    setShowElectives,
    resetProgress,
    getCompletedCount,
    getCoreCount,
    getAvailableCount,
  } = useProgressStore();

  const completedCount = useMemo(() => getCompletedCount(), [approved]);
  const coreCount = useMemo(() => getCoreCount(), []);
  const availableCount = useMemo(() => getAvailableCount(), [approved]);

  const progress = coreCount > 0 ? (completedCount / coreCount) * 100 : 0;

  return (
    <aside
      className="flex flex-col gap-0 border-r border-slate-800 bg-[#0d1017] overflow-y-auto"
      style={{ width: 240, minWidth: 240 }}
    >
      {/* Stats */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-blue-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Progreso</span>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
            <span>{completedCount} de {coreCount} materias núcleo</span>
            <span className="text-slate-400 font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={<CheckCircle2 size={14} className="text-emerald-400" />}
            label="Completadas"
            value={completedCount}
            color="text-emerald-400"
          />
          <StatCard
            icon={<Zap size={14} className="text-blue-400" />}
            label="Disponibles"
            value={availableCount}
            color="text-blue-400"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Filtros</span>
        </div>

        {/* Year filter */}
        <div className="mb-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1.5">Año</p>
          <div className="flex flex-wrap gap-1">
            {[null, 1, 2, 3, 4, 5].map(year => (
              <button
                key={year ?? 'all'}
                onClick={() => setFilterYear(year)}
                className={[
                  'px-2 py-1 rounded text-[10px] font-medium transition-all',
                  filterYear === year
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
                ].join(' ')}
              >
                {year === null ? 'Todos' : `${year}°`}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle filters */}
        <div className="space-y-2">
          <ToggleFilter
            label="Solo disponibles"
            checked={showOnlyAvailable}
            onChange={setShowOnlyAvailable}
          />
          <ToggleFilter
            label="Mostrar electivas"
            checked={showElectives}
            onChange={setShowElectives}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Leyenda</p>
        <div className="space-y-2">
          <LegendItem color="border-emerald-500" bg="bg-emerald-950/60" label="Crédito total" />
          <LegendItem color="border-amber-500" bg="bg-amber-950/50" label="Crédito parcial" />
          <LegendItem color="border-blue-500" bg="bg-blue-950/60" label="Disponible (glow azul)" glow />
          <LegendItem color="border-slate-700" bg="bg-slate-900/70" label="Bloqueada" dim />
        </div>

        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-1">Aristas</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px bg-slate-500" />
            <span className="text-[11px] text-slate-500">Requiere crédito total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-px border-t-2 border-dashed border-slate-600" />
            <span className="text-[11px] text-slate-500">Requiere crédito parcial</span>
          </div>
        </div>
      </div>

      {/* Semester palette */}
      <div className="p-4 border-b border-slate-800">
        <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-2">Semestres (franja derecha)</p>
        <div className="grid grid-cols-5 gap-1">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="w-5 h-2 rounded-sm"
                style={{ background: getSemesterColor(i + 1) }}
              />
              <span className="text-[8px] text-slate-600">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="p-4 mt-auto">
        <button
          onClick={() => {
            if (confirm('¿Resetear todo el progreso?')) resetProgress();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-500 hover:text-red-400 border border-slate-700 hover:border-red-800/50 text-xs font-medium transition-all"
        >
          <RotateCcw size={13} />
          Resetear progreso
        </button>
      </div>
    </aside>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[10px] text-slate-500">{label}</span>
      </div>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ToggleFilter({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={[
          'relative w-8 h-4 rounded-full transition-all cursor-pointer',
          checked ? 'bg-blue-600' : 'bg-slate-700',
        ].join(' ')}
      >
        <div
          className={[
            'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all',
            checked ? 'left-4' : 'left-0.5',
          ].join(' ')}
        />
      </div>
    </label>
  );
}

function LegendItem({
  color,
  bg,
  label,
  glow,
  dim,
}: {
  color: string;
  bg: string;
  label: string;
  glow?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-4 rounded border-2 ${color} ${bg} ${dim ? 'opacity-40' : ''}`}
        style={glow ? { boxShadow: '0 0 6px 2px rgba(59,130,246,0.5)' } : undefined}
      />
      <span className="text-[11px] text-slate-500">{label}</span>
    </div>
  );
}

function getSemesterColor(semester: number): string {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#0ea5e9', '#3b82f6',
  ];
  return colors[(semester - 1) % colors.length];
}
