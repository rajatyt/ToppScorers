import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transporter based on environment variables
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const service = process.env.EMAIL_SERVICE;

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass }
    });
  }

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  return null;
};

/**
 * Generate responsive branded HTML email template for Password Reset
 */
const getPasswordResetHtml = ({ userName, resetUrl, clientUrl }) => {
  const safeName = userName ? userName.split(' ')[0] : 'Learner';
  const logoUrl = `${clientUrl || 'http://localhost:5173'}/logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your ToppScorers Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f17;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #111827;
      border: 1px solid #1f293d;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .header {
      background: linear-gradient(135deg, #090d16 0%, #161e2e 100%);
      padding: 36px 30px;
      text-align: center;
      border-bottom: 1px solid #1f293d;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 12px 0 4px 0;
    }
    .brand-highlight {
      color: #f59e0b;
    }
    .content {
      padding: 36px 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 14px;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0;
    }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #090d16 !important;
      font-weight: 800;
      font-size: 15px;
      padding: 14px 34px;
      text-decoration: none;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
      letter-spacing: 0.3px;
    }
    .token-box {
      background: #1e293b;
      border: 1px dashed #334155;
      border-radius: 10px;
      padding: 12px 16px;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 18px;
    }
    .footer {
      background: #090d16;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
    .security-notice {
      background: rgba(245, 158, 11, 0.08);
      border-left: 3px solid #f59e0b;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 24px 0;
      font-size: 13px;
      color: #fbbf24;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="brand-title">Topp<span class="brand-highlight">Scorers</span></div>
      <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Premier EdTech & Home Tutors Network</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ${safeName},</div>
      <p>We received a request to reset the password for your ToppScorers account.</p>
      
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-btn" target="_blank" rel="noopener noreferrer">Reset Your Password</a>
      </div>

      <div class="security-notice">
        <strong>Important:</strong> This password reset link is valid for <strong>15 minutes</strong> and can only be used once.
      </div>

      <p style="font-size: 13px; color: #94a3b8;">
        If the button above doesn't work, copy and paste this secure link directly into your browser:
      </p>
      <div class="token-box">
        <a href="${resetUrl}" style="color: #38bdf8; text-decoration: none;">${resetUrl}</a>
      </div>

      <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
        If you did not request this password reset, you can safely ignore this email. Your account remains completely secure.
      </p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ToppScorers. All rights reserved.</p>
      <p style="margin-top: 4px;">Prayagraj, Uttar Pradesh, India</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Dispatch password reset email or fallback to developer console logger
 */
export const sendPasswordResetEmail = async ({ toEmail, userName, resetUrl, clientUrl }) => {
  const transporter = getTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"ToppScorers Security" <security@toppscorers.com>';

  const subject = 'Reset Your ToppScorers Password';
  const textBody = `Hi ${userName || 'Learner'},

We received a request to reset your password on ToppScorers.

Please use the following link within 15 minutes to reset your password:
${resetUrl}

If you did not request this password reset, please ignore this email.

— The ToppScorers Team
Prayagraj, UP, India
`;

  const htmlBody = getPasswordResetHtml({ userName, resetUrl, clientUrl });

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[EmailService] Password reset email sent to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, delivered: true, messageId: info.messageId };
    } catch (err) {
      console.error('[EmailService] SMTP sendMail failed:', err.message);
      // Fallback to dev log below if delivery failed
    }
  }

  // Fallback dev mode logger: Print reset link clearly to console
  console.log('\n======================================================');
  console.log('🔑 [PASSWORD RESET URL GENERATED]');
  console.log(`   Recipient : ${toEmail}`);
  console.log(`   Reset URL : ${resetUrl}`);
  console.log('   Expires in: 15 minutes');
  console.log('======================================================\n');

  return {
    success: true,
    delivered: false,
    devMode: true,
    resetUrl
  };
};
