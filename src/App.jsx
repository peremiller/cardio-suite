import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartBar,
  Check,
  CheckCircle,
  Clock,
  DotsThreeCircle,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  Faders,
  FloppyDisk,
  FunnelSimple,
  Gear,
  Heartbeat,
  House,
  IdentificationCard,
  Info,
  List,
  MagnifyingGlass,
  PaperPlaneTilt,
  PencilSimple,
  Plus,
  Pulse,
  ShieldCheck,
  SignOut,
  Siren,
  Trash,
  User,
  UserPlus,
  UsersThree,
  Warning,
  X,
} from "@phosphor-icons/react";
import {
  authenticate,
  createAccount,
  listAccounts,
  restoreSession,
  roleLabels,
  signOut,
  startSession,
} from "./auth.js";

const patients = [
  { id: "john", initials: "JD", name: "John Doe", age: 72, sex: "Male", time: "09:05 AM", status: "In Room", tone: "green", mrn: "12345678", dob: "05/14/1954", visit: "Routine Follow-up", room: "Exam Room 3" },
  { id: "mary", initials: "MB", name: "Mary Brown", age: 68, sex: "Female", time: "08:55 AM", status: "Waiting", tone: "amber", mrn: "16844302", dob: "11/02/1957", visit: "Chest Pain Review", room: "Waiting Area", alert: true },
  { id: "robert", initials: "RL", name: "Robert Lee", age: 59, sex: "Male", time: "08:40 AM", status: "Checked In", tone: "slate", mrn: "20194331", dob: "08/21/1966", visit: "Post-PCI Checkup", room: "Exam Room 1" },
  { id: "anna", initials: "AS", name: "Anna Smith", age: 64, sex: "Female", time: "08:30 AM", status: "In Room", tone: "green", mrn: "18097214", dob: "04/19/1961", visit: "Hypertension Follow-up", room: "Exam Room 2" },
  { id: "thomas", initials: "TW", name: "Thomas Wright", age: 71, sex: "Male", time: "08:15 AM", status: "Waiting", tone: "amber", mrn: "15284309", dob: "02/08/1955", visit: "ECG Review", room: "Waiting Area" },
  { id: "linda", initials: "LP", name: "Linda Perez", age: 66, sex: "Female", time: "08:05 AM", status: "Checked In", tone: "slate", mrn: "18922018", dob: "07/30/1959", visit: "Medication Review", room: "Intake 1" },
  { id: "james", initials: "JM", name: "James Miller", age: 58, sex: "Male", time: "07:50 AM", status: "Waiting", tone: "amber", mrn: "22090387", dob: "01/17/1968", visit: "New Patient Consult", room: "Waiting Area" },
  { id: "david", initials: "DC", name: "David Chen", age: 63, sex: "Male", time: "07:40 AM", status: "Checked In", tone: "slate", mrn: "19734552", dob: "10/09/1962", visit: "Routine Follow-up", room: "Intake 2" },
];

const navItems = [
  { id: "home", label: "Home", Icon: House, roles: ["medical-assistant", "cardiologist", "receptionist", "clinic-admin"] },
  { id: "rooming", label: "Rooming & Intake", Icon: User, roles: ["medical-assistant", "cardiologist", "clinic-admin"] },
  { id: "ecg", label: "12-Lead ECG & Diagnostics", Icon: Pulse, roles: ["medical-assistant", "cardiologist", "clinic-admin"] },
  { id: "schedule", label: "Schedule & Pre-Auth", Icon: CalendarBlank, roles: ["medical-assistant", "cardiologist", "receptionist", "clinic-admin"] },
  { id: "triage", label: "Triage & Escalations", Icon: Siren, roles: ["medical-assistant", "cardiologist", "clinic-admin"] },
  { id: "scope", label: "Scope Guidelines", Icon: ShieldCheck, roles: ["medical-assistant", "cardiologist", "receptionist", "clinic-admin"] },
  { id: "reports", label: "Reports & Dashboards", Icon: ChartBar, roles: ["cardiologist", "clinic-admin"] },
  { id: "messages", label: "Messages", Icon: DotsThreeCircle, roles: ["medical-assistant", "cardiologist", "receptionist", "clinic-admin"] },
  { id: "resources", label: "Resources", Icon: BookOpen, roles: ["medical-assistant", "cardiologist", "receptionist", "clinic-admin"] },
  { id: "settings", label: "Settings", Icon: Gear, roles: ["clinic-admin"] },
];

