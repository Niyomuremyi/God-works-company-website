const jwt = require("jsonwebtoken");

// Rejects the request if there's no valid token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
console.log("req.user",req.user)
console.log("token",token)
  try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log("Decoded:", decoded);

  req.user = decoded;

  console.log("req.user after verify:", req.user);

  next();
} catch (err) {
  console.error(err);
  return res.status(401).json({ error: err.message });
}
}

// Attaches req.user if a valid token is present, but never blocks the request —
// use this on guest-friendly routes like checkout
function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return next();

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // expired/invalid token on a guest route — treat as guest rather than failing
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };