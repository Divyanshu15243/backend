const neftPaymentEmailBody = ({ name, amount, neftNumber, date }) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 30px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: #10b981; padding: 28px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; }
    .neft-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .neft-box p { margin: 0; font-size: 13px; color: #6b7280; }
    .neft-number { font-size: 18px; font-weight: bold; color: #1d4ed8; letter-spacing: 1px; margin-top: 6px; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; }
    p { color: #374151; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>💰 Referral Payment Credited</h1></div>
    <div class="body">
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your referral commission has been successfully transferred to your bank account.</p>
      <div class="amount-box">
        <p style="margin:0;color:#6b7280;font-size:13px;">Amount Credited</p>
        <div class="amount">₹${parseFloat(amount).toFixed(2)}</div>
        <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">Date: ${date}</p>
      </div>
      <div class="neft-box">
        <p>NEFT / Transaction Reference Number</p>
        <div class="neft-number">${neftNumber}</div>
      </div>
      <p>Use this reference number to verify the transaction with your bank. Amount should reflect within <strong>2 working hours</strong>.</p>
      <p>Thank you for being a valued member of <strong>N23 Gujarati Basket</strong>!</p>
    </div>
    <div class="footer">N23 Gujarati Basket &mdash; Surat, Gujarat</div>
  </div>
</body>
</html>`;
};

module.exports = neftPaymentEmailBody;