const moduleCopy = {
  home: ["Clinic overview", "Review today’s workload, pending handoffs, and care-team activity."],
  ecg: ["12-Lead ECG & Diagnostics", "Prepare ECG captures and route completed diagnostic records to the cardiologist."],
  schedule: ["Schedule & Pre-Authorization", "Coordinate appointments, insurance checks, and required authorizations."],
  triage: ["Triage & Escalations", "Capture patient-reported symptoms and escalate red flags within staff scope."],
  scope: ["Assistant Scope Guidelines", "Review collection, documentation, and escalation boundaries for clinic staff."],
  reports: ["Reports & Dashboards", "Track clinic throughput, intake completion, and physician handoff performance."],
  messages: ["Care Team Messages", "Coordinate patient follow-ups and internal clinic work."],
  resources: ["Clinical Resources", "Access approved procedures, scripts, and patient education materials."],
  settings: ["Workspace Settings", "Manage clinic preferences, roles, and staff accounts."],
};

function initialsFor(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function Logo() {
  return (
    <div className="brand-lockup" aria-label="CardioSuite Clinical Workspace">
      <span className="brand-mark"><Heartbeat size={28} weight="regular" /></span>
      <span>
        <strong>CardioSuite</strong>
        <small>Clinical Workspace</small>
      </span>
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "medical-assistant",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        onAuthenticated(await authenticate(form.email, form.password));
      } else {
        if (form.password.length < 8) {
          throw new Error("Use at least 8 characters for the password.");
        }
        const account = await createAccount(form);
        startSession(account);
        onAuthenticated(account);
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Logo />
        <div className="auth-brand-copy">
          <span className="eyebrow">Clinical operations, coordinated</span>
          <h1>Move every patient from arrival to physician handoff with confidence.</h1>
          <p>
            A shared cardiology workspace for rooming, diagnostics, scheduling,
            triage, and staff-to-physician handoffs.
          </p>
        </div>
        <div className="trust-row">
          <span><ShieldCheck size={19} /> Role-aware access</span>
          <span><UsersThree size={19} /> Individual staff accounts</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-auth-logo"><Logo /></div>
          <span className="auth-kicker">{mode === "login" ? "Welcome back" : "New staff access"}</span>
          <h2>{mode === "login" ? "Sign in to CardioSuite" : "Create a staff account"}</h2>
          <p className="auth-intro">
            {mode === "login"
              ? "Use your individual clinic account to continue."
              : "Create a local demonstration account for this workspace."}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === "create" && (
              <label>
                Full name
                <span className="input-wrap">
                  <IdentificationCard size={18} />
                  <input value={form.name} onChange={update("name")} required placeholder="e.g. Jordan Reyes" />
                </span>
              </label>
            )}
            <label>
              Work email
              <span className="input-wrap">
                <EnvelopeSimple size={18} />
                <input type="email" value={form.email} onChange={update("email")} required autoComplete="email" />
              </span>
            </label>
            {mode === "create" && (
              <label>
                Role
                <span className="input-wrap">
                  <UsersThree size={18} />
                  <select value={form.role} onChange={update("role")}>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </span>
              </label>
            )}
            <label>
              Password
              <span className="input-wrap">
                <ShieldCheck size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update("password")}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {error && <div className="form-error" role="alert"><Warning size={18} /> {error}</div>}

            <button className="primary-button auth-submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in securely" : "Create account"}
              <CaretRight size={18} />
            </button>
          </form>

          <button
            className="text-button auth-mode"
            onClick={() => {
              setError("");
              setMode((current) => (current === "login" ? "create" : "login"));
            }}
          >
            {mode === "login" ? <><UserPlus size={17} /> Create a staff account</> : <><ArrowLeft size={17} /> Back to sign in</>}
          </button>

          <div className="demo-notice">
            <Info size={18} />
            <span><strong>Demonstration workspace.</strong> Do not enter real patient or protected health information.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function UserMenu({ user, onSignOut, onManageTeam }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="user-menu">
      <button className="user-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="avatar" style={{ "--avatar-color": user.color }}>{user.initials}</span>
        <span className="user-copy"><strong>{user.name}</strong><small>{user.title}</small></span>
        <CaretDown size={15} />
      </button>
      {open && (
        <div className="user-popover">
          <div className="popover-user">
            <span className="avatar" style={{ "--avatar-color": user.color }}>{user.initials}</span>
            <span><strong>{user.name}</strong><small>{user.email}</small></span>
          </div>
          <span className="role-pill">{roleLabels[user.role]}</span>
          <button onClick={() => { setOpen(false); onManageTeam(); }}><UsersThree size={18} /> Staff accounts</button>
          <button onClick={onSignOut}><SignOut size={18} /> Switch account / sign out</button>
        </div>
      )}
    </div>
  );
}

