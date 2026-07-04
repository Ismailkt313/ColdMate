import nodemailer from "nodemailer";

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT || "2525", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "dummy_smtp_user",
      pass: process.env.SMTP_PASS || "dummy_smtp_password",
    },
  });

  private static readonly FROM_EMAIL = process.env.EMAIL_FROM || "noreply@coldmate.com";
  private static readonly FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  static async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f9fafb;
            color: #1f2937;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 540px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          }
          .logo {
            text-align: center;
            margin-bottom: 24px;
          }
          .logo-text {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.04em;
            color: #000000;
          }
          h1 {
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            color: #111827;
            text-align: center;
            margin-bottom: 16px;
          }
          p {
            font-size: 14px;
            line-height: 22px;
            color: #4b5563;
            margin-bottom: 20px;
          }
          .btn-container {
            text-align: center;
            margin: 28px 0;
          }
          .btn {
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 6px;
            display: inline-block;
          }
          .disclaimer {
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 16px;
            margin-top: 24px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="logo-text">ColdMate</span>
          </div>
          <h1>Reset your password</h1>
          <p>We received a request to reset the password for your ColdMate account. Click the button below to proceed with setting a new password.</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </div>
          <p>This password reset link is valid for <strong>15 minutes</strong> and can only be used once.</p>
          <p>If you did not request a password reset, you can safely ignore this email. Your password will remain secure.</p>
          <div class="disclaimer">
            <p style="margin: 0;">This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: `"ColdMate" <${this.FROM_EMAIL}>`,
      to: email,
      subject: "Reset Your ColdMate Password",
      html: htmlContent,
    });
  }
}
