require('dotenv').config();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPViaSMS = async (phoneNumber) => {
  try {
    const otp = generateOTP();
    const message = `Your Urban Company OTP is ${otp}. Valid for 10 minutes.`;

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender_id: process.env.FAST2SMS_SENDER_ID || "FSTSMS",
        message: message,
        route: "q",  // Quick route (Transactional)
        numbers: phoneNumber  // 10-digit Indian number
      })
    });

    const data = await response.json();
    
    console.log(`Fast2SMS Response:`, data);
    
    if (data.return === true) {
      return {
        success: true,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };
    } else {
      return {
        success: false,
        error: data.message || 'Fast2SMS API failed',
      };
    }
  } catch (error) {
    console.error('❌ Fast2SMS Error:', error.message);
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