function Header({ user, onSignOut, onManageTeam, onMenu, onNotice }) {
  return (
    <header className="app-header">
      <div className="header-brand"><Logo /></div>
      <button className="mobile-menu-button" onClick={onMenu} aria-label="Open navigation"><List size={24} /></button>
      <button className="clinic-switcher" onClick={() => onNotice("Clinic switching is ready for additional locations.")}>
        <Buildings size={21} />
        <span>Heart &amp; Vascular Clinic</span>
        <CaretDown size={14} />
      </button>
      <label className="global-search">
        <MagnifyingGlass size={18} />
        <input placeholder="Search patients, charts, or tasks…" aria-label="Search patients, charts, or tasks" />
        <kbd>⌘ K</kbd>
      </label>
      <div className="header-date"><CalendarBlank size={20} /><span>July 26, 2026</span></div>
      <button className="team-presence" onClick={onManageTeam}>
        <span className="presence-label">Team</span>
        <span className="avatar-stack">
          {listAccounts().slice(0, 3).map((account) => (
            <span className="avatar avatar-tiny" style={{ "--avatar-color": account.color }} key={account.id}>{account.initials}</span>
          ))}
          <span className="avatar avatar-tiny more">+{Math.max(0, listAccounts().length - 3)}</span>
        </span>
      </button>
      <button className="notification-button" onClick={() => onNotice("You have 3 clinic notifications.")} aria-label="Notifications">
        <Bell size={22} />
        <span>3</span>
      </button>
      <UserMenu user={user} onSignOut={onSignOut} onManageTeam={onManageTeam} />
    </header>
  );
}

