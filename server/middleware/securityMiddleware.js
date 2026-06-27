const sanitizeString = (str, keepHtml = false) => {
  if (typeof str !== 'string') return str;
  
  // Always strip script tags and dangerous event handlers
  let sanitized = str.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/javascript:[^\s"']+/gi, '');

  if (!keepHtml) {
    // Strip all HTML tags
    sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '');
  }
  return sanitized.trim();
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        const keepHtml = key === 'content' || key === 'comment';
        obj[key] = sanitizeString(obj[key], keepHtml);
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

// XSS Protection Middleware
const xssClean = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

// Password Strength Validation Middleware
const validatePasswordStrength = (req, res, next) => {
  const { password, newPassword } = req.body;
  const pwd = password || newPassword;
  
  if (pwd !== undefined) {
    if (pwd.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    const hasNum = /\d/.test(pwd);
    if (!hasNum) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number'
      });
    }
  }
  next();
};

// Centralized Request Logger
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
};

module.exports = {
  xssClean,
  validatePasswordStrength,
  requestLogger
};
