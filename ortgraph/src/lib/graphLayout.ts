/**
 * Graph layout — manual column layout by semester.
 *
 * Semesters 1-10 become columns left-to-right.
 * Within each column, courses are stacked vertically.
 * Elective catalog courses (semester=0) appear in a final column when shown.
 *
 * This gives a clean "curriculum timeline" view that's much more readable
 * than Dagre's automatic layout for this kind of hierarchical data.
 */

import type { Node, Edge } from '@xyflow/react';
import type { Course } from '../types';

export const NODE_WIDTH  = 210;
export const NODE_HEIGHT = 88;

const COL_GAP   = 60;   // horizontal gap between columns (between node right edge and next node left edge)
const ROW_GAP   = 18;   // vertical gap between nodes in the same column
const MARGIN_X  = 40;
const MARGIN_Y  = 60;

const COL_STRIDE = NODE_WIDTH + COL_GAP;   // total horizontal step per semester
const ROW_STRIDE = NODE_HEIGHT + ROW_GAP;  // total vertical step per row

/**
 * Compute positions for all visible courses in a semester-column layout.
 */
export function computeLayout(courses: Course[]): Node[] {
  // Group courses by their column
  // Core courses → column = semester (1-10)
  // Elective courses (semester=0) → column = 11
  const columns = new Map<number, Course[]>();

  for (const course of courses) {
    const col = course.isCore ? course.semester : 11;
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col)!.push(course);
  }

  const nodes: Node[] = [];

  for (const [col, group] of columns) {
    const x = MARGIN_X + (col === 11 ? 11 : col - 1) * COL_STRIDE;

    group.forEach((course, rowIdx) => {
      nodes.push({
        id: course.id,
        type: 'courseNode',
        position: {
          x,
          y: MARGIN_Y + rowIdx * ROW_STRIDE,
        },
        data: { course },
        draggable: false,
      });
    });
  }

  return nodes;
}

/**
 * Build directed edges: prerequisite → dependent course.
 * Solid line = total credit required.
 * Dashed line = partial credit required.
 */
export function buildEdges(courses: Course[]): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();

  for (const course of courses) {
    for (const group of course.prereqGroups) {
      for (const item of group.items) {
        const edgeId = `${item.courseId}->${course.id}`;
        if (seen.has(edgeId)) continue;
        seen.add(edgeId);

        const isTotal = item.required === 'total';

        edges.push({
          id: edgeId,
          source: item.courseId,
          target: course.id,
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: isTotal ? '#3f4f63' : '#2a3a4a',
            strokeWidth: 1.5,
            strokeDasharray: isTotal ? undefined : '5,4',
          },
          markerEnd: {
            type: 'arrowclosed' as const,
            color: isTotal ? '#3f4f63' : '#2a3a4a',
            width: 14,
            height: 14,
          },
          data: { requiredLevel: item.required },
        });
      }
    }
  }

  return edges;
}

/**
 * Build React Flow node objects (positions filled by computeLayout).
 */
export function buildNodes(courses: Course[]): Node[] {
  return courses.map(course => ({
    id: course.id,
    type: 'courseNode',
    position: { x: 0, y: 0 },
    data: { course },
    draggable: false,
  }));
}