function Navigation({ user, active, onChange, open, onClose }) {
  const available = navItems.filter((item) => item.roles.includes(user.role));
  return (
    <>
      {open && <button className="mobile-scrim" onClick={onClose} aria-label="Close navigation" />}
      <nav className={open ? "main-nav mobile-open" : "main-nav"} aria-label="Main navigation">
        <div className="mobile-nav-head"><Logo /><button onClick={onClose} aria-label="Close navigation"><X size={22} /></button></div>
        <div className="nav-list">
          {available.map(({ id, label, Icon }) => (
            <button className={active === id ? "nav-item active" : "nav-item"} key={id} onClick={() => { onChange(id); onClose(); }}>
              <Icon size={24} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <button className="collapse-button"><CaretLeft size={19} /> <span>Collapse</span></button>
      </nav>
    </>
  );
}

function PatientQueue({ selected, onSelect, completed, onToggleMobile }) {
  const [query, setQuery] = useState("");
  const visible = patients.filter((patient) => patient.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <aside className="patient-queue">
      <div className="queue-head">
        <div><h2>Today&apos;s Arrivals <span>8</span></h2><button className="queue-close-mobile" onClick={onToggleMobile}><X size={18} /></button></div>
        <div className="queue-search">
          <MagnifyingGlass size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search patients…" />
          <FunnelSimple size={18} />
        </div>
        <div className="queue-tabs"><button className="active">All <b>8</b></button><button>In Room <b>3</b></button><button>Ready <b>{completed ? 2 : 1}</b></button></div>
      </div>
      <div className="patient-list">
        {visible.map((patient) => (
          <button key={patient.id} className={selected.id === patient.id ? "patient-row selected" : "patient-row"} onClick={() => onSelect(patient)}>
            <span className="avatar patient-avatar">{patient.initials}</span>
            <span className="patient-copy">
              <span><strong>{patient.name}</strong><em className={`status ${patient.tone}`}>{completed && patient.id === selected.id ? "Ready" : patient.status}</em></span>
              <small>{patient.age} y/o <i>•</i> {patient.sex}</small>
              <small>{patient.time}</small>
            </span>
            {patient.alert && <Warning className="patient-alert" size={17} />}
          </button>
        ))}
      </div>
      <div className="queue-update">Updated 09:24 AM <Clock size={15} /></div>
    </aside>
  );
}

function PatientHeader({ patient }) {
  return (
    <section className="patient-header">
      <div className="patient-identity">
        <span className="avatar patient-large">{patient.initials}</span>
        <span><h2>{patient.name}</h2><p>{patient.age} y/o <i>•</i> {patient.sex} <i>•</i> MRN: {patient.mrn}</p><p>DOB: {patient.dob}</p></span>
      </div>
      <div className="patient-meta"><span><small>Visit Type</small><strong>{patient.visit} <PencilSimple size={14} /></strong></span><span><small>Provider</small><strong>Dr. Michael Anderson</strong></span><span><small>Location</small><strong>{patient.room}</strong></span></div>
      <span className="scope-badge"><Warning size={17} weight="fill" /> Assistant Scope Guard Active</span>
    </section>
  );
}

function StepTabs({ active, onChange, complete }) {
  const steps = [
    ["intake", "Intake & Vitals"],
    ["medication", "Med Reconciliation"],
    ["history", "History"],
    ["handoff", "Handoff Readiness"],
  ];
  return (
    <div className="step-tabs" role="tablist">
      {steps.map(([id, label], index) => (
        <button key={id} className={active === id ? "step-tab active" : "step-tab"} onClick={() => onChange(id)} role="tab">
          <span>{complete && index < 3 ? <Check size={14} weight="bold" /> : index + 1}</span>{label}
        </button>
      ))}
    </div>
  );
}

function IntakeForm({ patient, activeStep, onStep, onReady, notify }) {
  const draftKey = `cardiosuite.draft.${patient.id}`;
  const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
  const [values, setValues] = useState(saved || {
    systolic: "120",
    diastolic: "80",
    heartRate: "72",
    spo2: "98",
    weight: "175",
    height: "68",
    medications: "Lisinopril 10 mg PO daily; Metoprolol Succinate 25 mg PO daily; Aspirin 81 mg PO daily; Atorvastatin 40 mg PO nightly.",
    history: "Patient reports intermittent chest tightness with exertion over the past week, resolves with rest. Denies shortness of breath at rest.",
    notes: "",
  });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const nextSaved = JSON.parse(localStorage.getItem(`cardiosuite.draft.${patient.id}`) || "null");
    setValues(nextSaved || {
      systolic: patient.alert ? "178" : "120",
      diastolic: patient.alert ? "104" : "80",
      heartRate: patient.alert ? "108" : "72",
      spo2: patient.alert ? "94" : "98",
      weight: patient.id === "mary" ? "162" : "175",
      height: patient.id === "mary" ? "64" : "68",
      medications: patient.id === "john" ? "Lisinopril 10 mg PO daily; Metoprolol Succinate 25 mg PO daily; Aspirin 81 mg PO daily; Atorvastatin 40 mg PO nightly." : "",
      history: patient.alert
        ? "Patient reports new chest pressure and increased fatigue since yesterday."
        : patient.id === "john"
          ? "Patient reports intermittent chest tightness with exertion over the past week, resolves with rest. Denies shortness of breath at rest."
          : "",
      notes: "",
    });
    setSent(false);
  }, [patient.id]);

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const bmi = useMemo(() => {
    const weight = Number(values.weight);
    const height = Number(values.height);
    return weight && height ? ((weight / (height * height)) * 703).toFixed(1) : "--";
  }, [values.weight, values.height]);
  const redFlag = Number(values.systolic) >= 180 || Number(values.diastolic) >= 110 || Number(values.spo2) <= 90 || Number(values.heartRate) >= 120 || Number(values.heartRate) <= 40;

  function saveDraft() {
    localStorage.setItem(draftKey, JSON.stringify(values));
    notify("Draft saved to this staff account.");
  }

  function clearForm() {
    localStorage.removeItem(draftKey);
    setValues((current) => ({ ...current, medications: "", history: "", notes: "", systolic: "", diastolic: "", heartRate: "", spo2: "", weight: "", height: "" }));
    notify("Intake form cleared.");
  }

  function sendHandoff() {
    if (!values.systolic || !values.diastolic || !values.heartRate || !values.spo2 || !values.history) {
      notify("Complete the required vitals and history before handoff.", "warning");
      return;
    }
    setSent(true);
    onReady();
    onStep("handoff");
    localStorage.removeItem(draftKey);
    notify(redFlag ? "Red flag detected—physician alerted immediately." : "Handoff sent to Dr. Michael Anderson.");
  }

  return (
    <div className="clinical-body">
      <section className="intake-canvas">
        <div className="section-heading">
          <div><h2>{activeStep === "handoff" ? "Handoff Readiness" : "Intake & Vital Signs"}</h2><p>{sent ? "Sent to physician at 09:24 AM" : "Captured 09:24 AM"} <Check size={15} weight="bold" /></p></div>
          <button className="outline-small"><PencilSimple size={15} /> Edit</button>
        </div>

        {activeStep === "handoff" ? (
          <div className="handoff-complete">
            <span><CheckCircle size={54} weight="fill" /></span>
            <h3>{sent ? "Physician handoff sent" : "Review the intake before sending"}</h3>
            <p>{sent ? `Dr. Michael Anderson has been notified that ${patient.name}'s intake is ready.` : "All required intake sections are ready for final review."}</p>
            {!sent && <button className="primary-button" onClick={sendHandoff}><PaperPlaneTilt size={20} /> Send handoff to physician</button>}
          </div>
        ) : (
          <>
            <fieldset className="form-section">
              <legend><span>1</span> Vital Signs</legend>
              <div className="vitals-grid">
                <label>BP (Systolic)<span className="unit-input"><input type="number" value={values.systolic} onChange={update("systolic")} /><em>mmHg</em></span></label>
                <label>BP (Diastolic)<span className="unit-input"><input type="number" value={values.diastolic} onChange={update("diastolic")} /><em>mmHg</em></span></label>
                <label>HR (BPM)<span className="unit-input"><input type="number" value={values.heartRate} onChange={update("heartRate")} /><em>bpm</em></span></label>
                <label>SpO₂ (%)<span className="unit-input"><input type="number" value={values.spo2} onChange={update("spo2")} /><em>%</em></span></label>
                <label>Weight<span className="unit-input"><input type="number" value={values.weight} onChange={update("weight")} /><em>lbs</em></span></label>
                <label>Height<span className="unit-input"><input type="number" value={values.height} onChange={update("height")} /><em>in</em></span></label>
                <label className="bmi-field">BMI (calc.)<span className="unit-input readonly"><input value={bmi} readOnly /><em>kg/m²</em></span></label>
              </div>
            </fieldset>

            <div className="narrative-grid">
              <label>Reconciled Medication List
                <textarea value={values.medications} onChange={update("medications")} placeholder="List verified medications, dosage, route, and frequency…" />
                <small>Last verified 09:20 AM <Check size={14} weight="bold" /></small>
              </label>
              <label>Chief Complaint / History
                <textarea value={values.history} onChange={update("history")} placeholder="Capture the patient’s statements in their own words…" />
                <small>{values.history.length} / 1000</small>
              </label>
            </div>
            <label className="notes-field">Additional Notes <span>(optional)</span>
              <textarea value={values.notes} onChange={update("notes")} placeholder="Add any relevant intake notes…" />
              <small>{values.notes.length} / 500</small>
            </label>
          </>
        )}

        {activeStep !== "handoff" && (
          <div className="form-actions">
            <button className="primary-button" onClick={sendHandoff}><PaperPlaneTilt size={21} /> Send handoff to physician</button>
            <button className="secondary-button" onClick={saveDraft}><FloppyDisk size={19} /> Save draft</button>
            <button className="tertiary-button" onClick={clearForm}><Trash size={18} /> Clear</button>
          </div>
        )}
      </section>

      <HandoffPanel values={values} bmi={bmi} redFlag={redFlag} sent={sent} onStep={onStep} />
    </div>
  );
}

function HandoffPanel({ values, bmi, redFlag, sent, onStep }) {
  const vitals = [
    ["BP", `${values.systolic || "--"}/${values.diastolic || "--"}`, "mmHg", Number(values.systolic) >= 180 || Number(values.diastolic) >= 110],
    ["HR", values.heartRate || "--", "bpm", Number(values.heartRate) >= 120 || Number(values.heartRate) <= 40],
    ["SpO₂", `${values.spo2 || "--"}%`, "", Number(values.spo2) <= 90],
    ["BMI", bmi, "kg/m²", false],
  ];
  return (
    <aside className="handoff-panel">
      <div className="panel-heading"><h2>Clinical Handoff Panel</h2><small>Last updated 09:24 AM <Clock size={14} /></small></div>
      <div className="scope-card"><ShieldCheck size={24} /><span><strong>Scope Guard Active</strong><small>You can collect and document intake data. Clinical decisions remain with the physician.</small></span></div>
      <div className="panel-section">
        <div className="panel-subhead"><h3>Live Intake Vitals</h3><small>Updated just now</small></div>
        <div className="vital-cards">
          {vitals.map(([label, value, unit, alert]) => (
            <div className={alert ? "vital-card alert" : "vital-card"} key={label}><small>{label}</small><strong>{value}</strong><em>{unit}</em><span>{alert ? "Review" : label === "BMI" ? "Overweight" : "Normal"}</span></div>
          ))}
        </div>
      </div>
      <div className="panel-section">
        <h3>Red-Flag Escalation Rules <Info size={16} /></h3>
        <ul className="rules-list">
          <li><Siren size={17} /> BP ≥ 180/110 mmHg <b>{Number(values.systolic) >= 180 || Number(values.diastolic) >= 110 ? "Yes" : "No"}</b></li>
          <li><Warning size={17} /> SpO₂ ≤ 90% <b>{Number(values.spo2) <= 90 ? "Yes" : "No"}</b></li>
          <li><Warning size={17} /> HR ≥ 120 bpm or ≤ 40 bpm <b>{Number(values.heartRate) >= 120 || Number(values.heartRate) <= 40 ? "Yes" : "No"}</b></li>
        </ul>
        <div className={redFlag ? "red-flag detected" : "red-flag"}>{redFlag ? <Warning size={18} weight="fill" /> : <CheckCircle size={18} weight="fill" />} {redFlag ? "Critical threshold detected" : "No critical red flags detected"}</div>
      </div>
      <div className="panel-section readiness">
        <div className="panel-subhead"><h3>Handoff Readiness</h3><small>{sent ? "4 of 4 complete" : "3 of 4 complete"}</small></div>
        <button onClick={() => onStep("intake")}><CheckCircle size={18} weight="fill" /> Intake &amp; Vitals <span>Captured 09:24 AM</span></button>
        <button onClick={() => onStep("medication")}><CheckCircle size={18} weight="fill" /> Medication Reconciliation <span>Verified 09:20 AM</span></button>
        <button onClick={() => onStep("history")}><CheckCircle size={18} weight="fill" /> Chief Complaint / History <span>Captured 09:22 AM</span></button>
        <button onClick={() => onStep("handoff")}>{sent ? <CheckCircle size={18} weight="fill" /> : <span className="empty-check" />} Handoff Readiness <span>{sent ? "Sent" : "Pending"}</span></button>
        <p><Info size={18} /> {sent ? "Physician notification delivered." : "Review all sections and send the handoff to notify the physician."}</p>
      </div>
    </aside>
  );
}

function ModuleView({ active, user, onManageTeam }) {
  const [title, description] = moduleCopy[active] || moduleCopy.home;
  const isSettings = active === "settings";
  return (
    <section className="module-view">
      <span className="module-icon">{isSettings ? <Gear size={28} /> : <Heartbeat size={28} />}</span>
      <span className="eyebrow">CardioSuite workspace</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="module-summary">
        <div><strong>{active === "home" ? "8" : "Ready"}</strong><span>{active === "home" ? "Today’s arrivals" : "Module workspace"}</span></div>
        <div><strong>3</strong><span>Items needing attention</span></div>
        <div><strong>{roleLabels[user.role]}</strong><span>Your access level</span></div>
      </div>
      {isSettings && <button className="primary-button" onClick={onManageTeam}><UsersThree size={20} /> Manage staff accounts</button>}
    </section>
  );
}

function TeamDialog({ user, onClose, onCreated }) {
  const [accounts, setAccounts] = useState(listAccounts());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "medical-assistant" });
  const [error, setError] = useState("");
  const canAdd = user.role === "clinic-admin";

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await createAccount(form);
      setAccounts(listAccounts());
      setAdding(false);
      setForm({ name: "", email: "", password: "", role: "medical-assistant" });
      onCreated();
    } catch (accountError) {
      setError(accountError.message);
    }
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="team-dialog" role="dialog" aria-modal="true" aria-label="Staff accounts">
        <div className="dialog-head"><div><span className="eyebrow">Heart &amp; Vascular Clinic</span><h2>Staff accounts</h2><p>{accounts.length} people have individual access.</p></div><button onClick={onClose} aria-label="Close"><X size={22} /></button></div>
        <div className="account-list">
          {accounts.map((account) => (
            <div className="account-row" key={account.id}>
              <span className="avatar" style={{ "--avatar-color": account.color }}>{account.initials}</span>
              <span><strong>{account.name}{account.id === user.id && <em>You</em>}</strong><small>{account.email}</small></span>
              <span className="account-role">{roleLabels[account.role]}</span>
              <span className="active-dot"><i /> Active</span>
            </div>
          ))}
        </div>
        {canAdd && !adding && <button className="secondary-button add-account" onClick={() => setAdding(true)}><UserPlus size={19} /> Add staff account</button>}
        {adding && (
          <form className="add-account-form" onSubmit={submit}>
            <h3>Add staff account</h3>
            <div><label>Full name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label></div>
            <div><label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>{Object.entries(roleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Temporary password<input type="password" minLength="8" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label></div>
            {error && <div className="form-error">{error}</div>}
            <div className="dialog-actions"><button type="button" className="tertiary-button" onClick={() => setAdding(false)}>Cancel</button><button className="primary-button"><Plus size={17} /> Create account</button></div>
          </form>
        )}
        {!canAdd && <p className="permission-note"><ShieldCheck size={18} /> Only clinic administrators can add or change staff accounts.</p>}
      </section>
    </div>
  );
}

