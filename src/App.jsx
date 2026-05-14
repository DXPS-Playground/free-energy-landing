import { useState } from "react";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Lora:ital,wght@0,400;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --sun: #F5A623; --sun-deep: #C8861C; --sky: #0A2540; --sky-mid: #103560;
    --leaf: #2E7D32; --leaf-light: #4CAF50;
    --white: #FAFAF7; --off: #F3EFE8; --muted: #6B7280;
    --border: #DDD8CF; --red: #C0392B;
  }
  body { font-family: 'Lora', serif; background: var(--off); color: var(--sky); }
  .shell { display: grid; grid-template-columns: 380px 1fr; min-height: 100vh; }
  .panel-left {
    background: var(--sky); padding: 2.5rem 2rem;
    display: flex; flex-direction: column; gap: 1.8rem;
    position: sticky; top: 0; height: 100vh; overflow-y: auto;
  }
  .logo { font-family:'Syne',sans-serif; font-weight:800; font-size:1rem; color:var(--white); display:flex; align-items:center; gap:0.4rem; }
  .logo-bolt { color:var(--sun); }
  .panel-title { font-family:'Syne',sans-serif; font-size:1.55rem; font-weight:800; line-height:1.2; color:var(--white); letter-spacing:-0.02em; }
  .panel-title .acc { color:var(--sun); font-style:italic; font-family:'Lora',serif; font-weight:400; }
  .panel-sub { font-size:0.84rem; color:rgba(250,250,247,0.5); line-height:1.7; }
  .benefits { display:flex; flex-direction:column; gap:0.85rem; }
  .benefit { display:flex; align-items:flex-start; gap:0.65rem; font-size:0.82rem; color:rgba(250,250,247,0.7); line-height:1.55; }
  .bicon { width:26px; height:26px; border-radius:3px; background:rgba(245,166,35,0.15); border:1px solid rgba(245,166,35,0.25); display:flex; align-items:center; justify-content:center; font-size:0.85rem; flex-shrink:0; margin-top:1px; }
  .util-section { border-top:1px solid rgba(255,255,255,0.1); padding-top:1.2rem; }
  .util-label { font-family:'Syne',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(250,250,247,0.3); margin-bottom:0.6rem; }
  .util-chips { display:flex; gap:0.4rem; flex-wrap:wrap; }
  .util-chip { font-family:'Syne',sans-serif; font-size:0.68rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:3px; border:1px solid rgba(255,255,255,0.12); color:rgba(250,250,247,0.45); letter-spacing:0.04em; }
  .panel-right { padding:2.5rem 2.5rem; overflow-y:auto; background:var(--white); }
  .progress-bar { display:flex; gap:0.35rem; margin-bottom:1.8rem; }
  .pseg { height:3px; flex:1; border-radius:2px; background:var(--border); transition:background 0.4s; }
  .pseg.done { background:var(--sun); }
  .pseg.active { background:var(--sky); }
  .step-label { font-family:'Syne',sans-serif; font-size:0.65rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:0.35rem; }
  .step-title { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:800; letter-spacing:-0.02em; color:var(--sky); margin-bottom:1.6rem; }
  .fgroup { display:flex; flex-direction:column; gap:1.1rem; }
  .field { display:flex; flex-direction:column; gap:0.35rem; }
  .row { display:flex; gap:0.85rem; }
  .row .field { flex:1; }
  label { font-family:'Syne',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:var(--sky); }
  .req { color:var(--sun-deep); }
  input, select, textarea { font-family:'Lora',serif; font-size:0.88rem; padding:0.65rem 0.85rem; border:1.5px solid var(--border); border-radius:4px; background:var(--white); color:var(--sky); transition:border-color 0.2s,box-shadow 0.2s; outline:none; width:100%; }
  input:focus, select:focus, textarea:focus { border-color:var(--sun); box-shadow:0 0 0 3px rgba(245,166,35,0.14); }
  textarea { resize:vertical; min-height:75px; }
  input.err, select.err { border-color:var(--red); }
  .errmsg { font-family:'Syne',sans-serif; font-size:0.68rem; font-weight:600; color:var(--red); }
  .cgrid { display:grid; grid-template-columns:1fr 1fr; gap:0.45rem; }
  .citem { display:flex; align-items:center; gap:0.55rem; padding:0.55rem 0.75rem; border:1.5px solid var(--border); border-radius:4px; cursor:pointer; transition:all 0.15s; user-select:none; font-size:0.8rem; line-height:1.3; }
  .citem:hover { border-color:var(--sun); background:rgba(245,166,35,0.04); }
  .citem.on { border-color:var(--sun); background:rgba(245,166,35,0.08); font-weight:600; }
  .cbox { width:15px; height:15px; border-radius:3px; border:1.5px solid var(--border); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:0.6rem; transition:all 0.15s; }
  .citem.on .cbox { background:var(--sun); border-color:var(--sun); color:white; }
  .file-zone { border:1.5px dashed var(--border); border-radius:4px; padding:1.1rem; text-align:center; cursor:pointer; transition:all 0.2s; font-size:0.8rem; color:var(--muted); }
  .file-zone:hover { border-color:var(--sun); color:var(--sky); }
  .file-zone input { display:none; }
  .file-names { margin-top:0.4rem; font-size:0.75rem; color:var(--leaf); }
  .promise-box { background:rgba(245,166,35,0.08); border:1.5px solid rgba(245,166,35,0.25); border-radius:4px; padding:0.85rem 1rem; font-size:0.8rem; line-height:1.65; }
  .form-nav { display:flex; gap:0.85rem; align-items:center; margin-top:1.8rem; }
  .btn-back { background:none; border:1.5px solid var(--border); color:var(--muted); font-family:'Syne',sans-serif; font-size:0.78rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:0.75rem 1.2rem; border-radius:4px; cursor:pointer; transition:all 0.2s; }
  .btn-back:hover { border-color:var(--sky); color:var(--sky); }
  .btn-next { background:var(--sky); color:var(--white); font-family:'Syne',sans-serif; font-size:0.8rem; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; padding:0.85rem 1.8rem; border:none; border-radius:4px; cursor:pointer; transition:all 0.2s; flex:1; }
  .btn-next:hover { background:var(--sky-mid); }
  .btn-submit { background:var(--sun); color:var(--sky); font-family:'Syne',sans-serif; font-size:0.85rem; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; padding:0.95rem 1.8rem; border:none; border-radius:4px; cursor:pointer; transition:all 0.2s; flex:1; }
  .btn-submit:hover { background:var(--sun-deep); }
  .loading-wrap { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:4rem 2rem; text-align:center; gap:1.4rem; }
  .spinner { width:44px; height:44px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--sun); animation:spin 0.85s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .load-title { font-family:'Syne',sans-serif; font-size:1.05rem; font-weight:800; }
  .load-sub { font-size:0.84rem; color:var(--muted); line-height:1.65; max-width:310px; }
  .result-card { border-radius:6px; overflow:hidden; border:1.5px solid var(--border); animation:fadeUp 0.5s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
  .r-header { padding:1.4rem 1.8rem; background:var(--sky); color:var(--white); display:flex; align-items:center; gap:1rem; }
  .score-badge { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-size:1.4rem; font-weight:800; flex-shrink:0; }
  .sA { background:var(--leaf); color:white; }
  .sB { background:var(--sun); color:var(--sky); }
  .sC { background:var(--muted); color:white; }
  .tier-label { font-family:'Syne',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:rgba(250,250,247,0.45); margin-bottom:0.2rem; }
  .tier-name { font-family:'Syne',sans-serif; font-size:0.95rem; font-weight:800; color:var(--white); }
  .r-body { padding:1.5rem 1.8rem; display:flex; flex-direction:column; gap:1.2rem; background:var(--white); }
  .r-sect-title { font-family:'Syne',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--sun-deep); margin-bottom:0.35rem; }
  .r-text { font-size:0.86rem; line-height:1.72; color:var(--sky); }
  .score-row { display:flex; align-items:center; gap:0.75rem; }
  .score-bar { flex:1; height:5px; background:var(--border); border-radius:3px; overflow:hidden; }
  .score-fill { height:100%; border-radius:3px; background:var(--sun); }
  .score-num { font-family:'Syne',sans-serif; font-size:0.78rem; font-weight:700; white-space:nowrap; }
  .email-box { background:var(--off); border:1.5px solid var(--border); border-radius:4px; padding:0.95rem 1.1rem; }
  .email-subj { font-family:'Syne',sans-serif; font-size:0.78rem; font-weight:700; margin-bottom:0.45rem; }
  .email-body { font-size:0.84rem; line-height:1.72; color:var(--sky); font-style:italic; }
  .success-note { background:rgba(46,125,50,0.08); border:1.5px solid rgba(46,125,50,0.2); border-radius:4px; padding:0.9rem 1.1rem; font-size:0.82rem; color:var(--leaf); line-height:1.6; font-family:'Syne',sans-serif; font-weight:600; }
  @media(max-width:768px){ .shell{grid-template-columns:1fr;} .panel-left{position:static;height:auto;} .row{flex-direction:column;} .cgrid{grid-template-columns:1fr;} }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STEPS = [
  { label:"Step 1 of 4", title:"Your contact information" },
  { label:"Step 2 of 4", title:"About your property" },
  { label:"Step 3 of 4", title:"Your current lighting" },
  { label:"Step 4 of 4", title:"Timing & optional uploads" },
];

