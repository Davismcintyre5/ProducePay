import Settings from '../../models/Settings.js';

export default async function attachSettings(req, res, next) {
  try {
    req.settings = await Settings.getGlobal();
  } catch {
    req.settings = null;
  }
  next();
}