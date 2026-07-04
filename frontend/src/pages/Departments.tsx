import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

export default function DepartmentsPage({ apiUrl }: { apiUrl: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDept, setNewDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/departments`);
      setDepartments(res.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim()) return;

    try {
      await axios.post(`${apiUrl}/api/departments`, { name: newDept });
      setNewDept('');
      fetchDepartments();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await axios.delete(`${apiUrl}/api/departments/${id}`);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Departments</h2>

        <form onSubmit={handleAddDepartment} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter department name (e.g., Engineering, Sales, HR)"
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
          </div>
        </form>

        {departments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No departments yet. Create one to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      Created {new Date(dept.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
