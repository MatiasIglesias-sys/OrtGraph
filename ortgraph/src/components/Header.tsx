import { Network, MousePointerClick } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0d1017] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-600/30">
          <Network size={16} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 leading-none">OrtGraph</h1>
          <p className="text-[11px] text-slate-600 mt-0.5">Ingeniería en Sistemas · Plan 2019 · ORT Uruguay</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-600">
        <MousePointerClick size={12} className="text-slate-600" />
        <span>Click en materia</span>
        <span className="text-slate-700">→</span>
        <span className="text-slate-500">Sin cursar</span>
        <span className="w-1 h-1 rounded-full bg-amber-500/70 inline-block" />
        <span className="text-amber-600/80">Parcial</span>
        <span className="w-1 h-1 rounded-full bg-emerald-500/70 inline-block" />
        <span className="text-emerald-600/80">Total</span>
        <span className="w-1 h-1 rounded-full bg-amber-500/70 inline-block" />
        <span className="text-slate-500">Sin cursar</span>
      </div>
    </header>
  );
}
