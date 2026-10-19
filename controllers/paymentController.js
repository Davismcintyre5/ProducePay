import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';
import Settings from '../models/Settings.js';
import emailTemplates from '../templates/emailTemplates.js';
import smsTemplates from '../templates/smsTemplates.js';
import { sendEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';
import { generateReceiptPdf } from '../utils/pdf.js';
import { getPagination, escapeRegex } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.farmerId) filter.farmer = req.query.farmerId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  if (req.query.q) {
    const q = escapeRegex(req.query.q.trim());
    filter.$or = [
      { receiptNo: { $regex: q, $options: 'i' } },
      { 'farmerSnapshot.name': { $regex: q, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate({ path: 'delivery', select: 'code weightKg ratePerKg collectedAt' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter)
  ]);

  res.status(200).json(ApiResponse.paginated(items, { page, limit, total }));
});

export const get = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate({
    path: 'delivery',
    select: 'code weightKg ratePerKg collectedAt farmerSnapshot'
  });

  if (!payment) throw ApiError.notFound('Payment not found');

  res.status(200).json(ApiResponse.success({ payment }));
});

export const markPaid = asyncHandler(async (req, res) => {
  const { method, reference } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status === 'PAID') throw ApiError.badRequest('Payment already marked as paid');

  payment.markPaid({ method, reference, paidBy: req.user._id });
  await payment.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'PAYOUT',
    entity: 'Payment',
    entityId: payment._id,
    after: { method, reference },
    ip: req.ip
  });

  const settings = await Settings.getGlobal();

  if (settings.notifications?.notifyFarmerOnPayment !== false) {
    const data = {
      farmerName: payment.farmerSnapshot.name,
      amountKes: payment.amountKes,
      method: payment.method,
      reference: payment.reference,
      receiptNo: payment.receiptNo,
      paidAt: payment.paidAt
    };

    const email = emailTemplates.paymentPaid(data);
    const sms = smsTemplates.paymentPaid(data);

    Promise.allSettled([
      sendEmail({
        to: payment.farmerSnapshot.email,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody
      }),
      sendSms({ to: payment.farmerSnapshot.phone, content: sms })
    ]);
  }

  res.status(200).json(ApiResponse.success({ payment }));
});

export const cancel = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const payment = await Payment.findById(req.params.id);
  if (!payment) throw ApiError.notFound('Payment not found');
  if (payment.status === 'PAID') throw ApiError.badRequest('Cannot cancel a paid payment');
  if (payment.status === 'CANCELLED') throw ApiError.badRequest('Payment already cancelled');

  payment.status = 'CANCELLED';
  payment.failureReason = reason;
  await payment.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'Payment',
    entityId: payment._id,
    after: { status: 'CANCELLED', reason },
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ payment }));
});

export const receipt = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('delivery');
  if (!payment) throw ApiError.notFound('Payment not found');

  const settings = await Settings.getGlobal();
  const delivery = payment.delivery;

  const pdf = await generateReceiptPdf({
    receiptNo: payment.receiptNo,
    farmerName: payment.farmerSnapshot.name,
    farmerCode: payment.farmerSnapshot.code,
    phone: payment.farmerSnapshot.phone,
    weightKg: delivery?.weightKg ?? 0,
    ratePerKg: delivery?.ratePerKg ?? 0,
    totalKes: payment.amountKes,
    collectedAt: delivery?.collectedAt ?? payment.createdAt,
    paidAt: payment.paidAt,
    method: payment.method,
    reference: payment.reference,
    organisation: settings.organisation,
    footerNote: settings.receipts?.footerNote
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${payment.receiptNo}.pdf"`);
  res.send(pdf);
});

export default { list, get, markPaid, cancel, receipt };