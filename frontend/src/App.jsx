import { useState, useEffect, useCallback } from "react";
import { api } from "./api.js";

// ── DESIGN TOKENS ──────────────────────────────────────────────
const C = {
  bg: "#0A0C0F", surface: "#111318", mid: "#1A1E26", border: "#252A35",
  red: "#C0392B", amber: "#D4A017", teal: "#1A7A6E",
  muted: "#4A5568", dim: "#8A93A8", text: "#E8EAF0",
};

const STATUS_COLOR   = { OPEN:"#1A7A6E", CLOSED:"#4A5568", ACTIVE:"#C0392B", PLANNING:"#D4A017", COMPLETED:"#4A5568" };
const PRIORITY_COLOR = { CRITICAL:"#C0392B", HIGH:"#D4A017", MEDIUM:"#1A7A6E", LOW:"#4A5568" };
const RISK_COLOR     = { HIGH:"#C0392B", MEDIUM:"#D4A017", LOW:"#1A7A6E" };

const TIMELINE_LABELS = {
  case_created:"Case opened", case_updated:"Case updated",
  operation_created:"Operation created", operation_updated:"Operation updated",
  evidence_added:"Evidence ingested", case_operation_linked:"Case ↔ Operation linked",
};

const fmt = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
};

// ── SHARED UI ──────────────────────────────────────────────────
const Badge = ({ label, color }) => (
  <span style={{
    display:"inline-block", padding:"2px 8px", borderRadius:2, fontSize:10,
    fontFamily:"'JetBrains Mono',monospace", fontWeight:700, letterSpacing:"0.08em",
    color, border:`1px solid ${color}`, background:color+"18", whiteSpace:"nowrap",
  }}>{label}</span>
);

const Beacon = ({ active }) => (
  <span style={{
    display:"inline-block", width:8, height:8, borderRadius:"50%",
    background: active ? C.red : C.muted,
    boxShadow: active ? "0 0 0 3px rgba(192,57,43,0.25)" : "none",
    animation: active ? "pulse 2s infinite" : "none",
    flexShrink:0,
  }} />
);

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
    <div style={{ width:20, height:20, border:`2px solid ${C.border}`,
      borderTop:`2px solid ${C.red}`, borderRadius:"50%",
      animation:"spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const inputSt = {
  width:"100%", background:C.bg, border:`1px solid ${C.border}`, borderRadius:2,
  color:C.text, padding:"9px 12px", fontSize:12, fontFamily:"system-ui",
  marginBottom:12, transition:"border-color 0.15s",
};
const Lbl = ({ children }) => (
  <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace",
    fontSize:9, color:C.dim, letterSpacing:"0.15em", marginBottom:4 }}>{children}</label>
);
const BtnPrimary = ({ children, onClick, disabled, fullWidth, style={} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: disabled ? C.muted : C.red, color:"#fff", border:"none", borderRadius:2,
    padding:"9px 16px", fontFamily:"'JetBrains Mono',monospace", fontSize:11,
    letterSpacing:"0.1em", fontWeight:700, cursor: disabled ? "default" : "pointer",
    width: fullWidth ? "100%" : "auto", transition:"background 0.2s", ...style,
  }}>{children}</button>
);
const BtnGhost = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background:"none", border:`1px solid ${C.border}`, color:C.dim, borderRadius:2,
    padding:"8px 16px", fontSize:11, fontFamily:"'JetBrains Mono',monospace",
    letterSpacing:"0.08em", cursor:"pointer",
  }}>{children}</button>
);

