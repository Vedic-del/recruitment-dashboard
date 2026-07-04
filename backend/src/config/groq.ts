import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateJobDescription(
  title: string,
  department: string,
  level: string,
  skills: string[]
): Promise<string> {
  const skillsList = skills.join(', ');
  const prompt = `Generate a professional job description for the following role:
Title: ${title}
Department: ${department}
Level: ${level}
Required Skills: ${skillsList}

Create a comprehensive JD with the following sections:
- Role Overview
- Key Responsibilities
- Required Skills and Experience
- Nice to Have
- Benefits and Compensation
- Application Instructions

Keep it professional and concise (max 500 words).`;

  const response = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
  });

  return response.choices[0]?.message?.content || '';
}

export async function parseResume(resumeText: string): Promise<any> {
  const prompt = `Extract the following information from this resume in JSON format:
{
  "name": "Full name",
  "email": "Email address",
  "phone": "Phone number",
  "skills": ["skill1", "skill2"],
  "experience": "Brief summary of experience",
  "location": "Location",
  "years_experience": "Number of years",
  "past_salary": "Salary if mentioned",
  "expected_salary": "Expected salary if mentioned",
  "notice_period": "Notice period if mentioned"
}

Resume:
${resumeText}

Return only valid JSON, no additional text.`;

  const response = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
  });

  try {
    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing resume JSON:', error);
    return {};
  }
}

export async function scoreCandidateMatch(
  candidateData: any,
  jobDescription: string,
  positionTitle: string
): Promise<number> {
  const prompt = `Score how well this candidate matches the job description on a scale of 0-100.

Job Title: ${positionTitle}
Job Description:
${jobDescription}

Candidate Profile:
Name: ${candidateData.name}
Skills: ${candidateData.skills?.join(', ') || 'Not specified'}
Experience: ${candidateData.experience}
Years of Experience: ${candidateData.years_experience}

Provide ONLY a number between 0-100, nothing else.`;

  const response = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
  });

  try {
    const score = parseInt(response.choices[0]?.message?.content || '0');
    return Math.min(100, Math.max(0, score));
  } catch (error) {
    console.error('Error parsing score:', error);
    return 0;
  }
}

export async function findSimilarRoles(
  candidateData: any,
  openPositions: any[]
): Promise<string[]> {
  const positionsStr = openPositions
    .map((p) => `- ${p.title} (${p.department}): ${p.generated_jd}`)
    .join('\n');

  const prompt = `Given this candidate profile and the following open positions, identify which positions would be a good fit:

Candidate:
Name: ${candidateData.name}
Skills: ${candidateData.skills?.join(', ') || 'Not specified'}
Experience: ${candidateData.experience}
Years of Experience: ${candidateData.years_experience}

Open Positions:
${positionsStr}

Return ONLY the position IDs/titles as a JSON array of strings that match. Example: ["Senior Developer", "Tech Lead"]
If no matches, return an empty array: []`;

  const response = await groqClient.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'mixtral-8x7b-32768',
  });

  try {
    const content = response.choices[0]?.message?.content || '[]';
    return JSON.parse(content);
  } catch (error) {
    console.error('Error parsing similar roles:', error);
    return [];
  }
}
