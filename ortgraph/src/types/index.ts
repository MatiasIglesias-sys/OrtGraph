// Credit state: how far a student has progressed in a course
export type CreditState = 'none' | 'partial' | 'total';

// A single prerequisite item: one course at a required credit level
export interface PrereqItem {
  courseId: string;
  required: 'partial' | 'total';
}

// A group of prerequisites combined with AND or OR logic
export interface PrereqGroup {
  type: 'AND' | 'OR';
  items: PrereqItem[];
}

// Full course definition
export interface Course {
  id: string;           // numeric code, e.g. "3851"
  name: string;
  year: number;         // 1-5
  semester: number;     // 1-10 (plan slot number)
  isCore: boolean;      // part of the core plan vs catalog elective
  isElective: boolean;  // designated as an elective slot in the plan
  // prereqGroups for partial credit (inscription). All groups must be satisfied (AND between groups).
  prereqGroups: PrereqGroup[];
  // prereqGroups for total credit (approval). Same structure.
  prereqGroupsTotal: PrereqGroup[];
  // Minimum number of total-credit courses required from the title
  minCoursesRequired?: number;
  // Category label for slot-type courses (e.g. "Matemática", "Ciencias sociales")
  category?: string;
}

// Visual status of a course node
export type CourseStatus = 'locked' | 'available' | 'partial' | 'completed';

// Extended course with computed status
export interface CourseWithStatus extends Course {
  status: CourseStatus;
}
