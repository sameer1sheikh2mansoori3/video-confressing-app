import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from server/ or project root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('❌ SMTP FAIL:', err.message);
    console.error('   Code:', err.code);
  } else {
    console.log('✅ SMTP ready — Gmail connected');
  }
});

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"Video App" <${smtpUser}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;