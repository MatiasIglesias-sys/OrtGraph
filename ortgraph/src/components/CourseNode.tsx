/**
 * Custom React Flow node for a course.
 *
 * Interaction model:
 *   Click → cycle credit state: none → partial → total → none
 *   The cycle works even on locked courses (a student may have approved
 *   a course independently of what the system shows).
 *
 * Visual states:
 *   locked    → grey, dimmed
 *   available → blue glow (can enroll now)
 *   partial   → amber (has partial credit)
 *   completed → green (has total credit)
 */

import { memo, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Course, CourseStatus, CreditState } from '../types';
import { useProgressStore } from '../store/useProgressStore';
import { CheckCircle2, Lock, Circle, Zap, BookOpen, MinusCircle } from 'lucide-react';

interface CourseNodeData {
  course: Course;
}

// Cycle order for click interaction
const CREDIT_CYCLE: CreditState[] = ['none', 'partial', 'total'];

function nextCreditState(current: CreditState): CreditState {
  const idx = CREDIT_CYCLE.indexOf(current);
  return CREDIT_CYCLE[(idx + 1) % CREDIT_CYCLE.length];
}

// Visual config per status
const STATUS_CONFIG: Record<CourseStatus, {
  border: string;
  bg: string;
  nameColor: string;
  badgeBg: string;
  badgeText: string;
  badgeLabel: string;
  glow?: string;
}> = {
  completed: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-950/60',
    nameColor: 'text-emerald-100',
    badgeBg: 'bg-emerald-500/20 border border-emerald-500/30',
    badgeText: 'text-emerald-400',
    badgeLabel: 'Total',
    glow: '0 0 14px 3px rgba(16, 185, 129, 0.35)',
  },
  partial: {
    border: 'border-amber-500',
    bg: 'bg-amber-950/50',
    nameColor: 'text-amber-100',
    badgeBg: 'bg-amber-500/20 border border-amber-500/30',
    badgeText: 'text-amber-400',
    badgeLabel: 'Parcial',
    glow: '0 0 10px 2px rgba(245, 158, 11, 0.3)',
  },
  available: {
    border: 'border-blue-500',
    bg: 'bg-blue-950/60',
    nameColor: 'text-blue-100',
    badgeBg: 'bg-blue-500/25 border border-blue-400/40',
    badgeText: 'text-blue-300',
    badgeLabel: 'Disponible',
    glow: '0 0 16px 4px rgba(59, 130, 246, 0.5)',
  },
  locked: {
    border: 'border-slate-700',
    bg: 'bg-slate-900/70',
    nameColor: 'text-slate-500',
    badgeBg: 'bg-slate-700/40 border border-slate-600/30',
    badgeText: 'text-slate-600',
    badgeLabel: 'Bloqueada',
  },
};

// Icon for the current credit state (shown top-left)
function CreditIcon({ state, status }: { state: CreditState; status: CourseStatus }) {
  if (state === 'total') return <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />;
  if (state === 'partial') return <Circle size={13} className="text-amber-400 shrink-0" />;
  if (status === 'available') return <Zap size={13} className="text-blue-400 shrink-0" />;
  if (status === 'locked') return <Lock size={13} className="text-slate-600 shrink-0" />;
  return <MinusCircle size={13} className="text-slate-600 shrink-0" />;
}

// Tiny hint showing what the NEXT click will do — shown on hover
function NextStateHint({ next }: { next: CreditState }) {
  if (next === 'partial') return (
    <span className="text-[8px] text-amber-500/70 font-medium">→ Parcial</span>
  );
  if (next === 'total') return (
    <span className="text-[8px] text-emerald-500/70 font-medium">→ Total</span>
  );
  return (
    <span className="text-[8px] text-slate-600 font-medium">→ Resetear</span>
  );
}

