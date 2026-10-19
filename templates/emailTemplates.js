function kes(n) {
  return `KES ${Number(n || 0).toLocaleString('en-KE')}`;
}

function kg(n) {
  return `${Number(n || 0)}kg`;
}

function shortDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function layout({ title, body }) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#2c3e50;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1b5e20;color:#ffffff;padding:20px;text-align:center;">
              <div style="font-size:20px;font-weight:bold;">ProducePay</div>
              <div style="font-size:12px;opacity:0.9;margin-top:4px;">MOIBEN Maize Management</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="background:#f4f6f9;color:#888;padding:16px;text-align:center;font-size:11px;">
              MOIBEN Maize Produce Collection &amp; Marketing
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:#666;font-size:13px;">${label}</td>
    <td style="padding:8px 0;text-align:right;font-size:13px;">${value}</td>
  </tr>`;
}

function button(label, url) {
  return `<p style="text-align:center;margin:24px 0;">
    <a href="${url}" style="background:#2e7d32;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;">${label}</a>
  </p>`;
}

const emailTemplates = {
  deliveryRecorded: (d) => ({
    subject: `Delivery Receipt ${d.receiptNo} - ${kg(d.weightKg)} Maize`,
    htmlBody: layout({
      title: `Receipt ${d.receiptNo}`,
      body: `
        <p style="font-size:14px;">Dear <strong>${d.farmerName}</strong>,</p>
        <p style="font-size:14px;">Your delivery has been recorded.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Receipt No', `<strong>${d.receiptNo}</strong>`)}
          ${row('Date', shortDate(d.collectedAt))}
          ${row('Weight', kg(d.weightKg))}
          ${row('Rate', `${kes(d.ratePerKg)}/kg`)}
          <tr>
            <td style="padding:10px 0;border-top:2px solid #1b5e20;font-weight:bold;">Total</td>
            <td style="padding:10px 0;border-top:2px solid #1b5e20;text-align:right;font-weight:bold;color:#1b5e20;font-size:16px;">${kes(d.totalKes)}</td>
          </tr>
        </table>
        ${d.verifyUrl ? button('Verify Receipt', d.verifyUrl) : ''}
        <p style="font-size:13px;color:#888;">Thank you for your delivery.</p>
      `
    }),
    textBody: `Delivery recorded. ${kg(d.weightKg)} @ ${kes(d.ratePerKg)}/kg = ${kes(d.totalKes)}. Receipt: ${d.receiptNo}.`
  }),

  paymentPaid: (d) => ({
    subject: `Payment Confirmed - ${kes(d.amountKes)} (${d.receiptNo})`,
    htmlBody: layout({
      title: `Payment ${d.receiptNo}`,
      body: `
        <p style="font-size:14px;">Dear <strong>${d.farmerName}</strong>,</p>
        <p style="font-size:14px;">Your payment has been sent.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Receipt No', `<strong>${d.receiptNo}</strong>`)}
          ${row('Amount', `<strong>${kes(d.amountKes)}</strong>`)}
          ${row('Method', d.method)}
          ${row('Reference', d.reference || 'N/A')}
          ${row('Paid On', shortDate(d.paidAt))}
        </table>
        <p style="font-size:13px;color:#888;">Thank you.</p>
      `
    }),
    textBody: `Payment confirmed. ${kes(d.amountKes)} via ${d.method}. Ref: ${d.reference || 'N/A'}. Receipt: ${d.receiptNo}.`
  }),

  paymentFailed: (d) => ({
    subject: `Payment Failed - ${d.receiptNo}`,
    htmlBody: layout({
      title: `Payment Failed ${d.receiptNo}`,
      body: `
        <p style="font-size:14px;">Dear <strong>${d.farmerName}</strong>,</p>
        <p style="font-size:14px;">Your payment could not be completed.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Receipt No', `<strong>${d.receiptNo}</strong>`)}
          ${row('Amount', kes(d.amountKes))}
          ${row('Reason', d.reason || 'Unknown')}
        </table>
        <p style="font-size:13px;color:#888;">Please contact the office for assistance.</p>
      `
    }),
    textBody: `Payment ${d.receiptNo} failed. ${kes(d.amountKes)} not sent. Reason: ${d.reason}.`
  }),

  farmerWelcome: (d) => ({
    subject: `Karibu ProducePay - ${d.farmerName}`,
    htmlBody: layout({
      title: 'Welcome',
      body: `
        <p style="font-size:14px;">Dear <strong>${d.farmerName}</strong>,</p>
        <p style="font-size:14px;">You have been registered with ${d.orgName} on ProducePay.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Farmer Code', `<strong>${d.farmerCode}</strong>`)}
          ${row('Organisation', d.orgName)}
        </table>
        <p style="font-size:13px;color:#888;">You will receive a confirmation each time you deliver maize.</p>
      `
    }),
    textBody: `Karibu ${d.farmerName}. Registered as ${d.farmerCode} with ${d.orgName}.`
  }),

  userWelcome: (d) => ({
    subject: `Welcome to ProducePay - ${d.fullName}`,
    htmlBody: layout({
      title: 'Welcome',
      body: `
        <p style="font-size:14px;">Hi <strong>${d.fullName}</strong>,</p>
        <p style="font-size:14px;">Your ProducePay account has been created.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Username', `<strong>${d.username}</strong>`)}
          ${row('Role', d.role)}
        </table>
        ${button('Log In', d.loginUrl)}
        <p style="font-size:13px;color:#888;">For security, please change your password after first login.</p>
      `
    }),
    textBody: `Welcome ${d.fullName}. Username: ${d.username}. Login: ${d.loginUrl}`
  }),

  passwordResetOtp: (d) => ({
    subject: 'Your ProducePay password reset code',
    htmlBody: layout({
      title: 'Password Reset',
      body: `
        <p style="font-size:14px;">Hi <strong>${d.fullName}</strong>,</p>
        <p style="font-size:14px;">Use the code below to reset your password.</p>
        <p style="text-align:center;font-size:28px;font-weight:bold;letter-spacing:6px;color:#1b5e20;margin:24px 0;">${d.otpCode}</p>
        <p style="font-size:13px;color:#888;text-align:center;">Expires in ${d.expiresInMinutes} minutes. Do not share this code.</p>
      `
    }),
    textBody: `Your reset code is ${d.otpCode}. Expires in ${d.expiresInMinutes} minutes.`
  }),

  passwordChanged: (d) => ({
    subject: 'Your ProducePay password was changed',
    htmlBody: layout({
      title: 'Password Changed',
      body: `
        <p style="font-size:14px;">Hi <strong>${d.fullName}</strong>,</p>
        <p style="font-size:14px;">Your password was changed on ${shortDate(d.changedAt)}.</p>
        <p style="font-size:13px;color:#888;">If this was not you, contact your administrator immediately.</p>
      `
    }),
    textBody: `Your password was changed on ${shortDate(d.changedAt)}. If this was not you, contact admin.`
  }),

  weeklyReport: (d) => ({
    subject: `ProducePay Weekly Report - ${shortDate(d.weekFrom)} to ${shortDate(d.weekTo)}`,
    htmlBody: layout({
      title: 'Weekly Report',
      body: `
        <p style="font-size:14px;">Weekly summary for the period ${shortDate(d.weekFrom)} to ${shortDate(d.weekTo)}.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${row('Deliveries', d.totalDeliveries)}
          ${row('Total Weight', kg(d.totalWeightKg))}
          ${row('Payments', kes(d.totalPaymentsKes))}
          ${row('Outstanding', `${d.outstandingCount} (${kes(d.outstandingKes)})`)}
        </table>
        ${d.topFarmers && d.topFarmers.length ? `
          <p style="font-size:13px;font-weight:bold;color:#1b5e20;margin-top:16px;">Top Farmers</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${d.topFarmers.map((f, i) => row(`${i + 1}. ${f.name}`, kg(f.weightKg))).join('')}
          </table>
        ` : ''}
      `
    }),
    textBody: `Weekly report ${shortDate(d.weekFrom)} to ${shortDate(d.weekTo)}: ${d.totalDeliveries} deliveries, ${kg(d.totalWeightKg)}, ${kes(d.totalPaymentsKes)} paid.`
  })
};

export default emailTemplates;