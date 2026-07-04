import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Star } from 'lucide-react';

const STAGES = ['Applied', 'Screening', 'Interview1', 'Interview2', 'Interview3', 'Offer', 'Hired', 'Rejected'];

export default function PipelinePage({ apiUrl }: { apiUrl: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [feedbackForm, setFeedbackForm] = useState({ round: 1, technical_score: 5, communication_score: 5, notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, posRes] = await Promise.all([
        axios.get(`${apiUrl}/api/applications`),
        axios.get(`${apiUrl}/api/positions`),
      ]);
      setApplications(appRes.data);
      setPositions(posRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByStage = (stage: string) => {
    return applications.filter(app => app.status === stage);
  };

  const handleMoveStage = async (appId: string, newStage: string) => {
    try {
      await axios.post(`${apiUrl}/api/applications/${appId}/move-stage`, {
        new_status: newStage,
      });
      fetchData();
    } catch (error) {
      console.error('Error moving application:', error);
    }
  };

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await axios.put(`${apiUrl}/api/applications/${selectedApp.id}/feedback`, {
        round: feedbackForm.round,
        technical_score: feedbackForm.technical_score,
        communication_score: feedbackForm.communication_score,
        culture_fit_score: 5,
        notes: feedbackForm.notes,
      });
      setFeedbackForm({ round: 1, technical_score: 5, communication_score: 5, notes: '' });
      setSelectedApp(null);
      fetchData();
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recruitment Pipeline</h2>
        <div className="text-sm text-gray-600">
          Total Applications: <span className="font-bold text-lg">{applications.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-full">
          {STAGES.map((stage) => {
            const stageApps = getApplicationsByStage(stage);
            return (
              <div key={stage} className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">
                    {stage === 'Interview1' ? 'Interview 1' :
                     stage === 'Interview2' ? 'Interview 2' :
                     stage === 'Interview3' ? 'Interview 3' : stage}
                  </h3>
                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        stage === 'Hired' ? 'bg-green-100 border-l-4 border-green-500' :
                        stage === 'Rejected' ? 'bg-red-100 border-l-4 border-red-500' :
                        'bg-white border-l-4 border-blue-500'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">
                        {app.extracted_data?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{app.position_title}</p>
                      {app.groq_score && (
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-xs font-medium text-gray-700">
                            Score: {app.groq_score}%
                          </span>
                        </div>
                      )}

                      {stage !== 'Hired' && stage !== 'Rejected' && (
                        <div className="mt-3 flex gap-2">
                          {stage !== STAGES[STAGES.length - 2] ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStageIdx = STAGES.indexOf(stage) + 1;
                                if (nextStageIdx < STAGES.length) {
                                  handleMoveStage(app.id, STAGES[nextStageIdx]);
                                }
                              }}
                              className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                            >
                              <ArrowRight className="w-3 h-3 inline mr-1" />
                              Next
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedApp.extracted_data?.name} - {selectedApp.position_title}
            </h3>

            <div className="mb-6 p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Current Stage:</span> {selectedApp.status}
              </p>
              {selectedApp.groq_score && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold">AI Match Score:</span> {selectedApp.groq_score}%
                </p>
              )}
            </div>

            <form onSubmit={handleAddFeedback} className="space-y-4 mb-6">
              <h4 className="font-semibold text-gray-900">Add Interview Feedback</h4>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                  <select
                    value={feedbackForm.round}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, round: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value={1}>Round 1</option>
                    <option value={2}>Round 2</option>
                    <option value={3}>Round 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technical (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={feedbackForm.technical_score}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, technical_score: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Communication (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={feedbackForm.communication_score}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, communication_score: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={feedbackForm.notes}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, notes: e.target.value })}
                  placeholder="Interview notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Save Feedback
              </button>
            </form>

            <button
              onClick={() => setSelectedApp(null)}
              className="w-full bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
