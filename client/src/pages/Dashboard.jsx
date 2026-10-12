import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { QUESTIONS } from '../data.js';

const STATUS = [['new', 'New'], ['contacted', 'Contacted'], ['call_done', 'Call done'], ['client', 'Client'], ['lost', 'Lost']];
const STAGES = [['review', 'Review'], ['map', 'Map'], ['build', 'Build'], ['run', 'Run']];
const label = Object.fromEntries(QUESTIONS.map(q => [q.id, q.title]));
const fmt = d => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const list = v => [].concat(v || []);

const Answers = ({ answers }) => (
  <dl className="ans">{Object.entries(answers || {}).map(([k, v]) => <div key={k}><dt>{label[k] || k}</dt><dd>{list(v).map(x => <span className="chip" key={x}>{x}</span>)}</dd></div>)}</dl>
);

function Admin() {
  const [leads, setLeads] = useState(null), [f, setF] = useState('all'), [q, setQ] = useState(''), [open, setOpen] = useState(null), [link, setLink] = useState(''), [err, setErr] = useState('');
  useEffect(() => { api('/admin/leads').then(d => setLeads(d.leads)).catch(e => setErr(e.message)); }, []);
  const patch = async (id, body) => { const d = await api('/admin/leads/' + id, { method: 'PATCH', body }); setLeads(ls => ls.map(l => l.id === id ? { ...l, ...d.lead } : l)); };
  const invite = async id => { try { setLink((await api(`/admin/leads/${id}/invite`, { method: 'POST' })).link); } catch (e) { setErr(e.message); } };
  const counts = useMemo(() => Object.fromEntries(STATUS.map(([k]) => [k, (leads || []).filter(l => l.status === k).length])), [leads]);
  const shown = (leads || []).filter(l => (f === 'all' || l.status === f) && (`${l.name} ${l.company} ${l.email}`.toLowerCase().includes(q.toLowerCase())));
  if (!leads) return <p className="dash-msg">{err || 'Loading…'}</p>;
  return (<>
    <div className="stats-row">
      <button className={`stat-c${f === 'all' ? ' on' : ''}`} onClick={() => setF('all')}><b>{leads.length}</b>All leads</button>
      {STATUS.map(([k, l]) => <button key={k} className={`stat-c${f === k ? ' on' : ''}`} onClick={() => setF(k)}><b>{counts[k]}</b>{l}</button>)}
    </div>
    <input className="search" placeholder="Search name, company, email" value={q} onChange={e => setQ(e.target.value)} />
    {err && <p className="err">{err}</p>}
    {!shown.length && <p className="dash-msg">No leads yet.</p>}
    <div className="rows">{shown.map(l => (
      <motion.div layout key={l.id} className={`row-c${open === l.id ? ' open' : ''}`}>
        <button className="row-h" onClick={() => { setOpen(open === l.id ? null : l.id); setLink(''); }}>
          <div><b>{l.company}</b><span>{l.name} · {l.email}</span></div>
          <span className="pill">{STATUS.find(s => s[0] === l.status)?.[1]}</span><span className="muted">{fmt(l.created_at)}</span>
        </button>
        <AnimatePresence initial={false}>{open === l.id && (
          <motion.div className="row-b" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div className="row-in">
              <Answers answers={l.answers} />{l.phone && <p className="muted">Phone: {l.phone}</p>}
              <div className="ctl">
                <label>Status<select value={l.status} onChange={e => patch(l.id, { status: e.target.value })}>{STATUS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
                <label>Project stage<select value={l.stage} onChange={e => patch(l.id, { stage: e.target.value })}>{STAGES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
              </div>
              <label className="notes">Notes<textarea defaultValue={l.notes} onBlur={e => e.target.value !== l.notes && patch(l.id, { notes: e.target.value })} placeholder="Call notes…" /></label>
              {l.has_account ? <p className="muted">✓ Client account active</p>
                : <button className="btn btn-ghost" onClick={() => invite(l.id)}>Create client invite</button>}
              {link && open === l.id && <div className="invite"><input readOnly value={link} onFocus={e => e.target.select()} /><button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard?.writeText(link)}>Copy</button></div>}
            </div>
          </motion.div>)}</AnimatePresence>
      </motion.div>))}</div>
  </>);
}

function Client() {
  const [p, setP] = useState(null), [err, setErr] = useState('');
  useEffect(() => { api('/me/project').then(setP).catch(e => setErr(e.message)); }, []);
  if (!p) return <p className="dash-msg">{err || 'Loading…'}</p>;
  const cur = STAGES.findIndex(s => s[0] === p.stage);
  return (<>
    <h2 className="dash-h">{p.company}</h2>
    <p className="muted">Project progress</p>
    <ol className="track-s">{STAGES.map(([k, v], i) => <motion.li key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .1 }} className={i < cur ? 'done' : i === cur ? 'now' : ''}><span>{i < cur ? '✓' : i + 1}</span>{v}</motion.li>)}</ol>
    <h3 className="dash-s">Your answers</h3><Answers answers={p.answers} />
  </>);
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  if (loading) return <p className="dash-msg">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="dash">
      <header className="dash-top wrap">
        <Link to="/" className="brand"><span className="brand-mark" />CONVERTIX <span className="grad-text">LABS</span></Link>
        <div className="nav-right"><span className="muted who">{user.email}</span><button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button></div>
      </header>
      <main className="wrap dash-main">
        <span className="eyebrow">{user.role === 'admin' ? 'Admin' : 'Client portal'}</span>
        {user.role === 'admin' ? <><h1 className="dash-t">Leads</h1><Admin /></> : <Client />}
      </main>
    </div>
  );
}