const PROP_TYPES = ["Warehouse","Retail Center","Office Building","Parking Lot / Garage","Industrial","Mixed-Use / Common Areas","Other"];
const UTILITIES  = ["Duke Energy Florida","Tampa Electric (TECO)","Florida Power & Light (FPL)","Unsure / Don't know"];
const ROLES      = ["Property Owner","Tenant","Property Manager","Decision-Maker (Other)"];
const LT_TYPES   = ["Fluorescent (T8/T12)","Metal Halide","High Bay Fixtures","Recessed Troffers","Parking Lot / Pole Lights","Unsure"];
const AREAS      = ["Interior / Office","Warehouse / High Bay","Exterior / Parking","Common Areas","Retail Floor","Cold Storage"];
const PAINS      = ["High electric bills","Poor lighting quality","Frequent maintenance","Old / outdated fixtures","Interested in rebates","Need no upfront cost option"];
const TIMELINES  = ["Ready now","Within 30 days","Within 3–6 months","Just researching"];

function toggle(arr, v) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

// ─── SUB-COMPONENTS (outside LeadForm so they don't re-mount on every render)─
// This is the fix for the "one letter then loses focus" bug.
// When these were defined inside LeadForm, React created a brand new component
// type on every render, forcing every input to unmount and remount — losing focus.
// Defined here at the top level, React reuses the same component type and focus
// is preserved correctly.

