import './index.css';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GraphCanvas } from './components/GraphCanvas';
import { CourseDetail } from './components/CourseDetail';
import { useProgressStore } from './store/useProgressStore';

function App() {
  const selectedCourseId = useProgressStore(s => s.selectedCourseId);

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] text-slate-100 overflow-hidden">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <GraphCanvas />
        {selectedCourseId && <CourseDetail />}
      </div>
    </div>
  );
}

export default App;