// ── LOGIN ──────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const DEMO = [
    { email:"mercer@sentinel.black", password:"director001", role:"DIRECTOR" },
    { email:"chen@sentinel.black",   password:"analyst002",  role:"ANALYST"  },
    { email:"vance@sentinel.black",  password:"operator003", role:"OPERATOR" },
  ];

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      if (!email.trim()) {
        throw new Error("Email is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }
      
      const trimmedEmail = email.trim();
      const { token, user } = await api.login(trimmedEmail, password);
      
      if (!token) {
        throw new Error("No authentication token received");
      }
      if (!user) {
        throw new Error("No user data received");
      }
      
      localStorage.setItem("sb_token", token);
      onLogin(user);
    } catch (e) {
      console.error("Login error:", e);
      setError(e.message || "Access denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex",
      flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      {/* grid overlay */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none",
        backgroundImage:`linear-gradient(${C.red}08 1px,transparent 1px),linear-gradient(90deg,${C.red}08 1px,transparent 1px)`,
        backgroundSize:"40px 40px" }} />

      <div style={{ position:"relative", zIndex:1, width:"100%", maxWidth:400, animation:"fadeIn 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:52, height:52, background:C.surface, border:`1px solid ${C.border}`,
            borderRadius:4, marginBottom:14 }}>
            <div style={{ width:26, height:26, background:C.red,
              clipPath:"polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)" }} />
          </div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:16,
            letterSpacing:"0.2em" }}>SENTINEL<span style={{ color:C.red }}>·</span>BLACK</div>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:C.muted,
            letterSpacing:"0.25em", marginTop:6 }}>CLASSIFIED OPERATIONS PLATFORM</div>
        </div>

        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3, padding:"28px 24px" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red,
            letterSpacing:"0.2em", marginBottom:18 }}>AUTHENTICATE</div>

          <Lbl>EMAIL ADDRESS</Lbl>
          <input style={inputSt} type="email" placeholder="you@sentinel.black"
            value={email} onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()} />

          <Lbl>PASSWORD</Lbl>
          <div style={{ position:"relative", marginBottom:12 }}>
            <input style={{...inputSt, marginBottom:0, paddingRight:48}}
              type={showPw?"text":"password"} placeholder="••••••••"
              value={password} onChange={e=>setPassword(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            <button onClick={()=>setShowPw(!showPw)} style={{
              position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
              background:"none", border:"none", color:C.dim, fontSize:9,
              fontFamily:"'JetBrains Mono',monospace", cursor:"pointer" }}>
              {showPw?"HIDE":"SHOW"}
            </button>
          </div>

          {error && (
            <div style={{ background:"rgba(192,57,43,0.1)", border:`1px solid ${C.red}`,
              borderRadius:2, padding:"8px 12px", marginBottom:14,
              fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.red }}>
              ⚠ {error}
            </div>
          )}

          <BtnPrimary onClick={handleLogin} disabled={loading} fullWidth>
            {loading ? "AUTHENTICATING…" : "ACCESS SYSTEM"}
          </BtnPrimary>

          {/* Demo creds */}
          <div style={{ marginTop:18, padding:"12px 14px", background:C.mid,
            borderRadius:2, border:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted,
              letterSpacing:"0.15em", marginBottom:8 }}>DEMO CREDENTIALS</div>
            {DEMO.map(u => (
              <div key={u.email} onClick={()=>{setEmail(u.email);setPassword(u.password);}}
                style={{ padding:"6px 0", cursor:"pointer", display:"flex",
                  justifyContent:"space-between", alignItems:"center",
                  borderBottom:`1px solid ${C.border}` }}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9 }}>
                  <span style={{ color:C.text }}>{u.email}</span>
                  <span style={{ color:C.dim, marginLeft:8 }}>{u.password}</span>
                </div>
                <Badge label={u.role} color={u.role==="DIRECTOR"?C.red:u.role==="ANALYST"?C.amber:C.teal} />
              </div>
            ))}
            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:8, color:C.muted, marginTop:8 }}>
              Click a row to autofill
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MODAL WRAPPER ──────────────────────────────────────────────
function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:200,
      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:C.surface, border:`1px solid ${C.border}`, borderRadius:3,
        padding:"26px 28px", width:"100%", maxWidth:460, animation:"fadeIn 0.2s ease",
        maxHeight:"90vh", overflowY:"auto" }}>
        {children}
      </div>
    </div>
  );
}

