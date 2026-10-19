import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/token.js';
import {
  hashPassword,
  comparePassword,
  generateOtp,
  hashOtp,
  compareOtp
} from '../utils/password.js';
import env from '../config/env.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendEmail } from '../services/emailService.js';
import { sendSms } from '../services/smsService.js';
import emailTemplates from '../templates/emailTemplates.js';
import smsTemplates from '../templates/smsTemplates.js';

const REFRESH_COOKIE = 'pp_refresh';
const OTP_EXPIRES_MIN = 10;
const OTP_MAX_ATTEMPTS = 5;

const COOKIE_PATHS_TO_CLEAR = ['/', '/api/v1/auth'];

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

function clearAllRefreshCookies(res) {
  for (const path of COOKIE_PATHS_TO_CLEAR) {
    res.clearCookie(REFRESH_COOKIE, {
      path,
      sameSite: 'lax',
      httpOnly: true,
      secure: env.NODE_ENV === 'production'
    });
  }
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email).select('+passwordHash');
  if (!user || !user.active) throw ApiError.unauthorized('Invalid credentials');

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const tokens = generateTokenPair(user);

  user.lastLoginAt = new Date();
  await user.save();

  await AuditLog.record({
    user: user._id,
    action: 'LOGIN',
    entity: 'User',
    entityId: user._id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  clearAllRefreshCookies(res);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);

  res.status(200).json(
    ApiResponse.success({ user, accessToken: tokens.accessToken })
  );
});

export const refresh = asyncHandler(async (req, res) => {
  let token = req.cookies?.[REFRESH_COOKIE];

  // Fallback for mobile apps sending the token via the Cookie header
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/pp_refresh=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) throw ApiError.unauthorized();

  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub).select('+active');
  if (!user || !user.active) throw ApiError.unauthorized();

  const tokens = generateTokenPair(user);

  clearAllRefreshCookies(res);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, cookieOptions);

  res.status(200).json(ApiResponse.success({ accessToken: tokens.accessToken }));
});

export const logout = asyncHandler(async (req, res) => {
  clearAllRefreshCookies(res);

  await AuditLog.record({
    user: req.user?._id,
    action: 'LOGOUT',
    entity: 'User',
    entityId: req.user?._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ loggedOut: true }));
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json(ApiResponse.success({ user: req.user }));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user) throw ApiError.unauthorized();

  const ok = await comparePassword(oldPassword, user.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect');

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();

  const data = { fullName: user.fullName, changedAt: new Date() };
  const email = emailTemplates.passwordChanged(data);
  const sms = smsTemplates.passwordChanged(data);

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: email.subject,
      htmlBody: email.htmlBody,
      textBody: email.textBody
    }),
    sendSms({ to: user.phone, content: sms })
  ]);

  await AuditLog.record({
    user: user._id,
    action: 'UPDATE',
    entity: 'User',
    entityId: user._id,
    ip: req.ip
  });

  res.status(200).json(ApiResponse.success({ changed: true }));
});

export const requestReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findByEmail(email);

  if (!user || !user.active) {
    return res.status(200).json(ApiResponse.success({ sent: true }));
  }

  const code = generateOtp({ length: 6 });
  user.otp = {
    hash: hashOtp(code),
    expiresAt: new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000),
    attempts: 0
  };
  await user.save();

  const data = {
    fullName: user.fullName,
    otpCode: code,
    expiresInMinutes: OTP_EXPIRES_MIN
  };
  const emailTpl = emailTemplates.passwordResetOtp(data);
  const sms = smsTemplates.passwordResetOtp(data);

  await Promise.allSettled([
    sendEmail({
      to: user.email,
      subject: emailTpl.subject,
      htmlBody: emailTpl.htmlBody,
      textBody: emailTpl.textBody
    }),
    sendSms({ to: user.phone, content: sms })
  ]);

  res.status(200).json(ApiResponse.success({ sent: true }));
});

export const verifyReset = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findByEmail(email).select('+otp +passwordHash');

  if (!user || !user.otp?.hash) {
    throw ApiError.badRequest('Invalid or expired code');
  }
  if (user.otp.expiresAt < new Date()) throw ApiError.badRequest('Code expired');
  if (user.otp.attempts >= OTP_MAX_ATTEMPTS) throw ApiError.tooMany('Too many attempts');

  const ok = compareOtp(otp, user.otp.hash);
  if (!ok) {
    user.otp.attempts += 1;
    await user.save();
    throw ApiError.badRequest('Invalid code');
  }

  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  user.otp = undefined;
  await user.save();

  res.status(200).json(ApiResponse.success({ reset: true }));
});

export default {
  login,
  refresh,
  logout,
  me,
  changePassword,
  requestReset,
  verifyReset
};