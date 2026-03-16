import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer";
import { env } from "../config/env";

interface VerificationPayload {
  userId: string;
  email: string;
}

export async function sendVerificationEmail(userId: string, email: string) {
  // Generate verification token (expires in 24 hours)
  const token = jwt.sign(
    { userId, email } as VerificationPayload,
    env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  // Create verification URL
  const verificationUrl = `${env.FRONTEND_URL}/register/verify-email?token=${token}`;

  // Send email
  await sendMail({
    to: email,
    subject: "Verify your email address - VideoJobs",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <!-- Main Container -->
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header with Gradient -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      VideoJobs
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                      Your professional job platform
                    </p>
                  </td>
                </tr>

                <!-- Content Section -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 28px; font-weight: 600; text-align: center;">
                      Welcome to VideoJobs! 🎉
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Thank you for signing up to our platform. We're excited to have you with us.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      To start using all the features of VideoJobs, you need to verify your email address by clicking the button below:
                    </p>

                    <!-- Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); transition: all 0.3s ease;">
                            Verify my email address
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="margin: 40px 0; border-top: 1px solid #e5e7eb;"></div>

                    <!-- Alternative Link Section -->
                    <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      If the button doesn't work, copy and paste the following link into your browser:
                    </p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
                      <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all; line-height: 1.5;">
                        ${verificationUrl}
                      </p>
                    </div>

                    <!-- Info Box -->
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin-top: 30px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                        ⏰ <strong>Important:</strong> This link will expire in 24 hours for security reasons.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                      If you didn't create an account on VideoJobs, you can safely ignore this email.
                    </p>
                    
                    <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} VideoJobs. All rights reserved.
                    </p>
                    
                    <div style="margin-top: 20px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                        This is an automated email, please do not reply to this message.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

export async function verifyEmailToken(token: string) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as VerificationPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired verification token");
  }
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  // Token expira en 1 hora
  const token = jwt.sign(
    { userId, email } as VerificationPayload,
    env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset your password - VideoJobs",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                      VideoJobs
                    </h1>
                    <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 400;">
                      Your professional job platform
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 50px 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 28px; font-weight: 600; text-align: center;">
                      Reset your password 🔐
                    </h2>
                    
                    <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      We received a request to reset the password for your VideoJobs account.
                    </p>
                    
                    <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                      Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
                    </p>

                    <!-- Button -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 20px 0;">
                          <a href="${resetUrl}" 
                             style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                            Reset my password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin: 40px 0; border-top: 1px solid #e5e7eb;"></div>

                    <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-bottom: 30px;">
                      <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all; line-height: 1.5;">
                        ${resetUrl}
                      </p>
                    </div>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin-top: 30px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                        ⚠️ <strong>Important:</strong> If you didn't request a password reset, you can safely ignore this email. Your password will not change.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.6; text-align: center;">
                      This link expires in 1 hour for security reasons.
                    </p>
                    <p style="margin: 15px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} VideoJobs. All rights reserved.
                    </p>
                    <div style="margin-top: 20px; text-align: center;">
                      <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                        This is an automated email, please do not reply to this message.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}