// ── FORMS ──────────────────────────────────────────────────────
function NewCaseForm({ onSubmit, onCancel }) {
  const [f, setF] = useState({ title:"", priority:"HIGH", summary:"", tags:"" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!f.title) return;
    setLoading(true);
    await onSubmit({ ...f, tags: f.tags.split(",").map(t=>t.trim()).filter(Boolean) });
    setLoading(false);
  };
  return (
    <>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red,
        letterSpacing:"0.2em", marginBottom:16 }}>OPEN NEW CASE</div>
      <Lbl>CASE TITLE</Lbl>
      <input style={inputSt} value={f.title} onChange={e=>setF({...f,title:e.target.value})} placeholder="Case designation..." />
      <Lbl>PRIORITY</Lbl>
      <select style={inputSt} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}>
        {["CRITICAL","HIGH","MEDIUM","LOW"].map(p=><option key={p}>{p}</option>)}
      </select>
      <Lbl>SUMMARY</Lbl>
      <textarea style={{...inputSt,height:68,resize:"none"}} value={f.summary}
        onChange={e=>setF({...f,summary:e.target.value})} placeholder="Situation summary..." />
      <Lbl>TAGS (COMMA-SEPARATED)</Lbl>
      <input style={inputSt} value={f.tags} onChange={e=>setF({...f,tags:e.target.value})} placeholder="financial, covert, sigint..." />
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <BtnGhost onClick={onCancel}>CANCEL</BtnGhost>
        <BtnPrimary onClick={submit} disabled={loading||!f.title}>{loading?"SAVING…":"OPEN CASE"}</BtnPrimary>
      </div>
    </>
  );
}