function Field({ name, label, req, error, children }) {
  return (
    <div className="field">
      <label>{label}{req && <span className="req"> *</span>}</label>
      {children}
      {error && <div className="errmsg">{error}</div>}
    </div>
  );
}

function TextInput({ name, value, onChange, error, ...props }) {
  return (
    <input
      className={error ? "err" : ""}
      value={value}
      onChange={e => onChange(name, e.target.value)}
      {...props}
    />
  );
}

function SelectInput({ name, value, onChange, error, opts, ph }) {
  return (
    <select
      className={error ? "err" : ""}
      value={value}
      onChange={e => onChange(name, e.target.value)}
    >
      <option value="">{ph || "Select..."}</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function CheckboxGrid({ name, value, onChange, opts }) {
  return (
    <div className="cgrid">
      {opts.map(o => {
        const on = value.includes(o);
        return (
          <div
            key={o}
            className={`citem${on ? " on" : ""}`}
            onClick={() => onChange(name, toggle(value, o))}
          >
            <div className="cbox">{on ? "✓" : ""}</div>
            {o}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LeadForm() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    businessName: "", contactName: "", phone: "", email: "",
    address: "", bestTime: "",
    propType: "", sqft: "", utility: "", role: "",
    ltTypes: [], fixtures: "", hoursDay: "", areas: [], pains: [],
    timeline: "", notes: "", fileNames: []
  });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [done, setDone] = useState(false);

  // Single setter used by all inputs
  function set(k, v) {
    setD(p => ({ ...p, [k]: v }));
    setErrs(p => ({ ...p, [k]: null }));
  }

  const REQ = [
    ["businessName", "contactName", "phone", "email", "address"],
    ["propType", "sqft", "utility", "role"],
    ["fixtures", "hoursDay"],
    ["timeline"],
  ];

  function validate() {
    const e = {};
    REQ[step].forEach(f => {
      if (!d[f] || !String(d[f]).trim()) e[f] = "Required";
    });
    return e;
  }

  function next() {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    if (step < 3) setStep(s => s + 1);
    else submit();
  }

  async function submit() {
    const e = validate();
    if (Object.keys(e).length) { setErrs(e); return; }
    setDone(true);
    setLoading(true);

    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: d.businessName,
          contactName:  d.contactName,
          phone:        d.phone,
          email:        d.email,
          address:      d.address,
          bestTime:     d.bestTime || "Not specified",
          propType:     d.propType,
          sqft:         d.sqft,
          utility:      d.utility,
          role:         d.role,
          ltTypes:      d.ltTypes,
          fixtures:     d.fixtures,
          hoursDay:     d.hoursDay,
          areas:        d.areas,
          pains:        d.pains,
          timeline:     d.timeline,
          notes:        d.notes || "",
        }),
      });
      const aiResult = await res.json();
      setResult(aiResult.err ? { err: true } : aiResult);
    } catch {
      setResult({ err: true });
    }
    setLoading(false);
  }

  // ─── STEP CONTENT ──────────────────────────────────────────────────────────
  // Each step renders its fields using the top-level components above.
  // Note: we pass value, onChange, and error as explicit props — no closure magic.

  const steps = [

    // STEP 1 — Contact
    <div className="fgroup" key="step1">
      <div className="row">
        <Field name="businessName" label="Business Name" req error={errs.businessName}>
          <TextInput name="businessName" value={d.businessName} onChange={set} error={errs.businessName} placeholder="ABC Warehousing LLC" />
        </Field>
        <Field name="contactName" label="Contact Name" req error={errs.contactName}>
          <TextInput name="contactName" value={d.contactName} onChange={set} error={errs.contactName} placeholder="Jane Smith" />
        </Field>
      </div>
      <div className="row">
        <Field name="phone" label="Phone" req error={errs.phone}>
          <TextInput name="phone" value={d.phone} onChange={set} error={errs.phone} type="tel" placeholder="(813) 555-0100" />
        </Field>
        <Field name="email" label="Work Email" req error={errs.email}>
          <TextInput name="email" value={d.email} onChange={set} error={errs.email} type="email" placeholder="jane@company.com" />
        </Field>
      </div>
      <Field name="address" label="Property Address" req error={errs.address}>
        <TextInput name="address" value={d.address} onChange={set} error={errs.address} placeholder="123 Industrial Blvd, Tampa, FL" />
      </Field>
      <Field name="bestTime" label="Best Time to Contact">
        <select value={d.bestTime} onChange={e => set("bestTime", e.target.value)}>
          <option value="">Any time</option>
          {["Mornings (8am–12pm)", "Afternoons (12pm–5pm)", "Email preferred"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
    </div>,

    // STEP 2 — Property
    <div className="fgroup" key="step2">
      <Field name="propType" label="Property Type" req error={errs.propType}>
        <SelectInput name="propType" value={d.propType} onChange={set} error={errs.propType} opts={PROP_TYPES} ph="Select property type..." />
      </Field>
      <div className="row">
        <Field name="sqft" label="Approx. Square Footage" req error={errs.sqft}>
          <TextInput name="sqft" value={d.sqft} onChange={set} error={errs.sqft} placeholder="e.g. 45,000" />
        </Field>
        <Field name="utility" label="Utility Provider" req error={errs.utility}>
          <SelectInput name="utility" value={d.utility} onChange={set} error={errs.utility} opts={UTILITIES} ph="Select utility..." />
        </Field>
      </div>
      <Field name="role" label="Your Role / Decision Authority" req error={errs.role}>
        <SelectInput name="role" value={d.role} onChange={set} error={errs.role} opts={ROLES} ph="Select your role..." />
      </Field>
    </div>,

    // STEP 3 — Lighting
    <div className="fgroup" key="step3">
      <Field name="ltTypes" label="Current Lighting Type(s)">
        <CheckboxGrid name="ltTypes" value={d.ltTypes} onChange={set} opts={LT_TYPES} />
      </Field>
      <div className="row">
        <Field name="fixtures" label="Approx. # of Fixtures" req error={errs.fixtures}>
          <TextInput name="fixtures" value={d.fixtures} onChange={set} error={errs.fixtures} placeholder="e.g. 120" />
        </Field>
        <Field name="hoursDay" label="Hours Lights On Per Day" req error={errs.hoursDay}>
          <TextInput name="hoursDay" value={d.hoursDay} onChange={set} error={errs.hoursDay} placeholder="e.g. 16" />
        </Field>
      </div>
      <Field name="areas" label="Areas Needing Upgrades">
        <CheckboxGrid name="areas" value={d.areas} onChange={set} opts={AREAS} />
      </Field>
      <Field name="pains" label="What's Driving This Project?">
        <CheckboxGrid name="pains" value={d.pains} onChange={set} opts={PAINS} />
      </Field>
    </div>,

    // STEP 4 — Intent
    <div className="fgroup" key="step4">
      <Field name="timeline" label="Project Timeline" req error={errs.timeline}>
        <div className="cgrid">
          {TIMELINES.map(t => (
            <div
              key={t}
              className={`citem${d.timeline === t ? " on" : ""}`}
              onClick={() => set("timeline", t)}
            >
              <div className="cbox">{d.timeline === t ? "✓" : ""}</div>
              {t}
            </div>
          ))}
        </div>
      </Field>
      <Field name="notes" label="Anything Else We Should Know?">
        <textarea
          value={d.notes}
          onChange={e => set("notes", e.target.value)}
          placeholder="Multiple properties, past quotes, specific concerns..."
        />
      </Field>
      <div className="field">
        <label>
          Optional Uploads{" "}
          <span style={{ color: "var(--muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
            (electric bill, fixture photos, floor plan)
          </span>
        </label>
        <label className="file-zone">
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={e => set("fileNames", Array.from(e.target.files).map(f => f.name))}
          />
          📎 Click to attach files
          {d.fileNames.length > 0 && <div className="file-names">{d.fileNames.join(", ")}</div>}
        </label>
      </div>
      <div className="promise-box">
        <strong>What happens next:</strong> We'll estimate your energy savings, available utility rebates,
        and payback period — within 24–48 hours. No cost, no obligation.
      </div>
    </div>,
  ];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="shell">

        {/* LEFT PANEL */}
        <div className="panel-left">
          <div className="logo"><span className="logo-bolt">⚡</span>FreeEnergyConsultants</div>
          <div className="panel-title">
            Request a Free<br />
            <span className="acc">Lighting Savings</span><br />
            Audit
          </div>
          <div className="panel-sub">
            Submit your property details and we'll estimate your savings,
            rebate eligibility, and payback period — at no cost or obligation.
          </div>
          <div className="benefits">
            {[
              ["💡", "Custom savings analysis based on your property, fixture count & utility"],
              ["💰", "We identify every available Duke Energy, TECO, or FPL rebate"],
              ["📊", "Clear ROI & payback period before you spend anything"],
              ["🤝", "We act as your advisor — not just a contractor"],
            ].map(([ic, tx]) => (
              <div className="benefit" key={tx}>
                <div className="bicon">{ic}</div>
                <span>{tx}</span>
              </div>
            ))}
          </div>
          <div className="util-section">
            <div className="util-label">Rebate programs we work with</div>
            <div className="util-chips">
              {["Duke Energy FL", "Tampa Electric", "FPL"].map(u => (
                <span className="util-chip" key={u}>{u}</span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel-right">
          {!done ? (
            <>
              <div className="progress-bar">
                {STEPS.map((s, i) => (
                  <div key={i} className={`pseg${i < step ? " done" : i === step ? " active" : ""}`} />
                ))}
              </div>
              <div className="step-label">{STEPS[step].label}</div>
              <div className="step-title">{STEPS[step].title}</div>
              {steps[step]}
              <div className="form-nav">
                {step > 0 && (
                  <button className="btn-back" onClick={() => setStep(s => s - 1)}>← Back</button>
                )}
                {step < 3
                  ? <button className="btn-next" onClick={next}>Continue →</button>
                  : <button className="btn-submit" onClick={next}>Request My Free Audit ⚡</button>
                }
              </div>
            </>
          ) : loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <div className="load-title">Analyzing your property…</div>
              <div className="load-sub">
                Our AI is reviewing your lighting situation, estimating savings potential,
                and identifying available utility rebates.
              </div>
            </div>
          ) : result?.err ? (
            <div className="loading-wrap">
              <div style={{ fontSize: "2.5rem" }}>✅</div>
              <div className="load-title">Audit request received!</div>
              <div className="load-sub">
                We'll review your information and reach out within 24–48 hours
                with your personalized savings estimate.
              </div>
            </div>
          ) : result ? (
            <div>
              <div className="step-label">Audit Submitted</div>
              <div className="step-title" style={{ marginBottom: "1.2rem" }}>AI Lead Summary</div>
              <div className="result-card">
                <div className="r-header">
                  <div className={`score-badge s${result.tier}`}>{result.tier}</div>
                  <div>
                    <div className="tier-label">Lead Tier</div>
                    <div className="tier-name">
                      {result.tier === "A" ? "High Priority — Contact Today"
                        : result.tier === "B" ? "Strong Lead — Follow Up Soon"
                        : "Nurture Lead — Add to Sequence"}
                    </div>
                  </div>
                </div>
                <div className="r-body">
                  <div>
                    <div className="r-sect-title">Lead Score</div>
                    <div className="score-row">
                      <div className="score-bar">
                        <div className="score-fill" style={{ width: `${result.score}%` }} />
                      </div>
                      <div className="score-num">{result.score}/100</div>
                    </div>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: "0.35rem" }}>
                      {result.tierReason}
                    </div>
                  </div>
                  <div>
                    <div className="r-sect-title">Summary</div>
                    <div className="r-text">{result.summary}</div>
                  </div>
                  <div>
                    <div className="r-sect-title">Estimated Savings Opportunity</div>
                    <div className="r-text">{result.estimatedSavings}</div>
                  </div>
                  <div>
                    <div className="r-sect-title">Rebate Eligibility</div>
                    <div className="r-text">{result.rebateNote}</div>
                  </div>
                  <div>
                    <div className="r-sect-title">Suggested Outreach Email</div>
                    <div className="email-box">
                      <div className="email-subj">Subject: {result.outreachSubject}</div>
                      <div className="email-body">{result.outreachOpener}</div>
                    </div>
                  </div>
                  <div className="success-note">
                    ✓ Lead logged to CRM · AI outreach email ready to send · Slack alert dispatched for Tier {result.tier} leads
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </>
  );
}
