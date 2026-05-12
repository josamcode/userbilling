const jwt = require("jsonwebtoken");

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function signAdminToken() {
  return jwt.sign({ role: "admin" }, getSecret(), { expiresIn: "7d" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "غير مصرح" });
  }
  try {
    const payload = jwt.verify(token, getSecret());
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "جلسة غير صالحة" });
  }
}

module.exports = { requireAuth, signAdminToken };
