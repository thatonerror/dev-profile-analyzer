// server/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Use App Password, not regular password
  }
});

// Send verification email to employer
const sendVerificationEmail = async (employerEmail, candidateName, chatLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: employerEmail,
      subject: `Background Verification Request for ${candidateName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Background Verification Request</h2>
          <p>Hello,</p>
          <p>You have been listed as a reference by <strong>${candidateName}</strong> for background verification.</p>
          <p>Please join the verification chat room to provide feedback:</p>
          <div style="margin: 30px 0;">
            <a href="${chatLink}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Join Verification Chat
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This is an automated email. Please do not reply to this message.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Developer Profile Analyzer - Background Verification System
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send notification to candidate
const sendCandidateNotification = async (candidateEmail, candidateName, chatLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: candidateEmail,
      subject: 'Your Background Verification is Being Processed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Verification Initiated</h2>
          <p>Hi ${candidateName},</p>
          <p>Your background verification process has been initiated. We've contacted your previous employer/faculty.</p>
          <p>You can track the verification progress here:</p>
          <div style="margin: 30px 0;">
            <a href="${chatLink}" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Verification Chat
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Candidate email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendCandidateNotification
};