function NewOpForm({ onSubmit, onCancel }) {
  const [f, setF] = useState({ codename:"", priority:"HIGH", risk:"HIGH", objective:"", scope:"", theater:"" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!f.codename) return;
    setLoading(true); await onSubmit(f); setLoading(false);
  };
  return (
    <>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red,
        letterSpacing:"0.2em", marginBottom:16 }}>CREATE OPERATION</div>
      <Lbl>CODENAME</Lbl>
      <input style={inputSt} value={f.codename} onChange={e=>setF({...f,codename:e.target.value})} placeholder="OPERATION NAME..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <Lbl>PRIORITY</Lbl>
          <select style={inputSt} value={f.priority} onChange={e=>setF({...f,priority:e.target.value})}>
            {["CRITICAL","HIGH","MEDIUM","LOW"].map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Lbl>RISK LEVEL</Lbl>
          <select style={inputSt} value={f.risk} onChange={e=>setF({...f,risk:e.target.value})}>
            {["HIGH","MEDIUM","LOW"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <Lbl>OBJECTIVE</Lbl>
      <textarea style={{...inputSt,height:56,resize:"none"}} value={f.objective}
        onChange={e=>setF({...f,objective:e.target.value})} placeholder="Primary mission objective..." />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div><Lbl>SCOPE</Lbl>
          <input style={inputSt} value={f.scope} onChange={e=>setF({...f,scope:e.target.value})} placeholder="Eastern Europe..." /></div>
        <div><Lbl>THEATER</Lbl>
          <input style={inputSt} value={f.theater} onChange={e=>setF({...f,theater:e.target.value})} placeholder="SIGINT / HUMINT..." /></div>
      </div>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <BtnGhost onClick={onCancel}>CANCEL</BtnGhost>
        <BtnPrimary onClick={submit} disabled={loading||!f.codename}>{loading?"SAVING…":"CREATE"}</BtnPrimary>
      </div>
    </>
  );
}

function NewEvidenceForm({ cases, operations, onSubmit, onCancel }) {
  const [f, setF] = useState({ case_id:"", operation_id:"", type:"SIGINT", source:"", classification:"CONFIDENTIAL" });
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!f.source) return;
    setLoading(true); await onSubmit(f); setLoading(false);
  };
  return (
    <>
      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red,
        letterSpacing:"0.2em", marginBottom:16 }}>INGEST EVIDENCE</div>
      <Lbl>EVIDENCE TYPE</Lbl>
      <select style={inputSt} value={f.type} onChange={e=>setF({...f,type:e.target.value})}>
        {["SIGINT","HUMINT","OSINT","COMINT","IMINT","FINANCIAL","DOCUMENT"].map(t=><option key={t}>{t}</option>)}
      </select>
      <Lbl>SOURCE</Lbl>
      <input style={inputSt} value={f.source} onChange={e=>setF({...f,source:e.target.value})} placeholder="NSA Relay Alpha, Asset CARDINAL..." />
      <Lbl>CLASSIFICATION</Lbl>
      <select style={inputSt} value={f.classification} onChange={e=>setF({...f,classification:e.target.value})}>
        {["TOP SECRET","SECRET","CONFIDENTIAL","UNCLASSIFIED"].map(c=><option key={c}>{c}</option>)}
      </select>
      <Lbl>LINK TO CASE (OPTIONAL)</Lbl>
      <select style={inputSt} value={f.case_id} onChange={e=>setF({...f,case_id:e.target.value})}>
        <option value="">— None —</option>
        {cases.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <Lbl>LINK TO OPERATION (OPTIONAL)</Lbl>
      <select style={inputSt} value={f.operation_id} onChange={e=>setF({...f,operation_id:e.target.value})}>
        <option value="">— None —</option>
        {operations.map(o=><option key={o.id} value={o.id}>{o.codename}</option>)}
      </select>
      <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
        <BtnGhost onClick={onCancel}>CANCEL</BtnGhost>
        <BtnPrimary onClick={submit} disabled={loading||!f.source}>{loading?"SAVING…":"INGEST"}</BtnPrimary>
      </div>
    </>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null);
  const [tab, setTab]     = useState("dashboard");
  const [modal, setModal] = useState(null);

  // Data state
  const [cases,      setCases]      = useState([]);
  const [operations, setOperations] = useState([]);
  const [evidence,   setEvidence]   = useState([]);
  const [timeline,   setTimeline]   = useState([]);
  const [audit,      setAudit]      = useState([]);
  const [health,     setHealth]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  // On login — load everything
  const loadAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [c, o, ev, tl, au, h] = await Promise.all([
        api.getCases(), api.getOperations(), api.getEvidence(),
        api.getTimeline(), api.getAudit(), api.health(),
      ]);
      setCases(c); setOperations(o); setEvidence(ev);
      setTimeline(tl); setAudit(au); setHealth(h);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("token") || e.message.includes("401")) handleLogout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (user) loadAll(); }, [user, loadAll]);

  // ── Check stored token on mount ──
  useEffect(() => {
    const token = localStorage.getItem("sb_token");
    if (token) {
      api.me().then(u => setUser(u)).catch(() => localStorage.removeItem("sb_token"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sb_token");
    setUser(null); setTab("dashboard");
  };

  // ── CRUD handlers ──
  const createCase = async (body) => {
    const c = await api.createCase(body);
    setCases(prev => [c, ...prev]);
    setTimeline(prev => [{ id:c.id+"tl", type:"case_created", actor:user.name,
      timestamp:new Date().toISOString(), payload:{title:c.title} }, ...prev]);
    setModal(null);
  };

  const updateCaseStatus = async (id, status) => {
    const c = await api.updateCase(id, { status });
    setCases(prev => prev.map(x => x.id===id ? c : x));
    setTimeline(prev => [{ id:id+"tl", type:"case_updated", actor:user.name,
      timestamp:new Date().toISOString(), payload:{status} }, ...prev]);
  };

  const createOperation = async (body) => {
    const op = await api.createOperation(body);
    setOperations(prev => [op, ...prev]);
    setTimeline(prev => [{ id:op.id+"tl", type:"operation_created", actor:user.name,
      timestamp:new Date().toISOString(), payload:{codename:op.codename} }, ...prev]);
    setModal(null);
  };

  const updateOpStatus = async (id, status) => {
    const op = await api.updateOperation(id, { status });
    setOperations(prev => prev.map(x => x.id===id ? op : x));
    setTimeline(prev => [{ id:id+"tl", type:"operation_updated", actor:user.name,
      timestamp:new Date().toISOString(), payload:{status} }, ...prev]);
  };

  const addEvidence = async (body) => {
    const ev = await api.addEvidence(body);
    setEvidence(prev => [ev, ...prev]);
    setTimeline(prev => [{ id:ev.id+"tl", type:"evidence_added", actor:user.name,
      timestamp:new Date().toISOString(), payload:{type:ev.type,source:ev.source} }, ...prev]);
    setModal(null);
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  const openCases  = cases.filter(c => c.status==="OPEN").length;
  const activeOps  = operations.filter(o => o.status==="ACTIVE").length;
  const TABS       = ["dashboard","cases","operations","evidence","timeline","audit"];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"system-ui,-apple-system,sans-serif" }}>

      {/* NAV */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`,
        padding:"0 20px", display:"flex", alignItems:"center", gap:20, height:50,
        position:"sticky", top:0, zIndex:100, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ width:20, height:20, background:C.red,
            clipPath:"polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)" }} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
            fontSize:12, letterSpacing:"0.15em" }}>
            SENTINEL<span style={{ color:C.red }}>·</span>BLACK
          </span>
        </div>
        <nav style={{ display:"flex", gap:2, flexWrap:"wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"5px 11px", borderRadius:2, border:"none", fontSize:10,
              fontFamily:"'JetBrains Mono',monospace", fontWeight:700,
              letterSpacing:"0.1em", textTransform:"uppercase",
              background: tab===t ? C.red : "transparent",
              color: tab===t ? "#fff" : C.dim, cursor:"pointer",
            }}>{t}</button>
          ))}
        </nav>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <Beacon active={activeOps>0} />
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.dim }}>
            {user.name.toUpperCase()}
          </span>
          <Badge label={user.role}
            color={user.role==="DIRECTOR"?C.red:user.role==="ANALYST"?C.amber:C.teal} />
          <button onClick={()=>{ api.logout().catch(()=>{}); handleLogout(); }} style={{
            background:"none", border:`1px solid ${C.border}`, color:C.dim,
            borderRadius:2, padding:"3px 9px", fontSize:9, cursor:"pointer",
            fontFamily:"'JetBrains Mono',monospace", letterSpacing:"0.1em" }}>LOGOUT</button>
        </div>
      </header>

      <main style={{ maxWidth:1160, margin:"0 auto", padding:"24px 20px" }}>
        {error && (
          <div style={{ background:"rgba(192,57,43,0.1)", border:`1px solid ${C.red}`,
            borderRadius:2, padding:"10px 14px", marginBottom:16,
            fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.red }}>
            ⚠ {error} <button onClick={loadAll} style={{ marginLeft:12, background:"none",
              border:"none", color:C.red, cursor:"pointer", textDecoration:"underline",
              fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>RETRY</button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9,
                color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>SITUATION REPORT</div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:700 }}>System Overview</h1>
            </div>
            {loading ? <Spinner /> : (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
                  {[
                    { label:"OPEN CASES",      val:openCases,          color:C.teal  },
                    { label:"ACTIVE OPS",      val:activeOps,          color:C.red,  beacon:true },
                    { label:"EVIDENCE ITEMS",  val:evidence.length,    color:C.amber },
                    { label:"TIMELINE EVENTS", val:timeline.length,    color:C.dim   },
                  ].map(s => (
                    <div key={s.label} style={{ background:C.surface, border:`1px solid ${C.border}`,
                      borderRadius:3, padding:"16px 18px" }}>
                      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.dim,
                        letterSpacing:"0.15em", marginBottom:8 }}>{s.label}</div>
                      <div style={{ fontSize:32, fontWeight:700, color:s.color,
                        display:"flex", alignItems:"center", gap:8 }}>
                        {s.beacon && <Beacon active />}{s.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {/* Recent Cases */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3 }}>
                    <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.dim, letterSpacing:"0.15em" }}>RECENT CASES</span>
                      <button onClick={()=>setTab("cases")} style={{ background:"none", border:"none",
                        color:C.red, fontSize:9, fontFamily:"'JetBrains Mono',monospace", cursor:"pointer" }}>VIEW ALL →</button>
                    </div>
                    {cases.slice(0,5).map(c => (
                      <div key={c.id} style={{ padding:"10px 16px", borderBottom:`1px solid ${C.mid}` }}>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                          <span style={{ fontSize:11, fontWeight:600, flex:1 }}>{c.title}</span>
                          <Badge label={c.status} color={STATUS_COLOR[c.status]} />
                        </div>
                        <div style={{ marginTop:4 }}>
                          <Badge label={c.priority} color={PRIORITY_COLOR[c.priority]} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Live Feed */}
                  <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3 }}>
                    <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`,
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.dim, letterSpacing:"0.15em" }}>LIVE FEED</span>
                      <button onClick={()=>setTab("timeline")} style={{ background:"none", border:"none",
                        color:C.red, fontSize:9, fontFamily:"'JetBrains Mono',monospace", cursor:"pointer" }}>VIEW ALL →</button>
                    </div>
                    {timeline.slice(0,6).map(e => (
                      <div key={e.id} style={{ padding:"9px 16px", borderBottom:`1px solid ${C.mid}`,
                        display:"flex", gap:10, alignItems:"flex-start" }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:C.red, marginTop:4, flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:11 }}>{TIMELINE_LABELS[e.type]||e.type}</div>
                          <div style={{ fontSize:9, color:C.dim, marginTop:2,
                            fontFamily:"'JetBrains Mono',monospace" }}>{e.actor} · {fmt(e.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* CASES */}
        {tab==="cases" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>CASE MANAGEMENT</div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Active Caseload</h2>
              </div>
              <BtnPrimary onClick={()=>setModal("newCase")}>+ OPEN CASE</BtnPrimary>
            </div>
            {loading ? <Spinner /> : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {cases.map(c => (
                  <div key={c.id} style={{ background:C.surface, border:`1px solid ${C.border}`,
                    borderRadius:3, padding:"14px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9,
                          color:C.dim, letterSpacing:"0.15em", marginBottom:4 }}>CASE-{c.id.slice(0,8)}</div>
                        <div style={{ fontSize:13, fontWeight:700, marginBottom:6 }}>{c.title}</div>
                        <div style={{ fontSize:12, color:C.dim, marginBottom:10 }}>{c.summary}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                          <Badge label={c.status}   color={STATUS_COLOR[c.status]}   />
                          <Badge label={c.priority} color={PRIORITY_COLOR[c.priority]} />
                          {(c.tags||[]).map(t=><Badge key={t} label={t} color={C.muted} />)}
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:6, alignItems:"flex-end", flexShrink:0 }}>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted }}>{fmt(c.updated_at)}</span>
                        {c.status==="OPEN" && (
                          <button onClick={()=>updateCaseStatus(c.id,"CLOSED")} style={{
                            background:"none", border:`1px solid ${C.muted}`, color:C.dim,
                            borderRadius:2, padding:"4px 10px", fontSize:9, cursor:"pointer",
                            fontFamily:"'JetBrains Mono',monospace" }}>CLOSE</button>
                        )}
                        {c.status==="CLOSED" && (
                          <button onClick={()=>updateCaseStatus(c.id,"OPEN")} style={{
                            background:"none", border:`1px solid ${C.teal}`, color:C.teal,
                            borderRadius:2, padding:"4px 10px", fontSize:9, cursor:"pointer",
                            fontFamily:"'JetBrains Mono',monospace" }}>REOPEN</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPERATIONS */}
        {tab==="operations" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>OPERATIONS CENTER</div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Active Operations</h2>
              </div>
              <BtnPrimary onClick={()=>setModal("newOp")}>+ NEW OPERATION</BtnPrimary>
            </div>
            {loading ? <Spinner /> : (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {operations.map(op => (
                  <div key={op.id} style={{ background:C.surface,
                    border:`1px solid ${op.status==="ACTIVE" ? C.red+"55" : C.border}`,
                    borderRadius:3, padding:"16px 18px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          {op.status==="ACTIVE" && <Beacon active />}
                          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13,
                            fontWeight:700, color:op.status==="ACTIVE"?C.text:C.dim }}>{op.codename}</span>
                        </div>
                        <div style={{ fontSize:11, color:C.dim }}>{op.theater} · {op.scope}</div>
                      </div>
                      <Badge label={op.status} color={STATUS_COLOR[op.status]} />
                    </div>
                    <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.5 }}>{op.objective}</div>
                    <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                      <Badge label={`RISK: ${op.risk}`} color={RISK_COLOR[op.risk]} />
                      <Badge label={op.priority} color={PRIORITY_COLOR[op.priority]} />
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {op.status==="PLANNING" && (
                        <BtnPrimary onClick={()=>updateOpStatus(op.id,"ACTIVE")} style={{ padding:"5px 12px", fontSize:10 }}>ACTIVATE</BtnPrimary>
                      )}
                      {op.status==="ACTIVE" && (
                        <button onClick={()=>updateOpStatus(op.id,"COMPLETED")} style={{
                          background:"none", border:`1px solid ${C.teal}`, color:C.teal,
                          borderRadius:2, padding:"5px 12px", fontSize:10, cursor:"pointer",
                          fontFamily:"'JetBrains Mono',monospace" }}>COMPLETE</button>
                      )}
                      {op.status==="COMPLETED" && (
                        <span style={{ fontSize:10, color:C.muted, fontFamily:"'JetBrains Mono',monospace" }}>ARCHIVED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE */}
        {tab==="evidence" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>EVIDENCE VAULT</div>
                <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Ingested Materials</h2>
              </div>
              <BtnPrimary onClick={()=>setModal("newEvidence")}>+ INGEST EVIDENCE</BtnPrimary>
            </div>
            {loading ? <Spinner /> : (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.5fr 1.5fr 1.5fr",
                  padding:"10px 16px", borderBottom:`1px solid ${C.border}` }}>
                  {["ID","TYPE","SOURCE","CLASSIFICATION","INGESTED"].map(h=>(
                    <span key={h} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted, letterSpacing:"0.15em" }}>{h}</span>
                  ))}
                </div>
                {evidence.map(ev=>(
                  <div key={ev.id} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1.5fr 1.5fr 1.5fr",
                    padding:"11px 16px", borderBottom:`1px solid ${C.mid}`, alignItems:"center" }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.muted }}>{ev.id.slice(0,8)}</span>
                    <Badge label={ev.type} color={C.amber} />
                    <span style={{ fontSize:12, color:C.dim }}>{ev.source}</span>
                    <Badge label={ev.classification}
                      color={ev.classification==="TOP SECRET"?C.red:ev.classification==="SECRET"?C.amber:C.teal} />
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted }}>{fmt(ev.ingested_at)}</span>
                  </div>
                ))}
                {evidence.length===0 && (
                  <div style={{ padding:32, textAlign:"center", color:C.muted, fontSize:12 }}>No evidence ingested yet.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TIMELINE */}
        {tab==="timeline" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>EVENT FEED</div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Unified Timeline</h2>
            </div>
            {loading ? <Spinner /> : (
              <div style={{ position:"relative", paddingLeft:26 }}>
                <div style={{ position:"absolute", left:7, top:0, bottom:0, width:1, background:C.border }} />
                {timeline.map(e=>(
                  <div key={e.id} style={{ position:"relative", marginBottom:14 }}>
                    <div style={{ position:"absolute", left:-22, top:5, width:9, height:9,
                      borderRadius:"50%", background:C.surface, border:`2px solid ${C.red}` }} />
                    <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3, padding:"11px 14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:600 }}>{TIMELINE_LABELS[e.type]||e.type}</span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted }}>{fmt(e.timestamp)}</span>
                      </div>
                      <div style={{ fontSize:11, color:C.dim }}>
                        <span style={{ color:C.amber }}>{e.actor}</span>
                        {e.payload&&Object.entries(e.payload).map(([k,v])=>(
                          <span key={k}> · <span style={{ color:C.text }}>{String(v)}</span></span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT */}
        {tab==="audit" && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.red, letterSpacing:"0.2em", marginBottom:4 }}>COMPLIANCE</div>
              <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>Audit Log</h2>
            </div>
            {loading ? <Spinner /> : (
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:3 }}>
                {audit.length===0 && (
                  <div style={{ padding:40, textAlign:"center", color:C.muted, fontSize:12 }}>No audit entries yet.</div>
                )}
                {audit.map(a=>(
                  <div key={a.id} style={{ padding:"10px 16px", borderBottom:`1px solid ${C.mid}`,
                    display:"grid", gridTemplateColumns:"1.5fr 1.5fr 2fr 1.4fr", gap:10, alignItems:"center" }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:C.amber }}>{a.actor}</span>
                    <Badge label={a.action.replace(/_/g," ")} color={C.muted} />
                    <span style={{ fontSize:11, color:C.dim }}>{a.target}</span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:C.muted }}>{fmt(a.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODALS */}
      {modal==="newCase" && (
        <Modal onClose={()=>setModal(null)}>
          <NewCaseForm onSubmit={createCase} onCancel={()=>setModal(null)} />
        </Modal>
      )}
      {modal==="newOp" && (
        <Modal onClose={()=>setModal(null)}>
          <NewOpForm onSubmit={createOperation} onCancel={()=>setModal(null)} />
        </Modal>
      )}
      {modal==="newEvidence" && (
        <Modal onClose={()=>setModal(null)}>
          <NewEvidenceForm cases={cases} operations={operations}
            onSubmit={addEvidence} onCancel={()=>setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
