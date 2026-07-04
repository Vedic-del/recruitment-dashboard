import { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, Target } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import DepartmentsPage from './pages/Departments';
import PositionsPage from './pages/Positions';
import CandidatesPage from './pages/Candidates';
import PipelinePage from './pages/Pipeline';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [apiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:5000');

  useEffect(() => {
    // Test API connection
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(() => console.log('Connected to API'))
      .catch(() => console.warn('API not available'));
  }, [apiUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">CFM Recruitment Dashboard</h1>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                currentPage === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('departments')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                currentPage === 'departments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5 inline mr-2" />
              Departments
            </button>
            <button
              onClick={() => setCurrentPage('positions')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                currentPage === 'positions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-5 h-5 inline mr-2" />
              Positions
            </button>
            <button
              onClick={() => setCurrentPage('candidates')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                currentPage === 'candidates'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Candidates
            </button>
            <button
              onClick={() => setCurrentPage('pipeline')}
              className={`px-4 py-4 font-medium border-b-2 transition-colors ${
                currentPage === 'pipeline'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-5 h-5 inline mr-2" />
              Pipeline
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'dashboard' && <Dashboard apiUrl={apiUrl} />}
        {currentPage === 'departments' && <DepartmentsPage apiUrl={apiUrl} />}
        {currentPage === 'positions' && <PositionsPage apiUrl={apiUrl} />}
        {currentPage === 'candidates' && <CandidatesPage apiUrl={apiUrl} />}
        {currentPage === 'pipeline' && <PipelinePage apiUrl={apiUrl} />}
      </main>
    </div>
  );
}
