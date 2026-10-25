import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { v2 as cloudinary } from 'cloudinary';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import Delivery from '../models/Delivery.js';
import Payment from '../models/Payment.js';
import Settings from '../models/Settings.js';
import AuditLog from '../models/AuditLog.js';
import Counter from '../models/Counter.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

const COLLECTIONS = {
  users: User,
  farmers: Farmer,
  deliveries: Delivery,
  payments: Payment,
  settings: Settings,
  auditlogs: AuditLog,
  counters: Counter
};

export async function createBackup(type = 'manual', userId = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `producepay_backup_${timestamp}.json`;
  
  // Use OS temp dir so it works on Windows and Linux (Render)
  const tempPath = path.join(os.tmpdir(), filename);

  try {
    const dump = {};
    for (const [name, model] of Object.entries(COLLECTIONS)) {
      dump[name] = await model.find({}).lean();
    }

    // Pretty print JSON
    const jsonString = JSON.stringify(dump, null, 2);
    
    // Write plain JSON to temp file
    fs.writeFileSync(tempPath, jsonString, 'utf-8');
    const sizeBytes = fs.statSync(tempPath).size;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(tempPath, {
      resource_type: 'raw',
      public_id: `backups/${filename}`,
      overwrite: true
    });

    // Clean up temp file
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    return {
      success: true,
      filename,
      cloudinaryId: uploadResult.public_id,
      cloudinaryUrl: uploadResult.secure_url,
      sizeBytes
    };
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    logger.error({ err: error }, 'Backup failed');
    throw error;
  }
}

export async function restoreBackup(fileBuffer, userId) {
  // Parse the plain JSON buffer directly
  const jsonString = fileBuffer.toString('utf-8');
  const dump = JSON.parse(jsonString);

  for (const [name, model] of Object.entries(COLLECTIONS)) {
    if (dump[name] && Array.isArray(dump[name])) {
      await model.deleteMany({});
      
      // Prevent locking out the current admin
      if (name === 'users') {
        const currentUser = dump[name].find(
          u => u._id.toString() === userId.toString()
        );
        if (!currentUser) {
          const existingAdmin = await User.findById(userId);
          if (existingAdmin) dump[name].push(existingAdmin.toObject());
        }
      }

      if (dump[name].length > 0) {
        await model.insertMany(dump[name]);
      }
    }
  }
  return true;
}

export async function deleteCloudinaryFile(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (err) {
    logger.error({ err, publicId }, 'Failed to delete Cloudinary file');
  }
}