import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { hashPassword } from '../utils/password.js';
import { getPagination, normalizePhone } from '../utils/helpers.js';
import emailTemplates from '../templates/emailTemplates.js';
import smsTemplates from '../templates/smsTemplates.js';
import { sendEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.active !== 'all') filter.active = req.query.active !== 'false';

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);

  res.status(200).json(ApiResponse.paginated(items, { page, limit, total }));
});

export const get = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  res.status(200).json(ApiResponse.success({ user }));
});

export const create = asyncHandler(async (req, res) => {
  const { username, password, fullName, phone, email, role } = req.body;

  const normalized = normalizePhone(phone);
  if (!normalized) throw ApiError.badRequest('Invalid phone number');

  const exists = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
  if (exists) throw ApiError.conflict('Username or email already exists');

  const user = await User.create({
    username,
    passwordHash: await hashPassword(password),
    fullName,
    phone: normalized,
    email,
    role
  });

  await AuditLog.record({
    user: req.user._id,
    action: 'CREATE',
    entity: 'User',
    entityId: user._id,
    after: user.toJSON(),
    ip: req.ip
  });

  const data = { fullName, username, role, loginUrl: `${req.protocol}://${req.get('host')}/login` };
  const emailTpl = emailTemplates.userWelcome(data);
  const sms = smsTemplates.userWelcome(data);

  Promise.allSettled([
    sendEmail({ to: email, subject: emailTpl.subject, htmlBody: emailTpl.htmlBody, textBody: emailTpl.textBody }),
    sendSms({ to: normalized, content: sms })
  ]);

  res.status(201).json(ApiResponse.success({ user }));
});

export const update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  const before = user.toJSON();

  if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
  if (req.body.email !== undefined) user.email = req.body.email;
  if (req.body.phone !== undefined) {
    const normalized = normalizePhone(req.body.phone);
    if (!normalized) throw ApiError.badRequest('Invalid phone number');
    user.phone = normalized;
  }
  if (req.body.role !== undefined) {
    if (String(user._id) === String(req.user._id)) throw ApiError.badRequest('Cannot change your own role');
    user.role = req.body.role;
  }

  await user.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    before,
    after: user.toJSON(),
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ user }));
});

export const deactivate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (String(user._id) === String(req.user._id)) throw ApiError.badRequest('Cannot deactivate yourself');
  if (user.role === 'ADMIN') {
    const admins = await User.countDocuments({ role: 'ADMIN', active: true });
    if (admins <= 1) throw ApiError.badRequest('Cannot deactivate the last admin');
  }

  user.active = false;
  await user.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'DELETE',
    entity: 'User',
    entityId: user._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ deactivated: true }));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  const user = await User.findById(req.params.id).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ reset: true }));
});

export default { list, get, create, update, deactivate, resetPassword };