function CourseNodeComponent({ data, id }: NodeProps) {
  const nodeData = data as unknown as CourseNodeData;
  const { course } = nodeData;

  const {
    approved,
    selectedCourseId,
    hoveredCourseId,
    setSelectedCourse,
    setHoveredCourse,
    setCreditState,
    getAllStatuses,
  } = useProgressStore();

  const statuses = getAllStatuses();
  const status: CourseStatus = statuses.get(course.id) ?? 'locked';
  const currentCredit: CreditState = approved[course.id] ?? 'none';
  const nextCredit = nextCreditState(currentCredit);
  const cfg = STATUS_CONFIG[status];

  const isSelected = selectedCourseId === id;
  const isHovered = hoveredCourseId === id;
  const isDimmed = hoveredCourseId !== null && hoveredCourseId !== id;
  const isSlot = course.id.startsWith('SLOT_');

  // Click: cycle state + keep selected for detail panel
  const handleClick = useCallback(() => {
    if (!isSlot) {
      setCreditState(course.id, nextCredit);
    }
    // Always select so detail panel opens/stays open
    setSelectedCourse(id);
  }, [course.id, id, isSlot, nextCredit, setCreditState, setSelectedCourse]);

  const handleMouseEnter = useCallback(() => setHoveredCourse(id), [id, setHoveredCourse]);
  const handleMouseLeave = useCallback(() => setHoveredCourse(null), [setHoveredCourse]);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        'relative rounded-xl border-2 cursor-pointer select-none',
        'flex flex-col justify-between overflow-hidden',
        'transition-all duration-150',
        cfg.border,
        cfg.bg,
        isSelected ? 'ring-2 ring-white/25 ring-offset-1 ring-offset-slate-900 scale-[1.06]' : '',
        isHovered && !isSelected ? 'scale-[1.04]' : '',
        isDimmed ? 'opacity-20' : 'opacity-100',
        status === 'available' && currentCredit === 'none' ? 'node-available' : '',
      ].join(' ')}
      style={{
        width: 200,
        minHeight: 82,
        boxShadow: cfg.glow ?? '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Name row */}
      <div className="px-3 pt-3 pb-1 flex items-start gap-2">
        {isSlot
          ? <BookOpen size={13} className="text-slate-500 shrink-0 mt-0.5" />
          : <CreditIcon state={currentCredit} status={status} />
        }
        <span
          className={[
            'font-medium text-[11px] leading-snug flex-1 min-w-0',
            isSlot ? 'text-slate-400 italic' : cfg.nameColor,
          ].join(' ')}
        >
          {course.name}
        </span>
      </div>

      {/* Footer row: code + badge + next-click hint */}
      <div className="px-3 pb-2.5 flex items-center justify-between gap-1">
        <span className="text-[10px] font-mono text-slate-700">
          {isSlot ? '' : `#${course.id}`}
        </span>

        {/* On hover: show what next click will do */}
        {isHovered && !isSlot
          ? <NextStateHint next={nextCredit} />
          : null
        }

        {/* Badge — only shown when not hovering */}
        {(!isHovered || isSlot) && (
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${cfg.badgeBg} ${cfg.badgeText}`}>
            {isSlot ? course.category : cfg.badgeLabel}
          </span>
        )}
      </div>

      {/* Semester color strip on the right edge */}
      {course.isCore && course.semester > 0 && (
        <div
          className="absolute top-0 right-0 w-[3px] h-full rounded-r-xl opacity-70"
          style={{ background: getSemesterColor(course.semester) }}
        />
      )}

      {/* Three-step progress dots at the bottom for non-slot courses */}
      {!isSlot && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
          {CREDIT_CYCLE.filter(s => s !== 'none').map(step => (
            <div
              key={step}
              className={[
                'w-1 h-1 rounded-full transition-all duration-200',
                step === 'partial' && (currentCredit === 'partial' || currentCredit === 'total')
                  ? 'bg-amber-400'
                  : step === 'total' && currentCredit === 'total'
                    ? 'bg-emerald-400'
                    : 'bg-slate-700',
              ].join(' ')}
            />
          ))}
        </div>
      )}

      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
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

export const CourseNode = memo(CourseNodeComponent);
