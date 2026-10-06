const crypto = require("crypto");
const { promisify } = require("util");
const express = require("express");
const User = require("../models/user");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();
const scrypt = promisify(crypto.scrypt);
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, room: user.room };
}

async function createSession(user) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.sessions.push({ tokenHash, expiresAt: Date.now() + SESSION_DURATION });
  await user.save();
  return token;
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, room = "" } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Use a password with at least 8 characters." });
    }

    const salt = crypto.randomBytes(16);
    const derivedKey = await scrypt(password, salt, 64);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      room: room.trim(),
      passwordHash: `${salt.toString("hex")}:${derivedKey.toString("hex")}`,
    });
    const token = await createSession(user);
    res.status(201).json({ user: publicUser(user), token });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const [saltHex, hashHex] = user.passwordHash.split(":");
    const actual = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
    const expected = Buffer.from(hashHex, "hex");
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    const token = await createSession(user);
    res.json({ user: publicUser(user), token });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { name, room } = req.body;
    if (typeof name === "string" && name.trim()) req.user.name = name.trim();
    if (typeof room === "string") req.user.room = room.trim();
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  try {
    req.user.sessions = req.user.sessions.filter(
      (session) => session.tokenHash !== req.sessionTokenHash
    );
    await req.user.save();
    res.json({ message: "Signed out." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;