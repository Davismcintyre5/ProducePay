import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import Farmer from '../models/Farmer.js';
import Counter from '../models/Counter.js';
import AuditLog from '../models/AuditLog.js';
import Settings from '../models/Settings.js';
import emailTemplates from '../templates/emailTemplates.js';
import smsTemplates from '../templates/smsTemplates.js';
import { sendEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';
import {
  buildYearCode,
  currentYear,
  getPagination,
  escapeRegex,
  roundKes
} from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const q = escapeRegex((req.query.q || '').trim());

  const filter = {};
  if (req.query.farmerId) filter.farmer = req.query.farmerId;
  if (req.query.from || req.query.to) {
    filter.collectedAt = {};
    if (req.query.from) filter.collectedAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.collectedAt.$lte = new Date(req.query.to);
  }
  if (q) {
    filter.$or = [
      { code: { $regex: q, $options: 'i' } },
      { 'farmerSnapshot.name': { $regex: q, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Delivery.find(filter).sort({ collectedAt: -1 }).skip(skip).limit(limit),
    Delivery.countDocuments(filter)
  ]);

  res.status(200).json(ApiResponse.paginated(items, { page, limit, total }));
});

export const get = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw ApiError.notFound('Delivery not found');

  const payment = await Payment.findOne({ delivery: delivery._id });

  res.status(200).json(ApiResponse.success({ delivery, payment }));
});

export const create = asyncHandler(async (req, res) => {
  const { farmerId, weightKg, collectedAt, clientRequestId, notes } = req.body;

  if (clientRequestId) {
    const existing = await Delivery.findOne({ clientRequestId });
    if (existing) {
      const payment = await Payment.findOne({ delivery: existing._id });
      return res
        .status(200)
        .json(ApiResponse.success({ delivery: existing, payment, duplicate: true }));
    }
  }

  const farmer = await Farmer.findById(farmerId);
  if (!farmer || !farmer.active) throw ApiError.badRequest('Farmer not found or inactive');

  const settings = await Settings.getGlobal();
  const rate = settings.business?.ratePerKg ?? Number(process.env.DEFAULT_RATE_PER_KG || 50);
  const total = roundKes(weightKg * rate);

  const year = currentYear();
  const deliverySeq = await Counter.next(`delivery:${year}`);
  const receiptSeq = await Counter.next(`receipt:${year}`);

  const deliveryCode = buildYearCode('D', deliverySeq, year, 4);
  const receiptNo = buildYearCode('R', receiptSeq, year, 6);

  let delivery;
  try {
    delivery = await Delivery.create({
      code: deliveryCode,
      farmer: farmer._id,
      farmerSnapshot: {
        code: farmer.code,
        name: farmer.name,
        phone: farmer.phone,
        location: farmer.location
      },
      weightKg,
      ratePerKg: rate,
      totalKes: total,
      collectedAt: collectedAt ? new Date(collectedAt) : new Date(),
      recordedBy: req.user._id,
      clientRequestId,
      notes
    });
  } catch (err) {
    throw ApiError.internal(`Failed to create delivery: ${err.message}`);
  }

  let payment;
  try {
    payment = await Payment.create({
      receiptNo,
      delivery: delivery._id,
      farmer: farmer._id,
      farmerSnapshot: {
        code: farmer.code,
        name: farmer.name,
        phone: farmer.phone,
        email: farmer.email,
        weightKg,
        ratePerKg: rate
      },
      amountKes: total,
      status: 'PENDING'
    });
  } catch (err) {
    await Delivery.findByIdAndDelete(delivery._id);
    throw ApiError.internal(`Failed to create payment: ${err.message}`);
  }

  await AuditLog.record({
    user: req.user._id,
    action: 'CREATE',
    entity: 'Delivery',
    entityId: delivery._id,
    after: { delivery: delivery.toJSON(), payment: payment.toJSON() },
    ip: req.ip
  });

  if (settings.notifications?.notifyFarmerOnDelivery !== false) {
    const data = {
      farmerName: farmer.name,
      weightKg,
      ratePerKg: rate,
      totalKes: total,
      receiptNo: payment.receiptNo,
      collectedAt: delivery.collectedAt
    };

    const email = emailTemplates.deliveryRecorded(data);
    const sms = smsTemplates.deliveryRecorded(data);

    Promise.allSettled([
      sendEmail({
        to: farmer.email,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody
      }),
      sendSms({ to: farmer.phone, content: sms })
    ]);
  }

  res.status(201).json(ApiResponse.success({ delivery, payment }));
});

export const update = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw ApiError.notFound('Delivery not found');

  const payment = await Payment.findOne({ delivery: delivery._id });
  if (payment && payment.status === 'PAID') {
    throw ApiError.badRequest('Cannot edit a paid delivery');
  }

  const before = delivery.toJSON();

  if (req.body.weightKg !== undefined) {
    delivery.weightKg = req.body.weightKg;
    delivery.totalKes = roundKes(req.body.weightKg * delivery.ratePerKg);
    if (payment) {
      payment.amountKes = delivery.totalKes;
      payment.farmerSnapshot.weightKg = delivery.weightKg;
      await payment.save();
    }
  }
  if (req.body.collectedAt !== undefined) delivery.collectedAt = new Date(req.body.collectedAt);
  if (req.body.notes !== undefined) delivery.notes = req.body.notes;

  await delivery.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'Delivery',
    entityId: delivery._id,
    before,
    after: delivery.toJSON(),
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ delivery, payment }));
});

export const softDelete = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw ApiError.notFound('Delivery not found');

  const payment = await Payment.findOne({ delivery: delivery._id });
  if (payment && payment.status === 'PAID') {
    throw ApiError.badRequest('Cannot delete a paid delivery');
  }

  delivery.deletedAt = new Date();
  await delivery.save();

  if (payment && payment.status === 'PENDING') {
    payment.status = 'CANCELLED';
    await payment.save();
  }

  await AuditLog.record({
    user: req.user._id,
    action: 'DELETE',
    entity: 'Delivery',
    entityId: delivery._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ deleted: true }));
});

export default { list, get, create, update, softDelete };