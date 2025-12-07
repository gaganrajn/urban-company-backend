const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPViaSMS = async (phoneNumber) => {
  try {
    const otp = generateOTP();
    
    const message = await client.messages.create({
      body: `Your Urban Company OTP is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNumber}`,
    });

    console.log(`✅ OTP sent successfully. SID: ${message.sid}`);
    
    return {
      success: true,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const sendOTPViaEmail = async (email) => {
  try {
    const otp = generateOTP();
    return {
      success: true,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
  } catch (error) {
    console.error('❌ Error sending OTP via email:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

const verifyOTP = (storedOTP, enteredOTP, expiresAt) => {
  if (Date.now() > expiresAt) {
    return { success: false, message: 'OTP has expired' };
  }

  if (storedOTP === enteredOTP) {
    return { success: true, message: 'OTP verified successfully' };
  }

  return { success: false, message: 'Invalid OTP' };
};

module.exports = {
  generateOTP,
  sendOTPViaSMS,
  sendOTPViaEmail,
  verifyOTP,
};
