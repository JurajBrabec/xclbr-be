import { createTransport } from 'nodemailer';
import { readConfig } from './config';

const config = readConfig('./config.ini');
const SMTP_FROM = 'mailer@xclbr.com';

const transporter = createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.password,
  },
});

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
    });
    console.log('Email sent successfully. ID =', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
