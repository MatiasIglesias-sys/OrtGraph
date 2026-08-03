import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CreditState, CourseStatus } from '../types';
import { courses } from '../data/courses';
import { SLOT_OPTIONS } from '../data/slotOptions';
import { getAllStatuses } from '../lib/prerequisites';

export interface NodePosition {
  x: number;
  y: number;
}

interface ProgressStore {
  approved: Record<string, CreditState>;
  selectedCourseId: string | null;
  hoveredCourseId: string | null;
  filterYear: number | null;
  showOnlyAvailable: boolean;
  showElectives: boolean;
  /** When true, courses can't be dragged around the canvas (default). */
  nodesLocked: boolean;
  /** Positions saved after the user drags courses manually. */
  customPositions: Record<string, NodePosition>;

  setCreditState: (courseId: string, state: CreditState) => void;
  setSelectedCourse: (courseId: string | null) => void;
  setHoveredCourse: (courseId: string | null) => void;
  setFilterYear: (year: number | null) => void;
  setShowOnlyAvailable: (show: boolean) => void;
  setShowElectives: (show: boolean) => void;
  setNodesLocked: (locked: boolean) => void;
  saveNodePositions: (positions: Record<string, NodePosition>) => void;
  resetPositions: () => void;
  resetProgress: () => void;

  getApprovedMap: () => Map<string, CreditState>;
  getAllStatuses: () => Map<string, CourseStatus>;
  getCompletedCount: () => number;
  getCoreCount: () => number;
  getAvailableCount: () => number;
}

// Core courses that count toward progress (non-slot, non-elective-only)
const CORE_COURSES = courses.filter(c => c.isCore && !c.id.startsWith('SLOT_'));

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      approved: {},
      selectedCourseId: null,
      hoveredCourseId: null,
      filterYear: null,
      showOnlyAvailable: false,
      showElectives: false,
      nodesLocked: true,
      customPositions: {},

      setCreditState: (courseId, state) =>
        set(s => ({ approved: { ...s.approved, [courseId]: state } })),

      setSelectedCourse: (courseId) => set({ selectedCourseId: courseId }),
      setHoveredCourse:  (courseId) => set({ hoveredCourseId: courseId }),
      setFilterYear:     (year)     => set({ filterYear: year }),
      setShowOnlyAvailable: (show)  => set({ showOnlyAvailable: show }),
      setShowElectives:  (show)     => set({ showElectives: show }),
      setNodesLocked:    (locked)   => set({ nodesLocked: locked }),

      saveNodePositions: (positions) =>
        set(s => ({ customPositions: { ...s.customPositions, ...positions } })),

      resetPositions: () => set({ customPositions: {} }),

      resetProgress: () => set({ approved: {}, selectedCourseId: null }),

      getApprovedMap: () => {
        const map = new Map<string, CreditState>();
        for (const [k, v] of Object.entries(get().approved)) {
          if (v !== 'none') map.set(k, v);
        }
        return map;
      },

      getAllStatuses: () =>
        getAllStatuses(courses, get().getApprovedMap(), SLOT_OPTIONS),

      getCompletedCount: () => {
        const map = get().getApprovedMap();
        // A core slot counts as completed if any option has total credit
        let count = 0;
        for (const c of CORE_COURSES) {
          if (map.get(c.id) === 'total') count++;
        }
        // Also count slots that are satisfied
        for (const [slotId, opts] of Object.entries(SLOT_OPTIONS)) {
          const slot = courses.find(c => c.id === slotId);
          if (!slot?.isCore) continue;
          if (opts.some(id => map.get(id) === 'total')) count++;
        }
        return count;
      },

      getCoreCount: () =>
        CORE_COURSES.length + Object.keys(SLOT_OPTIONS).filter(id => {
          const c = courses.find(x => x.id === id);
          return c?.isCore;
        }).length,

      getAvailableCount: () => {
        const statuses = get().getAllStatuses();
        let count = 0;
        for (const c of CORE_COURSES) {
          if (statuses.get(c.id) === 'available') count++;
        }
        return count;
      },
    }),
    {
      name: 'ortgraph-progress',
      partialize: (state) => ({
        approved: state.approved,
        nodesLocked: state.nodesLocked,
        customPositions: state.customPositions,
      }),
    }
  )
);
