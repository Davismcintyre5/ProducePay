function kes(n) {
  return `KES ${Number(n || 0).toLocaleString('en-KE')}`;
}

function kg(n) {
  return `${Number(n || 0)}kg`;
}

function shortDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function prefix() {
  return 'ProducePay: ';
}

const smsTemplates = {
  deliveryRecorded: (d) =>
    `${prefix()}${kg(d.weightKg)} maize received. ${kes(d.totalKes)} due. Receipt ${d.receiptNo}. Asante.`,

  paymentPaid: (d) =>
    `${prefix()}${kes(d.amountKes)} sent via ${d.method}. Ref ${d.reference || 'N/A'}. Receipt ${d.receiptNo}.`,

  paymentFailed: (d) =>
    `${prefix()}Payment ${d.receiptNo} failed. ${kes(d.amountKes)} not sent. Reason: ${d.reason}. Contact office.`,

  farmerWelcome: (d) =>
    `${prefix()}Karibu ${d.farmerName}. You are registered as ${d.farmerCode} with ${d.orgName}. Keep this number.`,

  userWelcome: (d) =>
    `${prefix()}Welcome ${d.fullName}. Username ${d.username}. Login: ${d.loginUrl}`,

  passwordResetOtp: (d) =>
    `${prefix()}Your reset code is ${d.otpCode}. Expires in ${d.expiresInMinutes} minutes. Do not share.`,

  passwordChanged: (d) =>
    `${prefix()}Your password was changed on ${shortDate(d.changedAt)}. If this was not you, contact admin.`,

  weeklyReport: (d) =>
    `${prefix()}Week ${shortDate(d.weekFrom)}-${shortDate(d.weekTo)}: ${d.totalDeliveries} deliveries, ${kg(d.totalWeightKg)}, ${kes(d.totalPaymentsKes)} paid.`
};

export default smsTemplates;