import { parentPort, workerData } from 'worker_threads';
import nodemailer from 'nodemailer';

async function sendEmail() {
  const { to, subject, text, smtp } = workerData as {
    to: string;
    subject: string;
    text: string;
    smtp: { host?: string; port: number; user?: string; pass?: string; from: string };
  };

  let transporter;

  if (smtp.host && smtp.user && smtp.pass) {
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }

  const info = await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    text,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log(`[EmailWorker] Sent to ${to}${previewUrl ? ` — preview: ${previewUrl}` : ''}`);

  parentPort?.postMessage({ success: true, previewUrl });
}

sendEmail().catch((err) => {
  console.error('[EmailWorker] Failed:', err.message);
  parentPort?.postMessage({ success: false, error: err.message });
});
