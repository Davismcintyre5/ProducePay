import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import Backup from '../models/Backup.js';
import { createBackup, restoreBackup, deleteCloudinaryFile } from '../services/backupService.js';
import { sendEmail } from '../services/emailService.js';

export const list = asyncHandler(async (req, res) => {
  const backups = await Backup.find().sort({ createdAt: -1 });
  res.status(200).json(ApiResponse.success({ backups }));
});

export const create = asyncHandler(async (req, res) => {
  const result = await createBackup('manual', req.user._id);
  
  const backup = await Backup.create({
    filename: result.filename,
    cloudinaryId: result.cloudinaryId,
    cloudinaryUrl: result.cloudinaryUrl,
    sizeBytes: result.sizeBytes,
    type: 'manual',
    createdBy: req.user._id
  });

  res.status(201).json(ApiResponse.success({ backup }));
});

export const restore = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }
  
  if (!req.file.originalname.endsWith('.json')) {
    throw ApiError.badRequest('File must be a .json backup');
  }
  
  await restoreBackup(req.file.buffer, req.user._id);
  
  res.status(200).json(ApiResponse.success({ message: 'Database restored successfully' }));
});

export const remove = asyncHandler(async (req, res) => {
  const backup = await Backup.findById(req.params.id);
  if (!backup) throw ApiError.notFound('Backup not found');

  await deleteCloudinaryFile(backup.cloudinaryId);
  await Backup.findByIdAndDelete(req.params.id);

  res.status(200).json(ApiResponse.success({ deleted: true }));
});

export const sendToEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest('Email is required');

  const backup = await Backup.findById(req.params.id);
  if (!backup) throw ApiError.notFound('Backup not found');

  const sizeMb = (backup.sizeBytes / 1024 / 1024).toFixed(2);

  await sendEmail({
    to: email,
    subject: `ProducePay Database Backup - ${backup.filename}`,
    htmlBody: `
      <h2>ProducePay Backup</h2>
      <p>Here is the backup you requested.</p>
      <ul>
        <li><strong>File:</strong> ${backup.filename}</li>
        <li><strong>Size:</strong> ${sizeMb} MB</li>
        <li><strong>Date:</strong> ${new Date(backup.createdAt).toLocaleString('en-KE')}</li>
      </ul>
      <p><a href="${backup.cloudinaryUrl}" style="background:#2e7d32;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Download Backup</a></p>
    `,
    textBody: `Download your backup here: ${backup.cloudinaryUrl}`
  });

  res.status(200).json(ApiResponse.success({ sent: true }));
});