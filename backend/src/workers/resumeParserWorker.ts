import { Worker } from 'worker_threads';
import path from 'path';
import { ApplicationRepository } from '../repositories';

interface ResumeParserPayload {
  applicationId: string;
  resumePath: string;
}

const applicationRepo = new ApplicationRepository();

function getWorkerPath(name: string): string {
  const ext = __filename.endsWith('.ts') ? 'ts' : 'js';
  return path.join(__dirname, `${name}.worker.${ext}`);
}

export function spawnResumeParserWorker(payload: ResumeParserPayload): void {
  const worker = new Worker(getWorkerPath('resumeParser'), {
    workerData: payload,
    execArgv: __filename.endsWith('.ts') ? ['-r', 'tsx/cjs'] : [],
  });

  worker.on('message', async (msg: { success: boolean; parsedText?: string }) => {
    if (msg.success && msg.parsedText) {
      await applicationRepo.updateParsedResume(payload.applicationId, msg.parsedText);
    }
  });

  worker.on('error', (err) => console.error('[ResumeParserWorker] Error:', err.message));
  worker.on('exit', (code) => {
    if (code !== 0) console.error(`[ResumeParserWorker] exited with code ${code}`);
  });
}
