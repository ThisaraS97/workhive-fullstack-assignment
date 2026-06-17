import { parentPort, workerData } from 'worker_threads';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

async function parseResume() {
  const { applicationId, resumePath } = workerData as {
    applicationId: string;
    resumePath: string;
  };

  const absolutePath = path.isAbsolute(resumePath)
    ? resumePath
    : path.join(process.cwd(), resumePath.replace(/^\//, ''));

  let text = '';

  try {
    const buffer = await fs.readFile(absolutePath);
    const parsed = await pdfParse(buffer);
    text = parsed.text.trim();
  } catch {
    text = '[Resume text could not be extracted — file may be missing in seed data]';
  }

  const parsedDir = path.join(process.cwd(), 'uploads', 'parsed');
  await fs.mkdir(parsedDir, { recursive: true });
  const parsedFile = path.join(parsedDir, `${applicationId}.txt`);
  await fs.writeFile(parsedFile, text, 'utf-8');

  console.log(`[ResumeParserWorker] Parsed resume for application ${applicationId}`);

  parentPort?.postMessage({ success: true, applicationId, parsedText: text.slice(0, 5000) });
}

parseResume().catch((err) => {
  console.error('[ResumeParserWorker] Failed:', err.message);
  parentPort?.postMessage({ success: false, error: err.message });
});
