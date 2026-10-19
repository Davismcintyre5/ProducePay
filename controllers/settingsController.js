import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';

const EDITABLE_GROUPS = ['organisation', 'business', 'notifications', 'receipts'];

export const get = asyncHandler(async (req, res) => {
  const settings = await Settings.getGlobal();
  res.status(200).json(ApiResponse.success({ settings }));
});

export const update = asyncHandler(async (req, res) => {
  const settings = await Settings.getGlobal();
  const before = settings.toJSON();
  const body = req.body || {};

  for (const group of EDITABLE_GROUPS) {
    if (!body[group] || typeof body[group] !== 'object') continue;

    for (const [key, value] of Object.entries(body[group])) {
      if (settings[group] && key in settings[group]) {
        settings[group][key] = value;
      }
    }
  }

  settings.updatedBy = req.user._id;
  await settings.save();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'Settings',
    entityId: settings._id,
    before,
    after: settings.toJSON(),
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ settings }));
});

export const reset = asyncHandler(async (req, res) => {
  if (req.user.role !== 'ADMIN') throw ApiError.forbidden();

  const settings = await Settings.getGlobal();
  const before = settings.toJSON();

  for (const group of EDITABLE_GROUPS) {
    settings.set(group, {});
  }
  settings.markModified('organisation');
  settings.markModified('business');
  settings.markModified('notifications');
  settings.markModified('receipts');

  await settings.save();
  await Settings.deleteOne({ _id: 'global' });
  const fresh = await Settings.getGlobal();

  await AuditLog.record({
    user: req.user._id,
    action: 'UPDATE',
    entity: 'Settings',
    entityId: settings._id,
    before,
    after: fresh.toJSON(),
    meta: { reset: true },
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ settings: fresh }));
});

export default { get, update, reset };