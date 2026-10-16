import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, CheckCircle2, ChevronRight, FileText, GraduationCap, LayoutDashboard, LogIn, LogOut, Menu, Search, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { api, getToken, trackVisit } from "./api";

const initialResume = { fullName:"", headline:"", email:"", phone:"", summary:"", education:"", skills:"", projects:"", certifications:"" };

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("SwipeX_user") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("home");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(initialResume);
  const [stats, setStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminResumes, setAdminResumes] = useState([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name:"", email:"", password:"" });
  const [jobForm, setJobForm] = useState({ title:"", company:"", location:"Remote", type:"Internship", mode:"Remote", description:"", skills:"" });
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => { trackVisit(window.location.pathname || "/"); }, []);

  useEffect(() => {
    api("/jobs").then(d => setJobs(d.jobs || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    if (page === "resume") api("/resume/me").then(d => setResume({ ...initialResume, ...d.resume })).catch(e => setNotice(e.message));
    if (page === "applications") api("/applications/me").then(d => setApplications(d.applications || [])).catch(e => setNotice(e.message));
    if (page === "admin" && user.role === "admin") {
      Promise.all([api("/admin/stats"), api("/admin/users"), api("/admin/resumes")])
        .then(([s, u, r]) => { setStats(s); setAdminUsers(u.users || []); setAdminResumes(r.resumes || []); })
        .catch(e => setNotice(e.message));
    }
  }, [page, user]);

  const filteredJobs = useMemo(() => jobs.filter(j => `${j.title} ${j.company} ${j.location} ${j.skills?.join(" ")}`.toLowerCase().includes(search.toLowerCase())), [jobs, search]);

  function flash(message) { setNotice(message); window.setTimeout(() => setNotice(""), 3500); }
  function logout() {
    localStorage.removeItem("SwipeX_token"); localStorage.removeItem("SwipeX_user");
    setUser(null); setPage("home"); flash("You have logged out.");
  }
  async function submitAuth(e) {
    e.preventDefault(); setBusy(true);
    try {
      const path = authMode === "register" ? "/auth/register" : "/auth/login";
      const data = await api(path, { method:"POST", body:JSON.stringify(auth) });
      localStorage.setItem("SwipeX_token", data.token);
      localStorage.setItem("SwipeX_user", JSON.stringify(data.user));
      setUser(data.user); setPage("dashboard"); flash(`Welcome to SwipeX, ${data.user.name}!`);
    } catch (e) { flash(e.message); }
    finally { setBusy(false); }
  }
  async function saveResume(e) {
    e.preventDefault(); setBusy(true);
    try { const d = await api("/resume/me", { method:"PUT", body:JSON.stringify(resume) }); setResume({ ...initialResume, ...d.resume }); flash("Resume saved successfully."); }
    catch(e) { flash(e.message); } finally { setBusy(false); }
  }
  async function apply(jobId) {
    if (!user) { setPage("auth"); setAuthMode("login"); return; }
    try { await api(`/applications/${jobId}`, { method:"POST", body:"{}" }); flash("Application submitted!"); }
    catch(e) { flash(e.message); }
  }
  async function createJob(e) {
    e.preventDefault();
    try {
      await api("/jobs", { method:"POST", body:JSON.stringify({ ...jobForm, skills:jobForm.skills.split(",").map(s=>s.trim()).filter(Boolean) }) });
      setJobForm({ title:"", company:"", location:"Remote", type:"Internship", mode:"Remote", description:"", skills:"" });
      const d = await api("/jobs"); setJobs(d.jobs || []); flash("Job posted.");
    } catch(e) { flash(e.message); }
  }

  const nav = [
    ["home","Home"], ["jobs","Explore jobs"], ["resume","Resume builder"],
    ...(user ? [["dashboard","Dashboard"],["applications","My applications"]] : [])
  ];
  function go(p) { setPage(p); setMobileMenu(false); setNotice(""); window.scrollTo({ top:0, behavior:"smooth" }); }

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => go("home")}><span className="brand-mark"><Sparkles size={20}/></span><span>SwipeX<span className="brand-dot">.</span></span></button>
      <button className="mobile-toggle icon-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu?<X/>:<Menu/>}</button>
      <nav className={mobileMenu?"nav-links open":"nav-links"}>
        {nav.map(([id,label])=><button key={id} className={page===id?"nav-link active":"nav-link"} onClick={()=>go(id)}>{label}</button>)}
      </nav>
      <div className="top-actions">
        {user ? <><span className="user-chip"><span className="avatar">{user.name?.[0]?.toUpperCase()}</span><span>{user.name}</span></span>
          {user.role==="admin" && <button className="btn btn-soft btn-small" onClick={()=>go("admin")}><ShieldCheck size={15}/> Admin</button>}
          <button className="icon-button" title="Log out" onClick={logout}><LogOut size={18}/></button>
        </> : <button className="btn btn-primary btn-small" onClick={()=>{setAuthMode("login");go("auth")}}>Sign in <ArrowRight size={15}/></button>}
      </div>
    </header>

    {notice && <div className="toast" role="status"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

    <main>
      {page==="home" && <Home go={go} jobs={jobs} />}
      {page==="jobs" && <section className="page-wrap"><PageHeading eyebrow="OPPORTUNITIES" title="Find your next opportunity." subtitle="Explore internships and entry-level roles built for your next chapter."/>
        <div className="search-box"><Search size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search role, company, or location"/></div>
        <div className="jobs-grid">{filteredJobs.map(j=><JobCard key={j._id} job={j} apply={apply}/>)}</div>
        {!filteredJobs.length && <Empty title="No opportunities yet" text="Try another search, or check back when new jobs are added."/>}
      </section>}
      {page==="auth" && <section className="auth-layout"><div className="auth-story"><span className="eyebrow">YOUR CAREER, REIMAGINED</span><h1>Your next chapter starts <em>here.</em></h1><p>One place to discover opportunities, build your resume, and keep your career journey moving.</p><div className="story-points"><span><CheckCircle2/> Curated opportunities</span><span><CheckCircle2/> Resume tools</span><span><CheckCircle2/> Track applications</span></div></div>
        <form className="auth-card" onSubmit={submitAuth}><span className="eyebrow">{authMode==="login"?"WELCOME BACK":"GET STARTED"}</span><h2>{authMode==="login"?"Sign in to SwipeX":"Create your account"}</h2><p className="muted">{authMode==="login"?"Pick up where your career journey left off.":"Build your profile and find your next opportunity."}</p>
          {authMode==="register" && <label>Full name<input required value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} placeholder="Your full name"/></label>}
          <label>Email address<input type="email" required value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Password<input type="password" minLength="8" required value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} placeholder="At least 8 characters"/></label>
          <button className="btn btn-primary btn-wide" disabled={busy}>{busy?"Please wait…":authMode==="login"?"Sign in":"Create account"} <ArrowRight size={17}/></button>
          <p className="switch-auth">{authMode==="login"?"New to SwipeX?":"Already have an account?"} <button type="button" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Create an account":"Sign in"}</button></p>
        </form></section>}
      {page==="dashboard" && <section className="page-wrap"><PageHeading eyebrow="YOUR WORKSPACE" title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}.`} subtitle="Small steps today. Big possibilities tomorrow."/><div className="stats-grid"><Stat icon={<BriefcaseBusiness/>} label="Open opportunities" value={jobs.length}/><Stat icon={<FileText/>} label="Resume workspace" value="Ready to build"/><Stat icon={<GraduationCap/>} label="Career tools" value="Explore"/></div><div className="dashboard-grid"><div className="panel"><h3>Continue your journey</h3><p className="muted">Keep your profile fresh and your applications organised.</p><div className="action-list"><Action icon={<FileText/>} title="Build your resume" text="Turn your experience into a clear story." onClick={()=>go("resume")}/><Action icon={<BriefcaseBusiness/>} title="Explore opportunities" text="Discover internships and entry-level roles." onClick={()=>go("jobs")}/><Action icon={<LayoutDashboard/>} title="Track applications" text="Review the roles you've applied for." onClick={()=>go("applications")}/></div></div><div className="panel highlight-panel"><span className="round-icon"><Sparkles/></span><h3>Your next opportunity could start here.</h3><p>Showcase your projects, skills, and learning journey in one place.</p><button className="btn btn-light" onClick={()=>go("resume")}>Complete your resume <ArrowRight size={16}/></button></div></div></section>}
      {page==="resume" && <section className="page-wrap"><PageHeading eyebrow="CAREER TOOLKIT" title="Your story, beautifully told." subtitle="Fill in your details and save a structured resume you can update anytime."/><div className="resume-layout"><form className="panel resume-form" onSubmit={saveResume}><h3>Resume details</h3><div className="form-grid"><label>Full name<input value={resume.fullName||""} onChange={e=>setResume({...resume,fullName:e.target.value})} placeholder="Full name"/></label><label>Professional headline<input value={resume.headline||""} onChange={e=>setResume({...resume,headline:e.target.value})} placeholder="ECE student | Aspiring developer"/></label><label>Email<input type="email" value={resume.email||""} onChange={e=>setResume({...resume,email:e.target.value})} placeholder="you@example.com"/></label><label>Phone<input value={resume.phone||""} onChange={e=>setResume({...resume,phone:e.target.value})} placeholder="Phone number"/></label></div>
          {[["summary","Professional summary","A short introduction about your goals…"],["education","Education","Degree, college, year, grades…"],["skills","Skills","React, Node.js, MongoDB…"],["projects","Projects","Project name, what you built, impact…"],["certifications","Certifications","Courses and certificates…"]].map(([key,label,placeholder])=><label key={key}>{label}<textarea rows={key==="summary"?3:2} value={resume[key]||""} onChange={e=>setResume({...resume,[key]:e.target.value})} placeholder={placeholder}/></label>)}
          <button className="btn btn-primary" disabled={busy}>{busy?"Saving…":"Save resume"} <CheckCircle2 size={16}/></button>
        </form><div className="panel resume-preview"><div className="preview-top"><span className="eyebrow">LIVE PREVIEW</span><FileText size={19}/></div><h2>{resume.fullName||"Your Name"}</h2><p className="preview-headline">{resume.headline||"Your professional headline"}</p><p className="muted small">{resume.email} {resume.phone&&" · "+resume.phone}</p>{[["SUMMARY",resume.summary],["EDUCATION",resume.education],["SKILLS",resume.skills],["PROJECTS",resume.projects],["CERTIFICATIONS",resume.certifications]].map(([label,value])=><div className="preview-section" key={label}><h4>{label}</h4><p>{value||"Add details in the form to preview this section."}</p></div>)}<p className="tiny muted">Save to keep your resume data in your SwipeX account.</p></div></div></section>}
      {page==="applications" && <section className="page-wrap"><PageHeading eyebrow="YOUR JOURNEY" title="My applications" subtitle="Keep an eye on the opportunities you've applied for."/><div className="panel table-panel">{applications.length?<table><thead><tr><th>Role</th><th>Company</th><th>Status</th><th>Applied</th></tr></thead><tbody>{applications.map(a=><tr key={a._id}><td>{a.job?.title||"Job removed"}</td><td>{a.job?.company||"—"}</td><td><span className="status-pill">{a.status}</span></td><td>{new Date(a.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>:<Empty title="Your journey starts with one application" text="Explore open roles and apply to see them listed here." action={()=>go("jobs")} actionText="Explore jobs"/>}</div></section>}
      {page==="admin" && user?.role==="admin" && <section className="page-wrap"><PageHeading eyebrow="CONTROL ROOM" title="Admin overview" subtitle="A high-level view of SwipeX activity and platform records."/><div className="stats-grid">{[["Total visits",stats?.stats?.visits??"—",<ChartNoAxesCombined/>],["Student accounts",stats?.stats?.users??"—",<Users/>],["Open jobs",stats?.stats?.jobs??"—",<BriefcaseBusiness/>],["Applications",stats?.stats?.applications??"—",<FileText/>]].map(([l,v,i])=><Stat key={l} icon={i} label={l} value={v}/>)}</div>
        <div className="admin-grid"><div className="panel"><h3>Recent student accounts</h3>{adminUsers.slice(0,8).map(u=><div className="user-row" key={u._id}><span className="avatar">{u.name?.[0]?.toUpperCase()}</span><div><b>{u.name}</b><p className="muted small">{u.email}</p></div><span className="user-date">{new Date(u.createdAt).toLocaleDateString()}</span></div>)}</div>
          <div className="panel"><h3>Post a job</h3><form className="job-form" onSubmit={createJob}><label>Job title<input required value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})}/></label><label>Company<input required value={jobForm.company} onChange={e=>setJobForm({...jobForm,company:e.target.value})}/></label><div className="form-grid"><label>Location<input value={jobForm.location} onChange={e=>setJobForm({...jobForm,location:e.target.value})}/></label><label>Type<select value={jobForm.type} onChange={e=>setJobForm({...jobForm,type:e.target.value})}><option>Internship</option><option>Full-time</option><option>Part-time</option></select></label></div><label>Description<textarea required rows={3} value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})}/></label><label>Skills (comma separated)<input value={jobForm.skills} onChange={e=>setJobForm({...jobForm,skills:e.target.value})}/></label><button className="btn btn-primary">Publish job <ArrowRight size={15}/></button></form></div></div>
        <div className="panel table-panel"><h3>Resume records</h3>{adminResumes.length?<table><thead><tr><th>Student</th><th>Email</th><th>Headline</th><th>Updated</th></tr></thead><tbody>{adminResumes.map(r=><tr key={r._id}><td>{r.user?.name||r.fullName||"—"}</td><td>{r.user?.email||r.email||"—"}</td><td>{r.headline||"—"}</td><td>{r.updatedAt?new Date(r.updatedAt).toLocaleDateString():"—"}</td></tr>)}</tbody></table>:<p className="muted">No saved resumes yet.</p>}</div>
      </section>}
      {page==="admin" && user?.role!=="admin" && <section className="page-wrap"><Empty title="Admin access only" text="This page is available only to an authorised administrator." action={()=>go("dashboard")} actionText="Back to dashboard"/></section>}
    </main>
    <footer className="footer"><button className="brand footer-brand" onClick={()=>go("home")}><span className="brand-mark"><Sparkles size={17}/></span><span>SwipeX<span className="brand-dot">.</span></span></button><span>Build Skills. Shape Your Career.</span><span>© {new Date().getFullYear()} SwipeX</span></footer>
  </div>;
}

function Home({go,jobs}) {
  return <><section className="hero"><div className="hero-glow glow-one"></div><div className="hero-glow glow-two"></div><div className="hero-content"><span className="eyebrow eyebrow-pill"><Sparkles size={14}/> YOUR CAREER, IN FULL COLOUR</span><h1>Your ambition deserves a <em>launchpad.</em></h1><p className="hero-copy">Discover opportunities. Tell your story. Build the future you imagine — one step at a time.</p><div className="hero-actions"><button className="btn btn-primary btn-large" onClick={()=>go("jobs")}>Explore opportunities <ArrowRight size={18}/></button><button className="btn btn-outline btn-large" onClick={()=>go("resume")}>Build your resume <FileText size={17}/></button></div><div className="hero-proof"><div className="proof-avatars"><span>B</span><span>S</span><span>A</span></div><span><b>Made for your next chapter</b><small>Students · Graduates · Career starters</small></span></div></div>
    <div className="hero-visual"><div className="visual-orbit orbit-a"></div><div className="visual-orbit orbit-b"></div><div className="floating-card card-main"><div className="mini-top"><span className="mini-logo"><Sparkles size={15}/></span><span className="mini-label">CAREER SNAPSHOT</span><span className="online-dot"></span></div><div className="mini-profile"><div className="profile-art"><GraduationCap size={30}/></div><div><b>Your next chapter</b><p>Progress starts with a plan.</p></div></div><div className="progress-label"><span>Profile strength</span><b>75%</b></div><div className="progress-track"><span></span></div><div className="mini-tags"><span>Skills</span><span>Projects</span><span>Experience</span></div><div className="mini-divider"></div><div className="mini-opportunity"><span className="opportunity-icon"><BriefcaseBusiness size={18}/></span><div><b>New opportunities</b><p>Find a role that fits your goals</p></div><ChevronRight size={18}/></div></div><div className="float-note note-top"><span className="note-icon lavender"><FileText size={18}/></span><span><b>Resume ready?</b><small>Your story matters.</small></span></div><div className="float-note note-bottom"><span className="note-icon mint"><CheckCircle2 size={18}/></span><span><b>Keep moving forward</b><small>One step at a time.</small></span></div><div className="sparkle sparkle-a">✳</div><div className="sparkle sparkle-b">✦</div></div></section>
    <section className="feature-strip"><div><span className="feature-icon"><Search/></span><span><b>Discover</b><small>Find opportunities</small></span></div><div><span className="feature-icon"><FileText/></span><span><b>Showcase</b><small>Build your resume</small></span></div><div><span className="feature-icon"><ChartNoAxesCombined/></span><span><b>Grow</b><small>Track your progress</small></span></div><div><span className="feature-icon"><ShieldCheck/></span><span><b>Stay organised</b><small>Keep it all in one place</small></span></div></section>
    <section className="home-section"><div className="section-heading"><div><span className="eyebrow">YOUR NEXT MOVE</span><h2>Make room for <em>possibility.</em></h2><p>Tools that help you go from “I'm interested” to “I applied.”</p></div><button className="text-link" onClick={()=>go("jobs")}>Explore all jobs <ArrowRight size={16}/></button></div><div className="feature-cards"><FeatureCard number="01" title="Find a fit" text="Explore internships and early-career roles that align with what you want to learn." icon={<BriefcaseBusiness/>}/><FeatureCard number="02" title="Tell your story" text="Organise your education, projects, skills, and certifications into a clear resume." icon={<FileText/>}/><FeatureCard number="03" title="Keep your momentum" text="See your applications in one place and keep moving toward your goals." icon={<ChartNoAxesCombined/>}/></div></section>
    <section className="cta-band"><div><span className="eyebrow">THE NEXT CHAPTER IS YOURS</span><h2>Start where you are.<br/><em>Grow from there.</em></h2><p>Your career story is still being written. Let's make the next page count.</p></div><button className="btn btn-light btn-large" onClick={()=>go("auth")}>Get started <ArrowRight size={18}/></button></section>
  </>;
}
function PageHeading({eyebrow,title,subtitle}) { return <div className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>; }
function Stat({icon,label,value}) { return <div className="stat-card"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong></div>; }
function JobCard({job,apply}) { return <article className="job-card"><div className="job-card-top"><span className="company-mark">{job.company?.[0]?.toUpperCase()||"S"}</span><span className="job-type">{job.type}</span></div><h3>{job.title}</h3><p className="company-name">{job.company}</p><p className="muted small">{job.location} · {job.mode}</p><p className="job-description">{job.description}</p><div className="tag-list">{(job.skills||[]).slice(0,4).map(s=><span key={s}>{s}</span>)}</div><button className="btn btn-primary btn-wide" onClick={()=>apply(job._id)}>Apply now <ArrowRight size={15}/></button></article>; }
function FeatureCard({number,title,text,icon}) { return <article className="feature-card"><div className="feature-card-top"><span>{number}</span><span className="feature-card-icon">{icon}</span></div><h3>{title}</h3><p>{text}</p></article>; }
function Action({icon,title,text,onClick}) { return <button className="action-item" onClick={onClick}><span className="action-icon">{icon}</span><span><b>{title}</b><small>{text}</small></span><ChevronRight size={18}/></button>; }
function Empty({title,text,action,actionText}) { return <div className="empty-state"><span className="empty-icon"><Sparkles/></span><h3>{title}</h3><p>{text}</p>{action&&<button className="btn btn-primary" onClick={action}>{actionText} <ArrowRight size={15}/></button>}</div>; }
