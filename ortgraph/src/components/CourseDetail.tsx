import { useMemo } from 'react';
import {
  X, CheckCircle2, XCircle, AlertCircle, Lock, Zap,
  Circle, BookOpen, MousePointerClick, ChevronRight,
} from 'lucide-react';
import type { CourseStatus, CreditState } from '../types';
import { useProgressStore } from '../store/useProgressStore';
import { getPrereqDetails, type PrereqGroupDetail } from '../lib/prerequisites';
import { courseMap, courses } from '../data/courses';
import { SLOT_OPTIONS } from '../data/slotOptions';

// ── Status label config ────────────────────────────────
const STATUS_LABEL: Record<CourseStatus, { label: string; color: string }> = {
  completed: { label: 'Crédito total',          color: 'text-emerald-400' },
  partial:   { label: 'Crédito parcial',         color: 'text-amber-400'  },
  available: { label: 'Disponible para cursar',  color: 'text-blue-400'   },
  locked:    { label: 'Bloqueada',               color: 'text-slate-500'  },
};

// ── Credit state buttons ───────────────────────────────
const STATE_OPTIONS: Array<{
  value: CreditState;
  label: string;
  sublabel: string;
  activeBg: string;
  activeText: string;
  icon: React.ReactNode;
}> = [
  {
    value: 'none',
    label: 'Sin cursar',
    sublabel: 'No iniciada',
    activeBg: 'bg-slate-700/60 border-slate-600',
    activeText: 'text-slate-300',
    icon: <XCircle size={14} className="text-slate-500" />,
  },
  {
    value: 'partial',
    label: 'Crédito parcial',
    sublabel: 'Cursada / exonerada sin final',
    activeBg: 'bg-amber-900/50 border-amber-700/60',
    activeText: 'text-amber-300',
    icon: <Circle size={14} className="text-amber-400" />,
  },
  {
    value: 'total',
    label: 'Crédito total',
    sublabel: 'Final aprobado',
    activeBg: 'bg-emerald-900/50 border-emerald-700/60',
    activeText: 'text-emerald-300',
    icon: <CheckCircle2 size={14} className="text-emerald-400" />,
  },
];

// ── All elective (non-core) courses for the free-pick slots ──
const ELECTIVE_COURSES = courses.filter(c => !c.isCore && !c.id.startsWith('SLOT_'));

