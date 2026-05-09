import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `Jansamadhan <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: 
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export const sendOTP = async (email, otp) => {
  const message = `Your verification code for Jansamadhan is: ${otp}. It will expire in 10 minutes.`;
  await sendEmail({
    email,
    subject: 'Verification Code - Jansamadhan',
    message,
  });
};
