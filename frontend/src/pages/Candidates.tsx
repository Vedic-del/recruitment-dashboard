import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, User, Mail, Phone, Briefcase } from 'lucide-react';

export default function CandidatesPage({ apiUrl }: { apiUrl: string }) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/candidates`);
      setCandidates(res.data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      await axios.post(`${apiUrl}/api/candidates/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchCandidates();
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading candidates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidates</h2>

        <div className="mb-8 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer">
            <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            <p className="text-sm text-gray-500 mt-1">PDF, DOC, or TXT files</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {uploading && <p className="text-sm text-gray-500 mt-4">Uploading and parsing resume...</p>}
        </div>

        {candidates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No candidates yet. Upload a resume to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {candidate.extracted_data?.name || 'Unknown Candidate'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidate.extracted_data?.years_experience || 0} years experience
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    candidate.status === 'New' ? 'bg-blue-100 text-blue-800' :
                    candidate.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                    candidate.status === 'Archived' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {candidate.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {candidate.extracted_data?.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{candidate.extracted_data.email}</span>
                    </div>
                  )}
                  {candidate.extracted_data?.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{candidate.extracted_data.phone}</span>
                    </div>
                  )}
                  {candidate.extracted_data?.past_salary && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>Past: {candidate.extracted_data.past_salary}</span>
                    </div>
                  )}
                  {candidate.extracted_data?.expected_salary && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4" />
                      <span>Expected: {candidate.extracted_data.expected_salary}</span>
                    </div>
                  )}
                </div>

                {candidate.extracted_data?.skills && candidate.extracted_data.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {candidate.extracted_data.skills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                      {candidate.extracted_data.skills.length > 5 && (
                        <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-xs">
                          +{candidate.extracted_data.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedCandidate.extracted_data?.name || 'Candidate Details'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedCandidate.extracted_data?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="text-gray-900">{selectedCandidate.extracted_data?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                <p className="text-gray-900">{selectedCandidate.extracted_data?.years_experience || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Notice Period</label>
                <p className="text-gray-900">{selectedCandidate.extracted_data?.notice_period || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCandidate.extracted_data?.skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedCandidate(null)}
              className="bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
