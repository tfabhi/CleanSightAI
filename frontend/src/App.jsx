import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const blankForm = { reporterName: "", location: "", description: "", category: "Auto-detect" };

function App() {
  const [role, setRole] = useState("Citizen");
  const [workerName, setWorkerName] = useState("Ravi");
  const [form, setForm] = useState(blankForm);
  const [image, setImage] = useState(null);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [reportsRes, analyticsRes] = await Promise.all([
        fetch(`${API}/api/complaints`), fetch(`${API}/api/analytics`)
      ]);
      if (!reportsRes.ok || !analyticsRes.ok) throw new Error("Could not load server data.");
      setReports(await reportsRes.json());
      setAnalytics(await analyticsRes.json());
      setError("");
    } catch {
      setError("Cannot connect to backend. Start the backend server on port 5000.");
    }
  }

  useEffect(() => { loadData(); }, []);

  const visibleReports = useMemo(() => {
    if (role === "Worker") return reports.filter(r => r.assignedWorker === workerName);
    if (role === "Citizen") return reports.filter(r => r.reporterName.toLowerCase() === form.reporterName.trim().toLowerCase() && form.reporterName.trim());
    return reports;
  }, [reports, role, workerName, form.reporterName]);

  async function submitReport(event) {
    event.preventDefault();
    setMessage(""); setError("");
    if (!image) return setError("Please choose an image before submitting.");
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.set("category", form.category === "Auto-detect" ? "" : form.category);
    data.append("image", image);
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/complaints`, { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Report submission failed.");
      setMessage(`Report submitted. Classification: ${result.classification.label}.`);
      setForm(blankForm); setImage(null);
      document.getElementById("imageInput").value = "";
      await loadData();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function updateReport(id, updates) {
    setError(""); setMessage("");
    try {
      const response = await fetch(`${API}/api/complaints/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Update failed.");
      setMessage("Complaint updated.");
      await loadData();
    } catch (e) { setError(e.message); }
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">✓</span><div><strong>CleanSight AI</strong><small>Smart Public Cleanliness Tracker</small></div></div>
      <div className="role-switch"><label htmlFor="role">Demo view</label><select id="role" value={role} onChange={e => setRole(e.target.value)}><option>Citizen</option><option>Authority</option><option>Worker</option></select></div>
    </header>

    <main className="container">
      <section className="hero">
        <div><span className="eyebrow">CLEANER STREETS, SMARTER CITIES</span><h1>Make your neighbourhood<br /><em>cleaner, together.</em></h1><p>Report public cleanliness issues and help local teams take action.</p></div>
        <div className="hero-icon" aria-hidden="true">♻</div>
      </section>

      {error && <div className="notice error">{error}</div>}
      {message && <div className="notice success">{message}</div>}

      <section className="stats">
        <Stat label="Total reports" value={analytics.total} />
        <Stat label="Pending" value={analytics.pending} />
        <Stat label="In progress" value={analytics.inProgress} />
        <Stat label="Resolved" value={analytics.resolved} />
      </section>

      {role === "Citizen" && <section className="panel">
        <div className="section-heading"><div><span className="eyebrow">CITIZEN PORTAL</span><h2>Report an issue</h2></div><span className="step-tag">Takes about 1 minute</span></div>
        <form onSubmit={submitReport} className="report-form">
          <div className="form-grid">
            <Field label="Your name"><input required value={form.reporterName} onChange={e => setForm({...form, reporterName:e.target.value})} placeholder="Enter your name" /></Field>
            <Field label="Location"><input required value={form.location} onChange={e => setForm({...form, location:e.target.value})} placeholder="Street, area or landmark" /></Field>
            <Field label="Issue category"><select value={form.category} onChange={e => setForm({...form, category:e.target.value})}><option>Auto-detect</option><option>Plastic Waste</option><option>Organic Waste</option><option>Paper Waste</option><option>Mixed Waste</option><option>Other</option></select></Field>
            <Field label="Description"><input required value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="Briefly describe the issue" /></Field>
          </div>
          <Field label="Upload a photo (JPG, PNG or WEBP; max 5 MB)">
            <input id="imageInput" type="file" accept="image/jpeg,image/png,image/webp" required onChange={e => setImage(e.target.files?.[0] || null)} />
          </Field>
          {image && <p className="file-name">Selected: {image.name}</p>}
          <button className="primary-btn" disabled={loading}>{loading ? "Submitting…" : "Submit cleanliness report →"}</button>
        </form>
      </section>}

      {role === "Worker" && <section className="panel compact-panel">
        <div className="section-heading"><div><span className="eyebrow">SANITATION TEAM</span><h2>My assigned tasks</h2></div></div>
        <Field label="Worker name"><select value={workerName} onChange={e => setWorkerName(e.target.value)}><option>Ravi</option><option>Sunita</option><option>Amit</option><option>Priya</option></select></Field>
      </section>}

      <section className="panel">
        <div className="section-heading"><div><span className="eyebrow">{role === "Authority" ? "MUNICIPAL DASHBOARD" : role === "Worker" ? "YOUR WORK QUEUE" : "REPORT TRACKER"}</span><h2>{role === "Authority" ? "Manage complaints" : role === "Worker" ? "Assigned reports" : "Recent reports"}</h2></div><button className="text-btn" onClick={loadData}>↻ Refresh</button></div>
        {visibleReports.length === 0 ? <div className="empty-state"><span>📍</span><strong>No reports to display yet</strong><p>{role === "Citizen" ? "Submit a report using the form above. Reports are shown here when the name matches." : "New reports and assigned tasks will appear here."}</p></div> :
          <div className="report-list">{visibleReports.map(report => <article className="report-card" key={report.id}>
            <div className="report-image">{report.imageUrl ? <img src={`${API}${report.imageUrl}`} alt="Reported cleanliness issue" /> : "♻"}</div>
            <div className="report-info"><div className="report-title-row"><strong>{report.category}</strong><span className={`status ${report.status.toLowerCase().replace(" ", "-")}`}>{report.status}</span></div><p>{report.description}</p><small>📍 {report.location} · {report.reporterName}</small><small>AI match: {report.classification?.label || "Not available"} {report.classification?.confidence ? `(${report.classification.confidence}% similarity)` : ""}</small>
              {role === "Authority" && <div className="admin-controls">
                <label>Status <select value={report.status} onChange={e => updateReport(report.id, {status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Resolved</option></select></label>
                <label>Priority <select value={report.priority} onChange={e => updateReport(report.id, {priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label>
                <label>Assign <select value={report.assignedWorker || ""} onChange={e => updateReport(report.id, {assignedWorker:e.target.value})}><option value="">Unassigned</option><option>Ravi</option><option>Sunita</option><option>Amit</option><option>Priya</option></select></label>
              </div>}
              {role === "Worker" && <div className="worker-action"><label>Update task <select value={report.status} onChange={e => updateReport(report.id, {status:e.target.value})}><option>Pending</option><option>In Progress</option><option>Resolved</option></select></label></div>}
            </div>
          </article>)}</div>}
      </section>
      <footer>CleanSight AI · Prototype demonstration · Not connected to a live municipal system</footer>
    </main>
  </div>;
}

function Stat({label, value}) { return <div className="stat-card"><strong>{value}</strong><span>{label}</span></div>; }
function Field({label, children}) { return <label className="field"><span>{label}</span>{children}</label>; }

export default App;
