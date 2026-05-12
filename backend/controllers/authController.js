const { signAdminToken } = require("../middleware/auth");

exports.login = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res
      .status(500)
      .json({ message: "إعدادات المسؤول غير مكتملة على الخادم" });
  }

  const emailOk =
    String(email).trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordOk = String(password) === String(adminPassword);

  if (!emailOk || !passwordOk) {
    return res
      .status(401)
      .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const token = signAdminToken();
  return res.json({
    token,
    user: { email: adminEmail, role: "admin" },
  });
};

exports.me = (req, res) => {
  return res.json({
    user: { email: process.env.ADMIN_EMAIL, role: "admin" },
  });
};
