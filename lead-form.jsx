import React, { useState } from "react";

/**
 * FreeEnergyConsultants — AI-Powered Lead Qualification Form
 * ----------------------------------------------------------
 * 4-step intake form with Claude AI scoring on submit.
 *
 * Required environment:
 *   - ANTHROPIC_API_KEY available to the calling backend / proxy
 *   - For browser use, route the request through your own /api/score endpoint
 *     so the API key is never exposed. The fetch call below assumes a
 *     same-origin proxy. Replace fetch() URL/headers if calling Anthropic directly
 *     from a trusted environment.
 *
 * Drop-in styling: relies on a Tailwind-like utility class set OR the
 * inline <style> block at the bottom (works standalone with no Tailwind).
 */

const COLORS = {
  navy: "#0A2540",
  navy2: "#0E2E50",
  amber: "#F5A623",
  forest: "#2E7D32",
  cream: "#F3EFE8",
  ink: "#14202E",
  muted: "#4A5A6E",
  line: "rgba(10, 37, 64, 0.12)",
};

const PROPERTY_TYPES = [
  "Warehouse",
  "Retail Center",
  "Office Building",
  "Parking Lot/Garage",
  "Industrial",
  "Mixed-Use",
  "Other",
];

const UTILITIES = ["Duke Energy Florida", "TECO", "FPL", "Unsure"];
const ROLES = ["Owner", "Tenant", "Property Manager", "Decision-Maker"];

const LIGHTING_TYPES = [
  "Fluorescent T8/T12",
  "Metal Halide",
  "High Bay",
  "Troffers",
  "Parking Lot/Pole Lights",
  "Unsure",
];

const UPGRADE_AREAS = [
  "Interior/Office",
  "Warehouse/High Bay",
  "Exterior/Parking",
  "Common Areas",
  "Retail Floor",
  "Cold Storage",
];

const PAIN_POINTS = [
  "High electric bills",
  "Poor lighting quality",
  "Frequent maintenance",
  "Old fixtures",
  "Interested in rebates",
  "Need no upfront cost option",
];

const TIMELINES = [
  "Ready now",
  "Within 30 days",
  "Within 3–6 months",
  "Just researching",
];

