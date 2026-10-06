const crypto = require("crypto");
const User = require("../models/user");

module.exports = async function requireAuth(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      sessions: { $elemMatch: { tokenHash, expiresAt: { $gt: new Date() } } },
    });

    if (!user) {
      return res.status(401).json({ message: "Your session has expired. Sign in again." });
    }

    req.user = user;
    req.sessionTokenHash = tokenHash;
    next();
  } catch (error) {
    next(error);
  }
};