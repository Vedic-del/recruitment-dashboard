import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Eye, Calendar, Users } from 'lucide-react';

export default function PositionsPage({ apiUrl }: { apiUrl: string }) {
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [hiringManagers, setHiringManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    hiring_manager_id: '',
    level: 'Mid-level',
    skills: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [posRes, deptRes, hmRes] = await Promise.all([
        axios.get(`${apiUrl}/api/positions`),
        axios.get(`${apiUrl}/api/departments`),
        axios.get(`${apiUrl}/api/hiring-managers`),
      ]);
      setPositions(posRes.data);
      setDepartments(deptRes.data);
      setHiringManagers(hmRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = formData.skills.split(',').map(s => s.trim());

    try {
      await axios.post(`${apiUrl}/api/positions`, {
        title: formData.title,
        department_id: formData.department_id,
        hiring_manager_id: formData.hiring_manager_id,
        requirements: {
          level: formData.level,
          skills,
        },
      });
      setFormData({ title: '', department_id: '', hiring_manager_id: '', level: 'Mid-level', skills: '' });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating position:', error);
    }
  };

  const getDepartmentName = (id: string) => {
    return departments.find(d => d.id === id)?.name || 'Unknown';
  };

  const getManagerName = (id: string) => {
    return hiringManagers.find(m => m.id === id)?.name || 'Unknown';
  };

  if (loading) {
    return <div className="text-center py-12">Loading positions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Positions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Position
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Position</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Manager</label>
                <select
                  required
                  value={formData.hiring_manager_id}
                  onChange={(e) => setFormData({ ...formData, hiring_manager_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Hiring Manager</option>
                  {hiringManagers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., React, Node.js, PostgreSQL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Position (AI will generate JD)
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {positions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No positions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {positions.map((pos) => (
            <div key={pos.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{pos.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {pos.department_name} • {pos.hiring_manager_name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pos.status === 'Open' ? 'bg-green-100 text-green-800' :
                  pos.status === 'Closed' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {pos.status}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(pos.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {pos.total_candidates} candidates
                </div>
              </div>
              <button
                onClick={() => setSelectedPosition(pos)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                View Details & JD
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{selectedPosition.title}</h3>
            <div className="prose prose-sm max-w-none mb-6">
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {selectedPosition.generated_jd}
              </pre>
            </div>
            <button
              onClick={() => setSelectedPosition(null)}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
