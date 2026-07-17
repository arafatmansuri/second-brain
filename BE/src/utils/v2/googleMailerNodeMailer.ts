import nodemailer from "nodemailer";
import { gmailOAuth2Client as oauth2Client } from "../../config/OAuth2Client";
export async function sendMail({
  to,
  subject,
  user,
  otp,
}: {
  to: string;
  subject: string;
  user: string;
  otp: number;
}) {
  try {
    const htmlBody = `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>OTP Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
              }
              .container {
                  max-width: 600px;
                  background: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0px 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                  background: #0073e6;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  font-size: 20px;
                  border-radius: 8px 8px 0 0;
              }
              .content {
                  padding: 20px;
                  color: #333333;
                  line-height: 1.6;
                  text-align: center;
              }
              .otp {
                  font-size: 24px;
                  font-weight: bold;
                  background: #f8f9fa;
                  display: inline-block;
                  padding: 10px 20px;
                  border-radius: 5px;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #777777;
                  padding: 10px;
                  border-top: 1px solid #ddd;
              }
              .button {
                  display: inline-block;
                  background: #0073e6;
                  color: white;
                  text-align: center;
                  padding: 10px 20px;
                  border-radius: 5px;
                  text-decoration: none;
                  font-weight: bold;
              }
              @media (max-width: 600px) {
                  .container {
                      width: 100%;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">OTP Verification</div>
              <div class="content">
                  <p>Hello ${user},</p>
                  <p>Your One-Time Password (OTP) for verification is:</p>
                  <div class="otp">${otp}</div>
                  <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
              </div>
              <div class="footer">© ${new Date().getFullYear()} Second Brain | All Rights Reserved</div>
          </div>
        </body>
        </html>
  `;
    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });
    const accessToken = await oauth2Client.getAccessToken();
    const client_id = process.env.GOOGLE_GMAIL_CLIENT_ID || "";
    const client_secret = process.env.GOOGLE_GMAIL_CLIENT_SECRET || "";
    const refresh_token = process.env.GMAIL_REFRESH_TOKEN || "";
    // Create Nodemailer transporter using OAuth2
    const googleTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "mansuriarafat302@gmail.com",
        accessToken: accessToken.token!,
        clientId: client_id,
        clientSecret: client_secret,
        refreshToken: refresh_token,
        
      },
    });

    // Send email with custom sender name
    const info = await googleTransporter.sendMail({
      from: `"Second Brain" <secondbrain.services@gmail.com>`, // Change display name here
      to: to,
      subject: subject,
      html: htmlBody,
    });
    console.log("Message sent:", info);
  } catch (err) {
    console.log("Error sending email:", err);
  }
}
