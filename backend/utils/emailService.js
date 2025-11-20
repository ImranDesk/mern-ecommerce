const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file.');
    }

    transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const verifyEmailConfig = async () => {
  try {
    const trans = getTransporter();
    await trans.verify();
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

const sendOTPEmail = async (email, otp) => {
  try {
    const trans = getTransporter();
    await verifyEmailConfig();

    const mailOptions = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: 'Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `,
    };

    await trans.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    // Provide specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file.');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error('Email service connection error. Please try again later.');
    } else if (error.responseCode === 535) {
      throw new Error('Email authentication failed. For Gmail, please use an App Password instead of your regular password.');
    }
    
    throw new Error(error.message || 'Error sending email. Please try again later.');
  }
};

module.exports = {
  getTransporter,
  verifyEmailConfig,
  sendOTPEmail,
};

