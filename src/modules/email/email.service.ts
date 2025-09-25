import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly OAUTH_USER = process.env.EMAIL_USER || '';

  //Note: can still implement token cache
  private async getAccessToken(): Promise<string> {
    try {
      this.logger.log('Fetching access token from Google...');
      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground',
      );

      oAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      const accessTokenResponse = await oAuth2Client.getAccessToken();
      const accessToken = accessTokenResponse.token || '';

      if (!accessToken) {
        throw new Error('Empty access token received from Google');
      }

      return accessToken;
    } catch (error) {
      this.logger.error('Failed to retrieve access token:', error);
      throw new Error('Failed to retrieve access token');
    }
  }

  private async createTransporter(): Promise<nodemailer.Transporter> {
    try {
      const accessToken = await this.getAccessToken();

      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.OAUTH_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create transporter:', error);
      throw error;
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
    userName: string,
  ): Promise<void> {
    try {
      const transporter = await this.createTransporter();

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const htmlContent = this.getVerificationEmailTemplate(
        userName,
        verificationUrl,
      );

      const mailOptions = {
        from: `"Bright Social" <${this.OAUTH_USER}>`,
        to: email,
        subject: '🎉 Welcome to Bright Social - Verify Your Email',
        html: htmlContent,
      };

      const result = await transporter.sendMail(mailOptions);
      this.logger.log(
        `✅ Verification email sent to ${email}. MessageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to send verification email to ${email}:`,
        error,
      );
      throw new Error('Failed to send verification email');
    }
  }

  private getVerificationEmailTemplate(
    userName: string,
    verificationUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Bright Social</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Bright Social!</h1>
          </div>
          <div class="content">
            <h2>Hi ${userName}!</h2>
            <p>Thank you for joining Bright Social! We're excited to have you as part of our community.</p>
            <p>To complete your registration and start connecting with friends, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify My Email</a>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <p>If you didn't create an account with Bright Social, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 Bright Social. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<void> {
    try {
      const transporter = await this.createTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎊 Welcome to Bright Social, ${userName}!</h2>
          <p>Your email has been successfully verified. You can now:</p>
          <ul>
            <li>Connect with friends and family</li>
            <li>Share posts and stories</li>
            <li>Discover amazing content</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL}/login" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Exploring</a></p>
        </div>
      `;

      const result = await transporter.sendMail({
        from: `"Bright Social" <${this.OAUTH_USER}>`,
        to: email,
        subject: '🎊 Welcome to Bright Social!',
        html: htmlContent,
      });

      this.logger.log(
        `✅ Welcome email sent to ${email}. MessageId: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to send welcome email to ${email}:`, error);
    }
  }
}
