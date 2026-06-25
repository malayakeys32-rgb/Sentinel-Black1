// Sentinel Black — Unified Backend
// Render-deployable. In-memory store (swap db.* arrays for a real DB in production).

const express = require("express");
const cors    = require("cors");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");
const { v4: uuid } = require("uuid");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "sentinel-black-dev-secret";
const PORT       = process.env.PORT || 4000;

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── ROOT ROUTE ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Sentinel-Black API is running");
});

// ── IN-MEMORY DATABASE ──────────────────────────────────────────────────────
const db = {
  users:     [],
  cases:     [],
  operations:[],
  evidence:  [],
  timeline:  [],
  audit:     [],
};

// ── SEED DATA ───────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();

db.users.push({
  id: uuid(), name: "Director",
  email: "malayatechgirl@gmail.com",
  password_hash: bcrypt.hashSync("mississippiippissossim", 10),
  role: "DIRECTOR", created_at: now(),
});

const caseA = {
  id: uuid(), title: "OPERATION LAZARUS BLEED", status: "OPEN", priority: "CRITICAL",
  summary: "Unexplained asset liquidation traced to shell network in Eastern Europe.",
  tags: ["financial","covert"], linked_operation_ids: [],
  created_at: now(), updated_at: now(),
};
const caseB = {
  id: uuid(), title: "SIGNAL INTERCEPT — HANDLER 7", status: "OPEN", priority: "HIGH",
  summary: "Encrypted burst transmissions on compromised relay frequency.",
  tags: ["signals","comms"], linked_operation_ids: [],
  created_at: now(), updated_at: now(),
};
db.cases.push(caseA, caseB);

const opA = {
  id: uuid(), codename: "IRON COMPASS", status: "ACTIVE", priority: "HIGH", risk: "HIGH",
  objective: "Neutralize surveillance network embedded in allied infrastructure.",
  scope: "Eastern Europe", theater: "Cyber/HUMINT", case_ids: [],
  created_at: now(), updated_at: now(),
};
db.operations.push(opA);
db.operations.push({
  id: uuid(), codename: "SILENT MERIDIAN", status: "PLANNING", priority: "MEDIUM", risk: "MEDIUM",
  objective: "Establish forward listening post in target theater.",
  scope: "Central Asia", theater: "SIGINT", case_ids: [],
  created_at: now(), updated_at: now(),
});

db.evidence.push(
  { id: uuid(), case_id: caseA.id, operation_id: null, type: "SIGINT",
    source: "NSA Relay Alpha", classification: "TOP SECRET", ingested_at: now() },
  { id: uuid(), case_id: null, operation_id: opA.id, type: "HUMINT",
    source: "Asset CARDINAL", classification: "SECRET", ingested_at: now() }
);

// ── HELPERS ─────────────────────────────────────────────────────────────────
function addTimeline({ caseId, operationId, type, actor, payload = {} }) {
  const ev = {
    id: uuid(), case_id: caseId || null, operation_id: operationId || null,
    type, actor, timestamp: now(), payload,
  };
  db.timeline.unshift(ev);
  return ev;
}

function addAudit(actor, action, target) {
  db.audit.unshift({ id: uuid(), actor, action, target, timestamp: now() });
}

// ── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── AUTH ROUTES ──────────────────────────────────────────────────────────────
app.post("/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    if (!user.password_hash) {
      return res.status(500).json({ error: "User account configuration error" });
    }
    
    // Compare password with hash
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET, { expiresIn: "8h" }
    );
    const { password_hash, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Authentication error: " + err.message });
  }
});

app.post("/auth/logout", requireAuth, (req, res) => {
  res.json({ message: "Logged out" });
});

app.get("/users/me", requireAuth, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { password_hash, ...safe } = user;
  res.json(safe);
});

// ── CASES ────────────────────────────────────────────────────────────────────
app.get("/cases", requireAuth, (req, res) => res.json(db.cases));

app.post("/cases", requireAuth, (req, res) => {
  const { title, priority = "MEDIUM", summary = "", tags = [] } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  const c = {
    id: uuid(), title, status: "OPEN", priority, summary, tags,
    linked_operation_ids: [], created_at: now(), updated_at: now(),
  };
  db.cases.unshift(c);
  addTimeline({ caseId: c.id, type: "case_created", actor: req.user.name, payload: { title } });
  addAudit(req.user.name, "CREATE_CASE", title);
  res.status(201).json(c);
});

app.get("/cases/:id", requireAuth, (req, res) => {
  const c = db.cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const ops = db.operations.filter(o => c.linked_operation_ids.includes(o.id));
  res.json({ case: c, linked_operations: ops });
});

app.patch("/cases/:id", requireAuth, (req, res) => {
  const c = db.cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const { status, priority, summary, tags } = req.body;
  if (status   !== undefined) c.status   = status;
  if (priority !== undefined) c.priority = priority;
  if (summary  !== undefined) c.summary  = summary;
  if (tags     !== undefined) c.tags     = tags;
  c.updated_at = now();
  addTimeline({ caseId: c.id, type: "case_updated", actor: req.user.name, payload: { status, priority } });
  addAudit(req.user.name, "UPDATE_CASE", c.title);
  res.json(c);
});