const initialForm = {
  // Step 1
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  bestTime: "",
  // Step 2
  propertyType: "",
  squareFootage: "",
  utility: "",
  role: "",
  // Step 3
  lightingTypes: [],
  fixtureCount: "",
  hoursPerDay: "",
  upgradeAreas: [],
  painPoints: [],
  // Step 4
  timeline: [],
  notes: "",
  fileName: "",
};

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) =>
    setForm((f) => {
      const cur = new Set(f[k]);
      cur.has(v) ? cur.delete(v) : cur.add(v);
      return { ...f, [k]: Array.from(cur) };
    });

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) update("fileName", f.name);
  };

  const handleNext = () => setStep((s) => Math.min(4, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `You are an experienced commercial LED retrofit sales analyst for FreeEnergyConsultants, a Tampa Bay (FL) consultancy serving warehouses, retail centers, office buildings, and property managers. You coordinate utility rebates from Duke Energy Florida, TECO, and FPL.

Score this inbound lead based on commercial fit, project size, urgency, and rebate eligibility. Return JSON ONLY (no prose, no markdown fences). Use this exact shape:

{
  "score": <integer 1-100>,
  "tier": "A" | "B" | "C",
  "tierReason": "<one-sentence reason>",
  "summary": "<2-3 sentence lead summary>",
  "estimatedSavings": "<dollar range or % range, e.g. '$8,000-$14,000/yr' or '40-55%'>",
  "rebateNote": "<one-sentence note about which utility program likely applies>",
  "outreachSubject": "<personalized cold-email subject under 65 chars>",
  "outreachOpener": "<personalized 2-3 sentence email opener that references their specifics>"
}

Tier rubric:
- A (80-100): Decision-maker, ready in <90 days, >10,000 sq ft OR >50 fixtures, in TECO/Duke/FPL territory, clear pain point.
- B (50-79): Some fit gaps — smaller property, longer timeline, tenant rather than owner, or utility unknown.
- C (1-49): Just researching, very small property, weak fit, or missing critical info.

Lead data:
${JSON.stringify(form, null, 2)}`;

    try {
      // NOTE: This calls Anthropic directly. In production, proxy through your backend
      // so the API key is never exposed to the browser.
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "REPLACE_WITH_SERVER_PROXY",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const text = data?.content?.[0]?.text || "";

      // Extract JSON object from response (Claude may add minor wrapping)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response");

      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------
  if (result) return <ResultCard result={result} form={form} onReset={() => { setResult(null); setForm(initialForm); setStep(1); }} />;

  return (
    <div className="fec-shell">
      <FormStyles />

      {/* STICKY LEFT PANEL */}
      <aside className="fec-aside">
        <div className="fec-aside-inner">
          <div className="fec-logo"><span className="fec-bolt">⚡</span> FreeEnergyConsultants</div>
          <h2 className="fec-aside-head">Your free lighting savings audit</h2>
          <p className="fec-aside-sub">A 5-minute intake. We respond within one business day with a tailored savings estimate.</p>

          <ul className="fec-benefits">
            <li><span className="fec-check">✓</span> No upfront cost options available</li>
            <li><span className="fec-check">✓</span> Average 47% lighting energy reduction</li>
            <li><span className="fec-check">✓</span> We file every rebate form</li>
            <li><span className="fec-check">✓</span> Tampa Bay licensed & insured crews</li>
          </ul>

          <div className="fec-utils">
            <span className="fec-utils-label">Rebate partners</span>
            <div className="fec-utils-row">
              <span className="fec-util-chip">Duke Energy</span>
              <span className="fec-util-chip">TECO</span>
              <span className="fec-util-chip">FPL</span>
            </div>
          </div>

          <div className="fec-progress-wrap">
            <div className="fec-progress-label">Step {step} of 4</div>
            <div className="fec-progress-bar">
              <div className="fec-progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* SCROLLABLE RIGHT PANEL */}
      <main className="fec-main">
        <div className="fec-main-inner">
          {step === 1 && (
            <Step title="Tell us about your property" subtitle="The basics — we'll keep it short.">
              <Field label="Business name" value={form.businessName} onChange={(v) => update("businessName", v)} placeholder="Acme Logistics, LLC" />
              <Row>
                <Field label="Contact name" value={form.contactName} onChange={(v) => update("contactName", v)} placeholder="Jane Smith" />
                <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} placeholder="(813) 555-0142" />
              </Row>
              <Field label="Work email" value={form.email} onChange={(v) => update("email", v)} placeholder="jane@acme.com" type="email" />
              <Field label="Property address" value={form.address} onChange={(v) => update("address", v)} placeholder="123 Industrial Blvd, Tampa, FL" />
              <Select label="Best time to contact" value={form.bestTime} onChange={(v) => update("bestTime", v)} options={["Morning (8a–12p)", "Afternoon (12p–5p)", "Evening (5p–7p)", "Anytime"]} />
            </Step>
          )}

          {step === 2 && (
            <Step title="Property details" subtitle="Helps us right-size your audit and rebate paperwork.">
              <Select label="Property type" value={form.propertyType} onChange={(v) => update("propertyType", v)} options={PROPERTY_TYPES} />
              <Row>
                <Field label="Approximate square footage" value={form.squareFootage} onChange={(v) => update("squareFootage", v)} placeholder="e.g. 25,000" />
                <Select label="Utility provider" value={form.utility} onChange={(v) => update("utility", v)} options={UTILITIES} />
              </Row>
              <Select label="Your role" value={form.role} onChange={(v) => update("role", v)} options={ROLES} />
            </Step>
          )}

          {step === 3 && (
            <Step title="Current lighting setup" subtitle="Rough estimates are fine — we'll verify on-site.">
              <CheckGrid label="Current lighting types" options={LIGHTING_TYPES} selected={form.lightingTypes} onToggle={(v) => toggle("lightingTypes", v)} />
              <Row>
                <Field label="Approx. fixture count" value={form.fixtureCount} onChange={(v) => update("fixtureCount", v)} placeholder="e.g. 120" />
                <Field label="Hours of use per day" value={form.hoursPerDay} onChange={(v) => update("hoursPerDay", v)} placeholder="e.g. 14" />
              </Row>
              <CheckGrid label="Areas to upgrade" options={UPGRADE_AREAS} selected={form.upgradeAreas} onToggle={(v) => toggle("upgradeAreas", v)} />
              <CheckGrid label="Pain points & goals" options={PAIN_POINTS} selected={form.painPoints} onToggle={(v) => toggle("painPoints", v)} />
            </Step>
          )}

          {step === 4 && (
            <Step title="Timeline & next steps" subtitle="Almost done.">
              <CheckGrid label="When are you looking to move forward?" options={TIMELINES} selected={form.timeline} onToggle={(v) => toggle("timeline", v)} columns={2} />
              <div className="fec-field">
                <label className="fec-label">Anything else we should know?</label>
                <textarea
                  className="fec-input fec-textarea"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Specific buildings, prior quotes, tenant constraints, etc."
                />
              </div>

              <div className="fec-field">
                <label className="fec-label">Optional: upload an electric bill, photos, or floor plan</label>
                <label className="fec-file">
                  <input type="file" onChange={handleFile} accept=".pdf,.jpg,.jpeg,.png,.heic" />
                  <span>📎 {form.fileName || "Choose file (PDF, JPG, PNG)"}</span>
                </label>
              </div>

              <div className="fec-promise">
                <strong>Our promise:</strong> No spam, no surprise pitches. You'll hear from a real Florida energy consultant within one business day. If we're not a fit, we'll tell you that too.
              </div>
            </Step>
          )}

          {/* NAV BUTTONS */}
          <div className="fec-nav">
            {step > 1 && (
              <button type="button" className="fec-btn fec-btn-ghost" onClick={handleBack} disabled={loading}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 4 && (
              <button type="button" className="fec-btn fec-btn-primary" onClick={handleNext}>
                Continue →
              </button>
            )}
            {step === 4 && (
              <button type="button" className="fec-btn fec-btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Analyzing…" : "Submit & Get My Savings Estimate"}
              </button>
            )}
          </div>

          {error && <div className="fec-error">⚠ {error}</div>}

          {loading && (
            <div className="fec-loading">
              <div className="fec-spinner" />
              <div>
                <div className="fec-loading-title">Claude is reviewing your property…</div>
                <div className="fec-loading-sub">Scoring fit · estimating savings · drafting your outreach</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// =================== SUB-COMPONENTS ===================

function Step({ title, subtitle, children }) {
  return (
    <section className="fec-step">
      <h1 className="fec-step-title">{title}</h1>
      <p className="fec-step-sub">{subtitle}</p>
      <div className="fec-fields">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="fec-field">
      <label className="fec-label">{label}</label>
      <input
        className="fec-input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="fec-field">
      <label className="fec-label">{label}</label>
      <select className="fec-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Row({ children }) {
  return <div className="fec-row">{children}</div>;
}

function CheckGrid({ label, options, selected, onToggle, columns = 3 }) {
  return (
    <div className="fec-field">
      <label className="fec-label">{label}</label>
      <div className="fec-check-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              className={`fec-check ${active ? "fec-check-active" : ""}`}
              onClick={() => onToggle(opt)}
            >
              <span className="fec-check-box">{active ? "✓" : ""}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ result, form, onReset }) {
  const tierColor =
    result.tier === "A" ? COLORS.forest : result.tier === "B" ? COLORS.amber : "#9AA5B1";

  return (
    <div className="fec-result-shell">
      <FormStyles />
      <div className="fec-result-card">
        <div className="fec-result-head">
          <div>
            <div className="fec-result-eyebrow">Lead analysis complete</div>
            <h1 className="fec-result-title">Thanks, {form.contactName?.split(" ")[0] || "there"} — here's your savings preview</h1>
          </div>
          <div className="fec-tier" style={{ background: tierColor }}>Tier {result.tier}</div>
        </div>

        <div className="fec-score-block">
          <div className="fec-score-label">Lead score</div>
          <div className="fec-score-row">
            <div className="fec-score-bar">
              <div className="fec-score-fill" style={{ width: `${result.score}%`, background: tierColor }} />
            </div>
            <div className="fec-score-num">{result.score}/100</div>
          </div>
          <div className="fec-score-reason">{result.tierReason}</div>
        </div>

        <div className="fec-result-grid">
          <ResultBox label="Lead summary" value={result.summary} />
          <ResultBox label="Estimated savings" value={result.estimatedSavings} accent />
          <ResultBox label="Rebate program" value={result.rebateNote} />
        </div>

        <div className="fec-email-preview">
          <div className="fec-email-label">📧 Personalized outreach (auto-generated)</div>
          <div className="fec-email-subject"><strong>Subject:</strong> {result.outreachSubject}</div>
          <div className="fec-email-body">{result.outreachOpener}</div>
        </div>

        <div className="fec-success">
          ✓ Lead logged to CRM · Slack alert sent to the sales team · You'll hear from us within one business day.
        </div>

        <button className="fec-btn fec-btn-ghost" onClick={onReset} style={{ marginTop: 20 }}>← Submit another lead</button>
      </div>
    </div>
  );
}

function ResultBox({ label, value, accent }) {
  return (
    <div className={`fec-result-box ${accent ? "fec-result-box-accent" : ""}`}>
      <div className="fec-result-box-label">{label}</div>
      <div className="fec-result-box-value">{value}</div>
    </div>
  );
}

// =================== STYLES ===================

function FormStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600&display=swap');

      .fec-shell, .fec-result-shell {
        font-family: 'Lora', Georgia, serif;
        color: ${COLORS.ink};
        background: ${COLORS.cream};
        min-height: 100vh;
      }
      .fec-shell { display: grid; grid-template-columns: 380px 1fr; }
      @media (max-width: 880px) { .fec-shell { grid-template-columns: 1fr; } }

      /* ASIDE */
      .fec-aside {
        background: ${COLORS.navy};
        color: ${COLORS.cream};
        position: sticky; top: 0; height: 100vh;
        overflow-y: auto;
      }
      @media (max-width: 880px) { .fec-aside { position: static; height: auto; } }
      .fec-aside-inner { padding: 40px 32px; }
      .fec-logo {
        font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem;
        display: flex; align-items: center; gap: 6px; color: ${COLORS.cream};
        margin-bottom: 36px;
      }
      .fec-bolt { color: ${COLORS.amber}; font-size: 1.3rem; }
      .fec-aside-head {
        font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.6rem;
        color: ${COLORS.cream}; line-height: 1.2; margin-bottom: 12px;
      }
      .fec-aside-sub { color: rgba(243,239,232,0.72); font-size: 0.98rem; line-height: 1.55; }

      .fec-benefits { list-style: none; padding: 0; margin: 32px 0; }
      .fec-benefits li {
        display: flex; gap: 10px; padding: 8px 0;
        color: rgba(243,239,232,0.92); font-size: 0.96rem;
      }
      .fec-check {
        color: ${COLORS.amber}; font-weight: 700;
      }

      .fec-utils { margin-top: 28px; }
      .fec-utils-label {
        font-family: 'Syne', sans-serif; text-transform: uppercase;
        letter-spacing: 0.12em; font-size: 0.78rem;
        color: rgba(243,239,232,0.55); display: block; margin-bottom: 12px;
      }
      .fec-utils-row { display: flex; flex-wrap: wrap; gap: 8px; }
      .fec-util-chip {
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
        padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;
        color: rgba(243,239,232,0.85); font-family: 'Syne', sans-serif;
      }

      .fec-progress-wrap { margin-top: 36px; }
      .fec-progress-label {
        font-family: 'Syne', sans-serif; font-size: 0.82rem;
        color: rgba(243,239,232,0.6); margin-bottom: 8px;
        text-transform: uppercase; letter-spacing: 0.12em;
      }
      .fec-progress-bar { height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
      .fec-progress-fill { height: 100%; background: ${COLORS.amber}; transition: width 0.3s ease; }

      /* MAIN */
      .fec-main { padding: 60px 0; overflow-y: auto; }
      .fec-main-inner { max-width: 640px; padding: 0 40px; }
      @media (max-width: 540px) { .fec-main-inner { padding: 0 20px; } }

      .fec-step-title {
        font-family: 'Syne', sans-serif; font-weight: 700; font-size: 2rem;
        color: ${COLORS.navy}; line-height: 1.15; margin-bottom: 8px;
      }
      .fec-step-sub { color: ${COLORS.muted}; font-size: 1rem; margin-bottom: 32px; }

      .fec-fields { display: flex; flex-direction: column; gap: 20px; }
      .fec-field { display: flex; flex-direction: column; gap: 8px; }
      .fec-label {
        font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.92rem;
        color: ${COLORS.navy};
      }
      .fec-input {
        font-family: 'Lora', serif; font-size: 1rem;
        padding: 12px 14px; border: 1.5px solid ${COLORS.line};
        border-radius: 10px; background: #fff;
        color: ${COLORS.ink}; outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .fec-input:focus { border-color: ${COLORS.amber}; box-shadow: 0 0 0 3px rgba(245,166,35,0.15); }
      .fec-textarea { resize: vertical; font-family: 'Lora', serif; }

      .fec-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      @media (max-width: 540px) { .fec-row { grid-template-columns: 1fr; } }

      .fec-check-grid { display: grid; gap: 10px; }
      @media (max-width: 540px) { .fec-check-grid { grid-template-columns: 1fr 1fr !important; } }
      .fec-check {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; border: 1.5px solid ${COLORS.line};
        border-radius: 10px; background: #fff; cursor: pointer;
        font-family: 'Lora', serif; font-size: 0.94rem; color: ${COLORS.ink};
        text-align: left; transition: all 0.15s ease;
      }
      .fec-check:hover { border-color: ${COLORS.amber}; }
      .fec-check-active { background: rgba(245,166,35,0.08); border-color: ${COLORS.amber}; }
      .fec-check-box {
        width: 20px; height: 20px; border-radius: 5px;
        border: 1.5px solid ${COLORS.line}; background: #fff;
        display: flex; align-items: center; justify-content: center;
        color: ${COLORS.navy}; font-weight: 700; font-size: 0.8rem;
        flex-shrink: 0;
      }
      .fec-check-active .fec-check-box { background: ${COLORS.amber}; border-color: ${COLORS.amber}; color: ${COLORS.navy}; }

      .fec-file {
        display: flex; align-items: center; gap: 8px;
        padding: 14px; border: 1.5px dashed ${COLORS.line}; border-radius: 10px;
        background: #fff; cursor: pointer; font-size: 0.95rem;
        color: ${COLORS.muted};
      }
      .fec-file input { display: none; }
      .fec-file:hover { border-color: ${COLORS.amber}; color: ${COLORS.navy}; }

      .fec-promise {
        margin-top: 8px; padding: 18px 20px; border-radius: 12px;
        background: rgba(46,125,50,0.08); border: 1px solid rgba(46,125,50,0.2);
        color: ${COLORS.ink}; font-size: 0.95rem; line-height: 1.55;
      }
      .fec-promise strong { color: ${COLORS.forest}; font-family: 'Syne', sans-serif; }

      .fec-nav {
        display: flex; align-items: center; gap: 14px;
        margin-top: 36px; padding-top: 24px; border-top: 1px solid ${COLORS.line};
      }
      .fec-btn {
        font-family: 'Syne', sans-serif; font-weight: 700;
        padding: 13px 24px; border-radius: 10px; border: none; cursor: pointer;
        font-size: 0.98rem; transition: transform 0.15s ease, background 0.15s ease;
      }
      .fec-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .fec-btn-primary { background: ${COLORS.amber}; color: ${COLORS.navy}; }
      .fec-btn-primary:hover:not(:disabled) { background: #FFC15E; transform: translateY(-1px); }
      .fec-btn-ghost { background: transparent; color: ${COLORS.navy}; }
      .fec-btn-ghost:hover { background: rgba(10,37,64,0.06); }

      .fec-error {
        margin-top: 20px; padding: 14px; border-radius: 10px;
        background: #FEF2F2; color: #991B1B; font-size: 0.95rem;
        border: 1px solid #FECACA;
      }

      .fec-loading {
        margin-top: 24px; padding: 20px; border-radius: 12px;
        background: ${COLORS.navy}; color: ${COLORS.cream};
        display: flex; align-items: center; gap: 16px;
      }
      .fec-spinner {
        width: 36px; height: 36px; border-radius: 50%;
        border: 3px solid rgba(245,166,35,0.2); border-top-color: ${COLORS.amber};
        animation: fec-spin 0.8s linear infinite; flex-shrink: 0;
      }
      @keyframes fec-spin { to { transform: rotate(360deg); } }
      .fec-loading-title { font-family: 'Syne', sans-serif; font-weight: 600; }
      .fec-loading-sub { color: rgba(243,239,232,0.7); font-size: 0.9rem; margin-top: 4px; }

      /* RESULT */
      .fec-result-shell {
        min-height: 100vh; padding: 60px 24px;
        display: flex; align-items: flex-start; justify-content: center;
      }
      .fec-result-card {
        max-width: 740px; width: 100%; background: #fff;
        border-radius: 18px; padding: 44px;
        box-shadow: 0 16px 60px rgba(10,37,64,0.12);
        border: 1px solid ${COLORS.line};
      }
      .fec-result-head {
        display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
        margin-bottom: 32px;
      }
      .fec-result-eyebrow {
        font-family: 'Syne', sans-serif; color: ${COLORS.forest};
        text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.78rem;
        font-weight: 600; margin-bottom: 8px;
      }
      .fec-result-title {
        font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.7rem;
        color: ${COLORS.navy}; line-height: 1.2;
      }
      .fec-tier {
        font-family: 'Syne', sans-serif; font-weight: 800; color: #fff;
        padding: 10px 18px; border-radius: 30px; font-size: 0.95rem;
        flex-shrink: 0; letter-spacing: 0.04em;
      }

      .fec-score-block {
        background: ${COLORS.cream}; border-radius: 12px;
        padding: 22px; margin-bottom: 28px;
      }
      .fec-score-label {
        font-family: 'Syne', sans-serif; color: ${COLORS.muted};
        text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.78rem;
        margin-bottom: 10px;
      }
      .fec-score-row { display: flex; align-items: center; gap: 14px; }
      .fec-score-bar {
        flex: 1; height: 10px; background: rgba(10,37,64,0.08);
        border-radius: 5px; overflow: hidden;
      }
      .fec-score-fill { height: 100%; transition: width 0.6s ease; }
      .fec-score-num {
        font-family: 'Syne', sans-serif; font-weight: 800;
        color: ${COLORS.navy}; font-size: 1.1rem;
      }
      .fec-score-reason { margin-top: 10px; font-size: 0.94rem; color: ${COLORS.muted}; }

      .fec-result-grid {
        display: grid; grid-template-columns: repeat(3, 1fr);
        gap: 14px; margin-bottom: 28px;
      }
      @media (max-width: 640px) { .fec-result-grid { grid-template-columns: 1fr; } }
      .fec-result-box {
        background: ${COLORS.cream}; border: 1px solid ${COLORS.line};
        border-radius: 12px; padding: 18px;
      }
      .fec-result-box-accent {
        background: rgba(245,166,35,0.1); border-color: rgba(245,166,35,0.3);
      }
      .fec-result-box-label {
        font-family: 'Syne', sans-serif; color: ${COLORS.muted};
        text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.74rem;
        margin-bottom: 8px;
      }
      .fec-result-box-value { color: ${COLORS.ink}; font-size: 0.98rem; line-height: 1.45; }

      .fec-email-preview {
        background: ${COLORS.navy}; color: ${COLORS.cream};
        border-radius: 12px; padding: 22px; margin-bottom: 24px;
      }
      .fec-email-label {
        font-family: 'Syne', sans-serif; color: ${COLORS.amber};
        text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.78rem;
        margin-bottom: 12px;
      }
      .fec-email-subject {
        color: ${COLORS.cream}; font-family: 'Syne', sans-serif;
        margin-bottom: 10px; font-size: 0.98rem;
      }
      .fec-email-body { color: rgba(243,239,232,0.85); line-height: 1.6; font-size: 0.95rem; }

      .fec-success {
        padding: 16px 20px; border-radius: 10px;
        background: rgba(46,125,50,0.1); color: ${COLORS.forest};
        font-family: 'Syne', sans-serif; font-weight: 500;
        border: 1px solid rgba(46,125,50,0.25);
      }
    `}</style>
  );
}
