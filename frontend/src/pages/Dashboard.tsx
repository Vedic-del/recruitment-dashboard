import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Briefcase, CheckCircle, TrendingUp } from 'lucide-react';

export default function Dashboard({ apiUrl }: { apiUrl: string }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/reports/dashboard/summary`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  const stats = [
    {
      label: 'Open Positions',
      value: summary?.open_positions || 0,
      icon: Briefcase,
      color: 'blue',
    },
    {
      label: 'Total Applications',
      value: summary?.total_applications || 0,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Hired Candidates',
      value: summary?.total_hired || 0,
      icon: CheckCircle,
      color: 'purple',
    },
    {
      label: 'Avg Candidate Score',
      value: summary?.avg_candidate_score || 0,
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
        ✨ Welcome to CFM Asset Reconstruction Recruitment Dashboard. Track your hiring pipeline, candidates, and get AI-powered insights.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorClass = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          }[stat.color];

          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Start Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-600 pl-4">
            <h3 className="font-bold text-gray-900 mb-2">1. Create Department</h3>
            <p className="text-gray-600 text-sm">
              Start by creating departments in your organization. Each department will have its own hiring managers.
            </p>
          </div>
          <div className="border-l-4 border-purple-600 pl-4">
            <h3 className="font-bold text-gray-900 mb-2">2. Add Positions</h3>
            <p className="text-gray-600 text-sm">
              Create job openings with AI-generated job descriptions. The system will automatically score candidates.
            </p>
          </div>
          <div className="border-l-4 border-green-600 pl-4">
            <h3 className="font-bold text-gray-900 mb-2">3. Upload Candidates</h3>
            <p className="text-gray-600 text-sm">
              Upload resumes and the AI will extract key information and match candidates to open roles.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>AI-Powered JD Generation:</strong> Create professional job descriptions from templates</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Resume Parsing:</strong> Automatically extract skills, experience, salary expectations</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Candidate Scoring:</strong> Get AI-based match scores for each candidate</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Pipeline Tracking:</strong> Drag candidates through interview stages</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span><strong>Smart Recommendations:</strong> Get suggestions for alternative roles when rejecting candidates</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