function Workspace({ user, onSignOut }) {
  const [activeNav, setActiveNav] = useState(user.role === "receptionist" ? "schedule" : "rooming");
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);
  const [activeStep, setActiveStep] = useState("intake");
  const [completed, setCompleted] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [mobileQueue, setMobileQueue] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }

  return (
    <div className="app-shell">
      <Header user={user} onSignOut={onSignOut} onManageTeam={() => setTeamOpen(true)} onMenu={() => setMobileNav(true)} onNotice={notify} />
      <Navigation user={user} active={activeNav} onChange={setActiveNav} open={mobileNav} onClose={() => setMobileNav(false)} />
      {activeNav === "rooming" ? (
        <>
          <button className="mobile-queue-toggle" onClick={() => setMobileQueue((value) => !value)}><UsersThree size={19} /> Today&apos;s arrivals <span>8</span></button>
          <div className={mobileQueue ? "queue-slot open" : "queue-slot"}>
            <PatientQueue selected={selectedPatient} onSelect={(patient) => { setSelectedPatient(patient); setCompleted(false); setActiveStep("intake"); setMobileQueue(false); }} completed={completed} onToggleMobile={() => setMobileQueue(false)} />
          </div>
          <main className="clinical-shell">
            <PatientHeader patient={selectedPatient} />
            <StepTabs active={activeStep} onChange={setActiveStep} complete={completed} />
            <IntakeForm patient={selectedPatient} activeStep={activeStep} onStep={setActiveStep} onReady={() => setCompleted(true)} notify={notify} />
          </main>
        </>
      ) : (
        <main className="module-shell"><ModuleView active={activeNav} user={user} onManageTeam={() => setTeamOpen(true)} /></main>
      )}
      {teamOpen && <TeamDialog user={user} onClose={() => setTeamOpen(false)} onCreated={() => notify("Staff account created.")} />}
      {toast && <div className={`toast ${toast.type}`} role="status">{toast.type === "warning" ? <Warning size={19} /> : <CheckCircle size={19} weight="fill" />}{toast.message}</div>}
    </div>
  );
}

export function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    restoreSession().then(setUser);
  }, []);

  if (user === undefined) {
    return <div className="loading-screen"><Heartbeat size={36} /><span>Opening CardioSuite…</span></div>;
  }
  if (!user) return <AuthScreen onAuthenticated={setUser} />;

  return (
    <Workspace
      user={user}
      onSignOut={() => {
        signOut();
        setUser(null);
      }}
    />
  );
}