app.post("/cases/:id/link-operation", requireAuth, (req, res) => {
  const c  = db.cases.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Case not found" });
  const op = db.operations.find(o => o.id === req.body.operation_id);
  if (!op) return res.status(404).json({ error: "Operation not found" });
  if (!c.linked_operation_ids.includes(op.id)) c.linked_operation_ids.push(op.id);
  if (!op.case_ids.includes(c.id))             op.case_ids.push(c.id);
  addTimeline({ caseId: c.id, operationId: op.id, type: "case_operation_linked", actor: req.user.name });
  addAudit(req.user.name, "LINK_CASE_OP", `${c.title} ↔ ${op.codename}`);
  res.json({ case: c, operation: op });
});

// ── OPERATIONS ───────────────────────────────────────────────────────────────
app.get("/operations", requireAuth, (req, res) => res.json(db.operations));

app.post("/operations", requireAuth, (req, res) => {
  const { codename, priority = "MEDIUM", risk = "MEDIUM",
          objective = "", scope = "", theater = "", case_ids = [] } = req.body;
  if (!codename) return res.status(400).json({ error: "Codename is required" });

  const op = {
    id: uuid(), codename, status: "PLANNING", priority, risk,
    objective, scope, theater, case_ids,
    created_at: now(), updated_at: now(),
  };
  db.operations.unshift(op);
  case_ids.forEach(cid => {
    const c = db.cases.find(x => x.id === cid);
    if (c && !c.linked_operation_ids.includes(op.id)) c.linked_operation_ids.push(op.id);
  });
  addTimeline({ operationId: op.id, type: "operation_created", actor: req.user.name, payload: { codename } });
  addAudit(req.user.name, "CREATE_OPERATION", codename);
  res.status(201).json(op);
});

app.get("/operations/:id", requireAuth, (req, res) => {
  const op = db.operations.find(x => x.id === req.params.id);
  if (!op) return res.status(404).json({ error: "Operation not found" });
  const cases = db.cases.filter(c => op.case_ids.includes(c.id));
  res.json({ operation: op, linked_cases: cases });
});

app.patch("/operations/:id", requireAuth, (req, res) => {
  const op = db.operations.find(x => x.id === req.params.id);
  if (!op) return res.status(404).json({ error: "Operation not found" });
  const { status, priority, risk, objective, scope, theater } = req.body;
  if (status    !== undefined) op.status    = status;
  if (priority  !== undefined) op.priority  = priority;
  if (risk      !== undefined) op.risk      = risk;
  if (objective !== undefined) op.objective = objective;
  if (scope     !== undefined) op.scope     = scope;
  if (theater   !== undefined) op.theater   = theater;
  op.updated_at = now();
  addTimeline({ operationId: op.id, type: "operation_updated", actor: req.user.name, payload: { status, priority } });
  addAudit(req.user.name, "UPDATE_OPERATION", op.codename);
  res.json(op);
});

// ── EVIDENCE ─────────────────────────────────────────────────────────────────
app.get("/evidence", requireAuth, (req, res) => {
  const { case_id, operation_id } = req.query;
  let results = db.evidence;
  if (case_id)      results = results.filter(e => e.case_id      === case_id);
  if (operation_id) results = results.filter(e => e.operation_id === operation_id);
  res.json(results);
});

app.post("/evidence", requireAuth, (req, res) => {
  const { case_id, operation_id, type, source, classification = "CONFIDENTIAL" } = req.body;
  if (!type || !source) return res.status(400).json({ error: "type and source are required" });
  const ev = {
    id: uuid(), case_id: case_id || null, operation_id: operation_id || null,
    type, source, classification, ingested_at: now(),
  };
  db.evidence.unshift(ev);
  addTimeline({ caseId: case_id, operationId: operation_id,
    type: "evidence_added", actor: req.user.name, payload: { type, source } });
  addAudit(req.user.name, "ADD_EVIDENCE", `${type} from ${source}`);
  res.status(201).json(ev);
});

// ── TIMELINE ─────────────────────────────────────────────────────────────────
app.get("/timeline", requireAuth, (req, res) => {
  const { case_id, operation_id, type } = req.query;
  let events = db.timeline;
  if (case_id)      events = events.filter(e => e.case_id      === case_id);
  if (operation_id) events = events.filter(e => e.operation_id === operation_id);
  if (type)         events = events.filter(e => e.type         === type);
  res.json(events);
});

// ── AUDIT ────────────────────────────────────────────────────────────────────
app.get("/audit", requireAuth, (req, res) => res.json(db.audit));

// ── HEALTH ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({
  status: "ok",
  cases:      db.cases.length,
  operations: db.operations.length,
  evidence:   db.evidence.length,
  timeline:   db.timeline.length,
  users:      db.users.length,
}));

// ── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Sentinel Black backend running on port ${PORT}`));
