const Customer = require("../../models/Customer");

// Generate unique 8-character referral code
const generateUniqueReferralCode = async () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code;
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    const existing = await Customer.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }

  return code;
};

// Validate referral code and return referrer
const validateReferralCode = async (code) => {
  if (!code) return null;
  
  const referrer = await Customer.findOne({ referralCode: code });
  return referrer;
};

module.exports = {
  generateUniqueReferralCode,
  validateReferralCode,
};
