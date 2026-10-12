import crypto from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { pool } from './db.js';
import { auth, role, setSession } from './auth.js';

const r = Router();
const limit = (n) => rateLimit({ windowMs: 15 * 60e3, limit: n, standardHeaders: 'draft-7', legacyHeaders: false, message: { message: 'Too many attempts. Try again later.' } });
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const fail = (res, e) => res.status(422).json({ message: e.issues?.[0]?.message || 'Invalid input.' });

const STATUS = ['new', 'contacted', 'call_done', 'client', 'lost'];
const STAGE = ['review', 'map', 'build', 'run'];

// ---------- public: quiz submission ----------
const leadSchema = z.object({
  answers: z.record(z.string().max(40), z.union([z.string().max(120), z.array(z.string().max(120)).max(10)])).default({}),
  contact: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100),
    company: z.string().trim().min(1, 'Company is required').max(150),
    email: z.string().trim().toLowerCase().email('Enter a valid email').max(254),
    phone: z.string().trim().max(40).optional().default(''),
  }),
});
r.post('/leads', limit(8), async (req, res) => {
  const p = leadSchema.safeParse(req.body);
  if (!p.success) return fail(res, p.error);
  const { contact: c, answers } = p.data;
  // Saved on submit (not after the call): the answers are what you use to prepare the call.
  const { rows } = await pool.query(
    'insert into leads(name,company,email,phone,answers) values($1,$2,$3,$4,$5) returning id',
    [c.name, c.company, c.email, c.phone, JSON.stringify(answers)]);
  res.status(201).json({ id: rows[0].id });
});

// ---------- auth ----------
const DUMMY = bcrypt.hashSync('not-a-real-password', 12);
r.post('/auth/login', limit(10), async (req, res) => {
  const p = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!p.success) return fail(res, p.error);
  const { rows } = await pool.query('select * from users where email=$1', [p.data.email]);
  const ok = await bcrypt.compare(p.data.password, rows[0]?.password_hash || DUMMY);
  if (!rows[0] || !ok) return res.status(401).json({ message: 'Invalid email or password.' });
  setSession(res, rows[0]);
  res.json({ user: { id: rows[0].id, email: rows[0].email, role: rows[0].role } });
});
r.post('/auth/logout', (_req, res) => res.clearCookie('token').json({ ok: true }));
r.get('/auth/me', auth, (req, res) => res.json({ user: { id: req.user.id, email: req.user.email, role: req.user.role } }));

// Signup is invite-only: an admin invites a lead after a successful call.
r.get('/auth/invite/:token', async (req, res) => {
  const { rows } = await pool.query(
    `select l.email, l.name, l.company from invites i join leads l on l.id=i.lead_id
     where i.token_hash=$1 and i.used_at is null and i.expires_at>now()`, [sha(req.params.token)]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ message: 'This invite is invalid or has expired.' });
});
r.post('/auth/signup', limit(10), async (req, res) => {
  const p = z.object({ token: z.string().min(10), password: z.string().min(8, 'Password must be at least 8 characters').max(100) }).safeParse(req.body);
  if (!p.success) return fail(res, p.error);
  const db = await pool.connect();
  try {
    await db.query('begin');
    const { rows } = await db.query(
      `select i.token_hash, l.id lead_id, l.email from invites i join leads l on l.id=i.lead_id
       where i.token_hash=$1 and i.used_at is null and i.expires_at>now()`, [sha(p.data.token)]);
    if (!rows[0]) { await db.query('rollback'); return res.status(400).json({ message: 'This invite is invalid or has expired.' }); }
    const email = rows[0].email.toLowerCase();
    if ((await db.query('select 1 from users where email=$1', [email])).rowCount) { await db.query('rollback'); return res.status(409).json({ message: 'An account already exists for this email.' }); }
    const u = (await db.query(`insert into users(email,password_hash,role,lead_id) values($1,$2,'client',$3) returning id,email,role`,
      [email, await bcrypt.hash(p.data.password, 12), rows[0].lead_id])).rows[0];
    await db.query('update invites set used_at=now() where token_hash=$1', [rows[0].token_hash]);
    await db.query(`update leads set status='client' where id=$1`, [rows[0].lead_id]);
    await db.query('commit');
    setSession(res, u);
    res.status(201).json({ user: u });
  } catch (e) { await db.query('rollback').catch(() => {}); throw e; } finally { db.release(); }
});

// ---------- client dashboard ----------
r.get('/me/project', auth, role('client'), async (req, res) => {
  const { rows } = await pool.query(
    'select l.name,l.company,l.answers,l.stage,l.created_at from users u join leads l on l.id=u.lead_id where u.id=$1', [req.user.id]);
  rows[0] ? res.json(rows[0]) : res.status(404).json({ message: 'No project found.' });
});

// ---------- admin ----------
const admin = [auth, role('admin')];
r.get('/admin/leads', ...admin, async (_req, res) => {
  const { rows } = await pool.query(
    `select l.*, (u.id is not null) as has_account from leads l left join users u on u.lead_id=l.id order by l.created_at desc limit 500`);
  res.json({ leads: rows });
});
r.patch('/admin/leads/:id', ...admin, async (req, res) => {
  const p = z.object({ id: z.string().uuid(), status: z.enum(STATUS).optional(), stage: z.enum(STAGE).optional(), notes: z.string().max(5000).optional() })
    .safeParse({ ...req.body, id: req.params.id });
  if (!p.success) return fail(res, p.error);
  const { rows } = await pool.query(
    'update leads set status=coalesce($2,status), stage=coalesce($3,stage), notes=coalesce($4,notes) where id=$1 returning *',
    [p.data.id, p.data.status ?? null, p.data.stage ?? null, p.data.notes ?? null]);
  rows[0] ? res.json({ lead: rows[0] }) : res.status(404).json({ message: 'Lead not found.' });
});
r.post('/admin/leads/:id/invite', ...admin, async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) return fail(res, id.error);
  const lead = (await pool.query('select email from leads where id=$1', [id.data])).rows[0];
  if (!lead) return res.status(404).json({ message: 'Lead not found.' });
  if ((await pool.query('select 1 from users where email=$1', [lead.email.toLowerCase()])).rowCount)
    return res.status(409).json({ message: 'This client already has an account.' });
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(`insert into invites(token_hash,lead_id,expires_at) values($1,$2,now()+interval '7 days')`, [sha(token), id.data]);
  const base = (process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  res.status(201).json({ link: `${base}/signup?token=${token}`, expiresInDays: 7 });
});

export default r;
