import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';

const Shell = ({ title, sub, children }) => (
  <div className="auth">
    <Link to="/" className="brand"><span className="brand-mark" />CONVERTIX <span className="grad-text">LABS</span></Link>
    <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
      <h1>{title}</h1>{sub && <p>{sub}</p>}{children}
    </motion.div>
  </div>
);

function useSubmit(fn) {
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  return [err, busy, async (e) => { e.preventDefault(); setErr(''); setBusy(true); try { await fn(); } catch (x) { setErr(x.message); setBusy(false); } }];
}

export function Login() {
  const { user, login } = useAuth(), nav = useNavigate();
  const [email, setEmail] = useState(''), [pw, setPw] = useState('');
  const [err, busy, submit] = useSubmit(async () => { await login(email, pw); nav('/dashboard'); });
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <Shell title="Log in" sub="Client and team access.">
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <div className="field"><label htmlFor="p">Password</label><input id="p" type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} required /></div>
        {err && <p className="err">{err}</p>}
        <button className="btn btn-primary btn-lg full" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
      </form>
      <p className="auth-note">Accounts are created for clients after their review call.</p>
    </Shell>
  );
}

export function Signup() {
  const token = useSearchParams()[0].get('token') || '';
  const { signup } = useAuth(), nav = useNavigate();
  const [inv, setInv] = useState(null), [bad, setBad] = useState(!token), [pw, setPw] = useState('');
  useEffect(() => { if (token) api('/auth/invite/' + token).then(setInv).catch(() => setBad(true)); }, [token]);
  const [err, busy, submit] = useSubmit(async () => { await signup(token, pw); nav('/dashboard'); });
  if (bad) return <Shell title="Invite not valid" sub="This link is invalid or has expired. Ask your Convertix contact for a new one."><Link to="/login" className="btn btn-ghost full">Go to log in</Link></Shell>;
  if (!inv) return <Shell title="Loading…" />;
  return (
    <Shell title={`Welcome, ${inv.name.split(' ')[0]}`} sub={`Create your password for ${inv.company}.`}>
      <form onSubmit={submit}>
        <div className="field"><label>Email</label><input value={inv.email} disabled /></div>
        <div className="field"><label htmlFor="np">Password</label><input id="np" type="password" autoComplete="new-password" minLength={8} value={pw} onChange={e => setPw(e.target.value)} required /></div>
        {err && <p className="err">{err}</p>}
        <button className="btn btn-primary btn-lg full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
    </Shell>
  );
}
