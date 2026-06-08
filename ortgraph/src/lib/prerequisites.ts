/**
 * Core prerequisite evaluation logic.
 * Pure functions — no React, no side effects. Fully testable.
 */

import type { Course, CreditState, CourseStatus, PrereqGroup, PrereqItem } from '../types';

/**
 * Check if a single prerequisite item is satisfied given the approved courses map.
 * A 'partial' requirement is satisfied by partial OR total credit.
 * A 'total' requirement is satisfied ONLY by total credit.
 */
function isItemSatisfied(item: PrereqItem, approved: Map<string, CreditState>): boolean {
  const state = approved.get(item.courseId) ?? 'none';
  if (item.required === 'partial') {
    return state === 'partial' || state === 'total';
  }
  return state === 'total';
}

/**
 * Check if a prereq group is satisfied.
 * AND groups: ALL items must be satisfied.
 * OR groups: AT LEAST ONE item must be satisfied.
 */
function isGroupSatisfied(group: PrereqGroup, approved: Map<string, CreditState>): boolean {
  if (group.type === 'AND') {
    return group.items.every(item => isItemSatisfied(item, approved));
  }
  // OR
  return group.items.some(item => isItemSatisfied(item, approved));
}

/**
 * Count how many courses have 'total' credit in the approved map.
 */
function countTotalApproved(approved: Map<string, CreditState>): number {
  let count = 0;
  for (const state of approved.values()) {
    if (state === 'total') count++;
  }
  return count;
}

/**
 * Check if ALL prerequisite groups are satisfied (AND between groups).
 */
function areAllGroupsSatisfied(groups: PrereqGroup[], approved: Map<string, CreditState>): boolean {
  return groups.every(group => isGroupSatisfied(group, approved));
}

/**
 * Compute the visual/logical status of a course given the current approved state.
 *
 * Returns:
 *  - 'completed' : student has total credit
 *  - 'partial'   : student has partial credit
 *  - 'available' : meets all prereqs for partial credit (can enroll now)
 *  - 'locked'    : prereqs not yet met
 */
export function getCourseStatus(
  course: Course,
  approved: Map<string, CreditState>
): CourseStatus {
  const creditState = approved.get(course.id) ?? 'none';

  if (creditState === 'total') return 'completed';
  if (creditState === 'partial') return 'partial';

  // Check if course can be enrolled in (prereqs for partial credit)
  const totalApproved = countTotalApproved(approved);

  // Check minCoursesRequired
  if (course.minCoursesRequired !== undefined && totalApproved < course.minCoursesRequired) {
    return 'locked';
  }

  // Check all prereq groups (AND between groups)
  if (course.prereqGroups.length === 0) {
    return 'available'; // no prereqs
  }

  if (areAllGroupsSatisfied(course.prereqGroups, approved)) {
    return 'available';
  }

  return 'locked';
}

/**
 * Compute the status of a SLOT_ node based on whether any of its option
 * courses have been approved.
 *
 * - 'completed' if ANY option has total credit
 * - 'partial'   if ANY option has partial credit (and none have total)
 * - 'available' always (slots themselves have no prerequisites)
 */
export function getSlotStatus(
  optionIds: string[],
  approved: Map<string, CreditState>
): CourseStatus {
  let hasParcial = false;
  for (const id of optionIds) {
    const state = approved.get(id) ?? 'none';
    if (state === 'total') return 'completed';
    if (state === 'partial') hasParcial = true;
  }
  return hasParcial ? 'partial' : 'available';
}

/**
 * Get the status of all courses at once.
 * SLOT_ nodes are handled separately via getSlotStatus.
 * Returns a map of courseId -> CourseStatus.
 */
export function getAllStatuses(
  courses: Course[],
  approved: Map<string, CreditState>,
  slotOptions?: Record<string, string[]>
): Map<string, CourseStatus> {
  const result = new Map<string, CourseStatus>();
  for (const course of courses) {
    if (course.id.startsWith('SLOT_') && slotOptions) {
      const opts = slotOptions[course.id] ?? [];
      result.set(course.id, getSlotStatus(opts, approved));
    } else {
      result.set(course.id, getCourseStatus(course, approved));
    }
  }
  return result;
}

/**
 * Check each prereq item/group individually to display which ones are met.
 * Returns details about which prereqs are satisfied and which are not.
 */
export interface PrereqGroupDetail {
  type: 'AND' | 'OR';
  items: Array<{
    courseId: string;
    required: 'partial' | 'total';
    satisfied: boolean;
    currentState: CreditState;
  }>;
  groupSatisfied: boolean;
}

export function getPrereqDetails(
  course: Course,
  approved: Map<string, CreditState>,
  useTotal: boolean = false
): PrereqGroupDetail[] {
  const groups = useTotal ? course.prereqGroupsTotal : course.prereqGroups;
  return groups.map(group => ({
    type: group.type,
    items: group.items.map(item => ({
      courseId: item.courseId,
      required: item.required,
      satisfied: isItemSatisfied(item, approved),
      currentState: approved.get(item.courseId) ?? 'none',
    })),
    groupSatisfied: isGroupSatisfied(group, approved),
  }));
}
