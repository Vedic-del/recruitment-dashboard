import fs from 'fs';
import path from 'path';
import { parseResume } from '../config/groq.js';

export async function extractResumeText(filePath: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);

    // For now, handle text files directly
    // In production, you'd use a PDF parsing library like pdf-parse
    if (filePath.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    if (filePath.endsWith('.pdf')) {
      // Simple text extraction from PDF (requires pdf-parse)
      // For MVP, we'll convert to text via Groq or use a simpler approach
      console.warn('PDF parsing requires additional setup. Using file path as fallback.');
      return `Resume file: ${filePath}`;
    }

    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Error extracting resume text:', error);
    throw new Error('Failed to extract resume text');
  }
}

export async function parseResumeFile(filePath: string): Promise<any> {
  try {
    const resumeText = await extractResumeText(filePath);
    const parsedData = await parseResume(resumeText);
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse resume');
  }
}

export async function saveUploadedFile(file: Express.Multer.File): Promise<string> {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, file.buffer);
  return filePath;
}
