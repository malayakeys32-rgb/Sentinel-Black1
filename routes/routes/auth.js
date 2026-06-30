const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "sentinelblacksecret";

const USERS = {
  "admin": "password123",
  "operator": "nightwatch"
};

router.post("/login", (req, res) => {
  const { user, pass } = req.body;

  if (!USERS[user] || USERS[user] !== pass) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ user }, SECRET, { expiresIn: "2h" });

  res.json({ token });
});

module.exports = router;