export function CourseDetail() {
  const {
    selectedCourseId,
    approved,
    setSelectedCourse,
    setCreditState,
    getApprovedMap,
    getAllStatuses,
  } = useProgressStore();

  const course = selectedCourseId ? courseMap.get(selectedCourseId) : null;
  const approvedMap = useMemo(() => getApprovedMap(), [approved]);
  const statusMap   = useMemo(() => getAllStatuses(), [approved]);

  if (!course) return null;

  const currentState: CreditState = approved[course.id] ?? 'none';
  const status: CourseStatus      = statusMap.get(course.id) ?? 'locked';
  const isSlot                    = course.id.startsWith('SLOT_');
  const statusInfo                = STATUS_LABEL[status];

  const prereqDetails = useMemo(
    () => isSlot ? [] : getPrereqDetails(course, approvedMap, false),
    [course, approvedMap, isSlot]
  );

  // Slot option IDs — empty list = free pick from all electives
  const slotOptionIds: string[] = isSlot
    ? (SLOT_OPTIONS[course.id]?.length ? SLOT_OPTIONS[course.id] : ELECTIVE_COURSES.map(c => c.id))
    : [];

  return (
    <div
      className="flex flex-col h-full bg-[#11151c] border-l border-slate-800/80 overflow-y-auto"
      style={{ width: 300, minWidth: 300 }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 border-b border-slate-800 gap-2">
        <div className="flex-1 min-w-0">
          {isSlot ? (
            <div className="flex items-center gap-1.5 mb-1">
              <BookOpen size={13} className="text-slate-500" />
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Slot del plan</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-slate-600 bg-slate-800/80 px-1.5 py-0.5 rounded mb-1.5 inline-block">
              #{course.id}
            </span>
          )}
          <h2 className="text-[13px] font-semibold text-slate-100 leading-snug">{course.name}</h2>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className={`text-[11px] font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
            {course.semester > 0 && (
              <span className="text-[11px] text-slate-600">· Sem. {course.semester}</span>
            )}
            {course.isCore && !isSlot && (
              <span className="text-[11px] text-slate-600">· Núcleo</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setSelectedCourse(null)}
          className="text-slate-600 hover:text-slate-300 transition-colors shrink-0"
        >
          <X size={17} />
        </button>
      </div>

      {/* ── SLOT: option picker ─────────────────────────── */}
      {isSlot && (
        <SlotOptionPicker
          slotId={course.id}
          category={course.category ?? ''}
          optionIds={slotOptionIds}
          approved={approved}
          statusMap={statusMap}
          onSetCredit={setCreditState}
        />
      )}

      {/* ── Regular course: state selector ─────────────── */}
      {!isSlot && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 mb-2.5">
            <MousePointerClick size={12} className="text-slate-600" />
            <p className="text-[10px] text-slate-600">
              Click en el nodo para ciclar · o saltá directo:
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {STATE_OPTIONS.map(opt => {
              const isActive = currentState === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setCreditState(course.id, opt.value)}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150',
                    isActive
                      ? `${opt.activeBg} ${opt.activeText} border-opacity-100`
                      : 'bg-transparent border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400',
                  ].join(' ')}
                >
                  <span className="shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-medium leading-none mb-0.5 ${isActive ? '' : 'text-slate-500'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[9px] text-slate-600 leading-none">{opt.sublabel}</div>
                  </div>
                  {isActive && <span className="text-[9px] text-white/30 shrink-0">actual</span>}
                </button>
              );
            })}
          </div>
          {/* Credit system note */}
          <div className="mt-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <span className="text-amber-500/80 font-medium">Parcial</span> desbloquea previas de crédito parcial.{' '}
              <span className="text-emerald-500/80 font-medium">Total</span> desbloquea ambos tipos.
            </p>
          </div>
        </div>
      )}

      {/* ── Prerequisites breakdown ─────────────────────── */}
      {!isSlot && prereqDetails.length > 0 && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 mb-3">
            <Zap size={12} className="text-blue-500" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Previas para inscripción
            </p>
          </div>
          <div className="space-y-3">
            {prereqDetails.map((group, gi) => (
              <PrereqGroupView key={gi} group={group} />
            ))}
          </div>
        </div>
      )}

      {/* ── minCoursesRequired ──────────────────────────── */}
      {!isSlot && course.minCoursesRequired !== undefined && (
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Lock size={12} className="text-slate-600" />
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Mínimo de materias del título
            </p>
          </div>
          <MinCoursesReq required={course.minCoursesRequired} approvedMap={approvedMap} />
        </div>
      )}

      {/* ── No prereqs ──────────────────────────────────── */}
      {!isSlot && prereqDetails.length === 0 && course.minCoursesRequired === undefined && (
        <div className="p-4">
          <p className="text-[11px] text-slate-600">Sin previas — se puede cursar desde el inicio.</p>
        </div>
      )}
    </div>
  );
}

// ── Slot option picker ─────────────────────────────────

function SlotOptionPicker({
  slotId,
  category,
  optionIds,
  approved,
  statusMap,
  onSetCredit,
}: {
  slotId: string;
  category: string;
  optionIds: string[];
  approved: Record<string, CreditState>;
  statusMap: Map<string, CourseStatus>;
  onSetCredit: (id: string, state: CreditState) => void;
}) {
  const isElectiva = slotId.startsWith('SLOT_E');

  return (
    <div className="p-4">
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">
        {isElectiva ? 'Electivas del catálogo' : `Opciones — ${category}`}
      </p>
      <p className="text-[10px] text-slate-600 mb-3 leading-relaxed">
        Hacé click para marcar la/s que cursaste en este slot.
      </p>

      <div className="space-y-1.5 max-h-[65vh] overflow-y-auto pr-0.5">
        {optionIds.map(id => {
          const opt = courseMap.get(id);
          if (!opt) return null;
          const state: CreditState = approved[id] ?? 'none';
          const optStatus = statusMap.get(id) ?? 'locked';

          return (
            <SlotOptionRow
              key={id}
              courseId={id}
              name={opt.name}
              state={state}
              status={optStatus}
              onSetCredit={onSetCredit}
            />
          );
        })}
      </div>
    </div>
  );
}

function SlotOptionRow({
  courseId, name, state, status, onSetCredit,
}: {
  courseId: string;
  name: string;
  state: CreditState;
  status: CourseStatus;
  onSetCredit: (id: string, state: CreditState) => void;
}) {
  const CREDIT_CYCLE: CreditState[] = ['none', 'partial', 'total'];
  const next = CREDIT_CYCLE[(CREDIT_CYCLE.indexOf(state) + 1) % CREDIT_CYCLE.length];

  const isApproved = state !== 'none';

  return (
    <div
      className={[
        'flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all',
        state === 'total'   ? 'bg-emerald-950/40 border-emerald-800/30' :
        state === 'partial' ? 'bg-amber-950/40 border-amber-800/30' :
        status === 'available' ? 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600' :
                               'bg-slate-900/40 border-slate-800/20 opacity-60 hover:opacity-80',
      ].join(' ')}
      onClick={() => onSetCredit(courseId, next)}
    >
      {/* State icon */}
      <span className="shrink-0">
        {state === 'total'   ? <CheckCircle2 size={13} className="text-emerald-400" /> :
         state === 'partial' ? <Circle       size={13} className="text-amber-400"   /> :
                               <XCircle      size={13} className="text-slate-700"   />}
      </span>

      {/* Name */}
      <span className={`flex-1 text-[11px] leading-snug ${
        state === 'total'   ? 'text-emerald-100' :
        state === 'partial' ? 'text-amber-100'   :
                              'text-slate-500'
      }`}>
        {name}
      </span>

      {/* Badge */}
      {isApproved && (
        <span className={[
          'text-[8px] font-semibold px-1 py-0.5 rounded leading-none shrink-0',
          state === 'total'
            ? 'bg-emerald-900/50 text-emerald-500 border border-emerald-800/30'
            : 'bg-amber-900/50 text-amber-500 border border-amber-800/30',
        ].join(' ')}>
          {state === 'total' ? 'total' : 'parcial'}
        </span>
      )}

      {/* Arrow hint */}
      {!isApproved && status === 'available' && (
        <ChevronRight size={12} className="text-slate-700 shrink-0" />
      )}
    </div>
  );
}

// ── Prereq group view ──────────────────────────────────

function PrereqGroupView({ group }: { group: PrereqGroupDetail }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={[
          'text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider leading-none',
          group.type === 'AND'
            ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/50'
            : 'bg-purple-950/80 text-purple-400 border border-purple-800/50',
        ].join(' ')}>
          {group.type === 'AND' ? 'Todos' : 'Al menos 1'}
        </span>
        {group.groupSatisfied
          ? <CheckCircle2 size={11} className="text-emerald-500" />
          : <AlertCircle  size={11} className="text-red-500/70"  />
        }
      </div>
      <div className="space-y-1 pl-1">
        {group.items.map(item => {
          const dep = courseMap.get(item.courseId);
          return (
            <div
              key={item.courseId}
              className={[
                'flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px]',
                item.satisfied
                  ? 'bg-emerald-950/40 border border-emerald-800/25'
                  : 'bg-slate-800/40 border border-slate-700/25',
              ].join(' ')}
            >
              {item.satisfied
                ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                : <XCircle      size={11} className="text-red-500/60 shrink-0"  />
              }
              <span className={`flex-1 leading-snug ${item.satisfied ? 'text-slate-300' : 'text-slate-500'}`}>
                {dep?.name ?? item.courseId}
              </span>
              <span className={[
                'text-[8px] font-semibold px-1 py-0.5 rounded leading-none shrink-0',
                item.required === 'total'
                  ? 'bg-emerald-900/40 text-emerald-600 border border-emerald-800/30'
                  : 'bg-amber-900/40 text-amber-600 border border-amber-800/30',
              ].join(' ')}>
                {item.required === 'total' ? 'total' : 'parcial'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Min courses required ───────────────────────────────

function MinCoursesReq({
  required, approvedMap,
}: {
  required: number;
  approvedMap: Map<string, CreditState>;
}) {
  let totalApproved = 0;
  for (const state of approvedMap.values()) {
    if (state === 'total') totalApproved++;
  }
  const satisfied = totalApproved >= required;
  const pct = Math.min(100, (totalApproved / required) * 100);

  return (
    <div>
      <div className={[
        'flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] border',
        satisfied
          ? 'bg-emerald-950/40 border-emerald-800/25'
          : 'bg-slate-800/40 border-slate-700/25',
      ].join(' ')}>
        {satisfied
          ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
          : <XCircle      size={12} className="text-red-500/60 shrink-0"  />
        }
        <span className={satisfied ? 'text-slate-300' : 'text-slate-500'}>
          {totalApproved} / {required} materias con crédito total
        </span>
      </div>
      <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${satisfied ? 'bg-emerald-500' : 'bg-blue-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
