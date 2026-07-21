/**
 * Main React Flow canvas.
 * Handles layout computation, filtering, hover highlighting, and rendering.
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { courses } from '../data/courses';
import { buildEdges, computeLayout } from '../lib/graphLayout';
import { useProgressStore } from '../store/useProgressStore';
import { CourseNode } from './CourseNode';
import type { CourseStatus } from '../types';

const NODE_TYPES = { courseNode: CourseNode };

// Build all edges once (static — edges don't change)
const ALL_EDGES = buildEdges(courses);

export function GraphCanvas() {
  const {
    approved,
    filterYear,
    showOnlyAvailable,
    showElectives,
    hoveredCourseId,
    setSelectedCourse,
    getAllStatuses,
  } = useProgressStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Compute which courses to show
  const visibleCourses = useMemo(() => {
    const statuses = getAllStatuses();
    return courses.filter(course => {
      // Filter by "show electives"
      if (!showElectives && !course.isCore) return false;
      // Filter by year
      if (filterYear !== null && course.year !== filterYear && course.year !== 0) return false;
      // Filter "show only available"
      if (showOnlyAvailable) {
        const s: CourseStatus = statuses.get(course.id) ?? 'locked';
        if (s !== 'available' && s !== 'partial' && s !== 'completed') return false;
      }
      return true;
    });
  }, [showElectives, filterYear, showOnlyAvailable, approved]);

  const visibleIds = useMemo(
    () => new Set(visibleCourses.map(c => c.id)),
    [visibleCourses]
  );

  // Build and layout nodes when visible courses change
  useEffect(() => {
    const laidOut = computeLayout(visibleCourses);
    const relevantEdges = ALL_EDGES.filter(
      e => visibleIds.has(e.source) && visibleIds.has(e.target)
    );
    setNodes(laidOut);
    setEdges(relevantEdges);
  }, [visibleCourses, visibleIds]);

  // Compute sets of highlighted nodes when hovering
  const { predecessors, successors } = useMemo(() => {
    if (!hoveredCourseId) return { predecessors: new Set<string>(), successors: new Set<string>() };

    const preds = new Set<string>();
    const succs = new Set<string>();

    // BFS upward (predecessors — courses that must be taken before)
    const upQueue = [hoveredCourseId];
    while (upQueue.length > 0) {
      const cur = upQueue.shift()!;
      for (const edge of ALL_EDGES) {
        if (edge.target === cur && !preds.has(edge.source)) {
          preds.add(edge.source);
          upQueue.push(edge.source);
        }
      }
    }

    // BFS downward (successors — courses unlocked by this one)
    const downQueue = [hoveredCourseId];
    while (downQueue.length > 0) {
      const cur = downQueue.shift()!;
      for (const edge of ALL_EDGES) {
        if (edge.source === cur && !succs.has(edge.target)) {
          succs.add(edge.target);
          downQueue.push(edge.target);
        }
      }
    }

    return { predecessors: preds, successors: succs };
  }, [hoveredCourseId]);

  // Apply highlighting to edges
  const styledEdges = useMemo(() => {
    if (!hoveredCourseId) return edges;

    return edges.map(edge => {
      const isRelevant =
        (edge.target === hoveredCourseId && predecessors.has(edge.source)) ||
        (edge.source === hoveredCourseId && successors.has(edge.target)) ||
        predecessors.has(edge.source) && predecessors.has(edge.target) ||
        successors.has(edge.source) && successors.has(edge.target);

      const isPredEdge = edge.target === hoveredCourseId || (predecessors.has(edge.target) && predecessors.has(edge.source));

      if (!isRelevant) {
        return {
          ...edge,
          style: { ...edge.style, opacity: 0.05 },
        };
      }

      const highlightColor = isPredEdge ? '#f59e0b' : '#3b82f6';
      const existingMarker = typeof edge.markerEnd === 'object' && edge.markerEnd !== null
        ? (edge.markerEnd as Record<string, unknown>)
        : {};
      const markerType = (existingMarker.type as string) ?? 'arrowclosed';
      return {
        ...edge,
        style: {
          ...edge.style,
          stroke: highlightColor,
          strokeWidth: 2,
          opacity: 1,
        },
        markerEnd: {
          ...existingMarker,
          type: markerType as 'arrowclosed',
          color: highlightColor,
        },
      };
    });
  }, [edges, hoveredCourseId, predecessors, successors]);

  const onPaneClick = useCallback(() => {
    setSelectedCourse(null);
  }, [setSelectedCourse]);

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges as Edge[]}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        minZoom={0.05}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnDoubleClick={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#1e2533"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
        />
        <MiniMap
          position="bottom-left"
          style={{
            background: '#0d1017',
            border: '1px solid #1e293b',
            borderRadius: 8,
          }}
          nodeColor={(node) => {
            const statuses = getAllStatuses();
            const status = statuses.get(node.id) ?? 'locked';
            const colors: Record<CourseStatus, string> = {
              completed: '#10b981',
              partial: '#f59e0b',
              available: '#3b82f6',
              locked: '#1e293b',
            };
            return colors[status];
          }}
          maskColor="rgba(0,0,0,0.5)"
        />
      </ReactFlow>

    </div>
  );
}
