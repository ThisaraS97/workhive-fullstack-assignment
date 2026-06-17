import { Worker } from 'worker_threads';
import path from 'path';
import { config } from '../config';

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
}

function getWorkerPath(name: string): string {
  const ext = __filename.endsWith('.ts') ? 'ts' : 'js';
  return path.join(__dirname, `${name}.worker.${ext}`);
}

export function spawnEmailWorker(payload: EmailPayload): void {
  const worker = new Worker(getWorkerPath('email'), {
    workerData: {
      ...payload,
      smtp: config.smtp,
    },
    execArgv: __filename.endsWith('.ts') ? ['-r', 'tsx/cjs'] : [],
  });

  worker.on('error', (err) => console.error('[EmailWorker] Error:', err.message));
  worker.on('exit', (code) => {
    if (code !== 0) console.error(`[EmailWorker] exited with code ${code}`);
  });
}
