import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Farmer from '../models/Farmer.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import Counter from '../models/Counter.js';
import AuditLog from '../models/AuditLog.js';
import { buildCode, getPagination, escapeRegex, normalizePhone, currentYear } from '../utils/helpers.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const q = escapeRegex((req.query.q || '').trim());
  const active = req.query.active !== 'false';

  const filter = { active };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
  }

  const [items, total] = await Promise.all([
    Farmer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Farmer.countDocuments(filter)
  ]);

  res.status(200).json(ApiResponse.paginated(items, { page, limit, total }));
});

export const get = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) throw ApiError.notFound('Farmer not found');
  res.status(200).json(ApiResponse.success({ farmer }));
});

export const create = asyncHandler(async (req, res) => {
  const { name, phone, email, idNumber, location, farmSizeAcres, notes } = req.body;

  const normalized = normalizePhone(phone);
  if (!normalized) throw ApiError.badRequest('Invalid phone number');

  const exists = await Farmer.findOne({ phone: normalized });
  if (exists) throw ApiError.conflict('A farmer with this phone already exists');

  const seq = await Counter.next('farmer');
  const code = buildCode('F', seq, 3);

  const farmer = await Farmer.create({
    code,
    name,
    phone: normalized,
    email: email || undefined,
    idNumber: idNumber || undefined,
    location,
    farmSizeAcres,
    notes,
    createdBy: req.user._id
  });

  await AuditLog.record({
    user: req.user._id,
    action: 'CREATE',
    entity: 'Farmer',
    entityId: farmer._id,
    after: farmer.toJSON(),
    ip: req.ip
  });

  res.status(201).json(ApiResponse.success({ farmer }));
});

export const update = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) throw ApiError.notFound('Farmer not found');

  const before = farmer.toJSON();
  const allowed = ['name', 'email', 'idNumber', 'location', 'farmSizeAcres', 'notes'];

  for (const key of allowed) {
    if (req.body[key] !== undefined) farmer[key] = req.body[key];
  }

  if (req.body.phone !== undefined) {
    const normalized = normalizePhone(req.body.phone);
    if (!normalized) throw ApiError.badRequest('Invalid phone number');
    farmer.phone = normalized;
  }

  await farmer.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'Farmer',
    entityId: farmer._id,
    before,
    after: farmer.toJSON(),
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ farmer }));
});

export const softDelete = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) throw ApiError.notFound('Farmer not found');
  if (!farmer.active) throw ApiError.badRequest('Farmer already inactive');

  farmer.active = false;
  await farmer.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'DELETE',
    entity: 'Farmer',
    entityId: farmer._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ deactivated: true }));
});

export const statement = asyncHandler(async (req, res) => {
  const farmer = await Farmer.findById(req.params.id);
  if (!farmer) throw ApiError.notFound('Farmer not found');

  const [deliveries, payments] = await Promise.all([
    Delivery.find({ farmer: farmer._id }).sort({ collectedAt: -1 }).limit(200),
    Payment.find({ farmer: farmer._id }).sort({ createdAt: -1 }).limit(200)
  ]);

  const totalWeightKg = deliveries.reduce((s, d) => s + d.weightKg, 0);
  const totalPaidKes = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amountKes, 0);
  const outstandingKes = payments.filter((p) => p.status === 'PENDING').reduce((s, p) => s + p.amountKes, 0);

  res.status(200).json(ApiResponse.success({
    farmer,
    summary: { totalWeightKg, totalPaidKes, outstandingKes },
    deliveries,
    payments
  }));
});

export default { list, get, create, update, softDelete, statement };