# OrtGraph

Visualizador interactivo del plan de estudios de **Ingeniería en Sistemas** (Universidad ORT Uruguay, Plan 2019) como un grafo de dependencias de materias.

## Cómo correrlo

```bash
npm install
npm run dev
```

Luego abrí [http://localhost:5173](http://localhost:5173).

## Stack tecnológico

- **Vite + React 18 + TypeScript**
- **@xyflow/react** — grafo interactivo de nodos y aristas
- **@dagrejs/dagre** — auto-layout jerárquico (top-bottom)
- **Tailwind CSS v4** — styling
- **Zustand** — estado global con persistencia en localStorage
- **lucide-react** — iconografía

## Arquitectura

```
src/
  data/
    courses.ts          # Todas las materias con sus previas (~140 cursos)
  types/
    index.ts            # Interfaces TypeScript
  lib/
    prerequisites.ts    # Lógica pura de evaluación de previas
    graphLayout.ts      # Posicionamiento de nodos con Dagre
  store/
    useProgressStore.ts # Estado global (Zustand + localStorage)
  components/
    CourseNode.tsx      # Nodo custom de React Flow
    GraphCanvas.tsx     # Canvas principal con React Flow
    Sidebar.tsx         # Panel lateral: stats, filtros, leyenda
    CourseDetail.tsx    # Panel de detalle al clickear una materia
    Header.tsx          # Barra superior
```

## Modelo de previas

El sistema de previas de ORT es complejo. Cada materia tiene:

### Tipos de crédito
- **Crédito parcial** — se obtiene al exonerar o aprobar sin rendir el examen final
- **Crédito total** — requiere examen final aprobado

### Tipos de requisitos
1. **AND** (`Los siguientes créditos`) — necesitás **todas** las materias del grupo
2. **OR** (`Al menos 1 de los siguientes`) — necesitás **al menos una** del grupo
3. **Combinado** — varios grupos AND/OR que se combinan con AND entre sí (ej. Proyecto tiene 6 grupos simultáneos)
4. **Cantidad** (`El crédito total aprobado de N materias`) — necesitás N materias aprobadas en total del título

### Función central (lib/prerequisites.ts)

```typescript
function getCourseStatus(
  course: Course,
  approved: Map<string, CreditState>
): 'locked' | 'available' | 'partial' | 'completed'
```

Esta función es **pura** (sin efectos secundarios) y testeable de forma aislada.

## Funcionalidades

- **Grafo interactivo**: zoom, pan, minimapa, controles
- **Estados visuales**: verde (total), ámbar (parcial), azul con glow (disponible), gris (bloqueada)
- **Hover highlighting**: predecesores en ámbar, sucesores en azul
- **Click para detalle**: muestra previas con check/cruz por requisito
- **Cambiar estado**: marcá cada materia como No cursada / Parcial / Total
- **Filtros**: por año, solo disponibles, mostrar/ocultar electivas
- **Persistencia**: progreso guardado en localStorage automáticamente
- **Aristas**: línea sólida = crédito total requerido, punteada = crédito parcial requerido
