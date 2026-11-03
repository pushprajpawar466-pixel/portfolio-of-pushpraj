require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');
const RESUME_FILE = path.join(__dirname, 'public', 'assets', 'resume.pdf');

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Profile data (served as JSON) ----------
const profile = {
  name: 'Pushpraj Pawar',
  title: 'Computer Science Student',
  email: 'pushprajpawar466@gmail.com',
  phone: '+91 9420314688'
};
app.get('/api/profile', (req, res) => res.json(profile));

// ---------- Resume download ----------
app.get('/api/resume', async (req, res) => {
  try {
    await fs.access(RESUME_FILE);
    res.download(RESUME_FILE, 'Pushpraj_Pawar_Resume.pdf');
  } catch {
    res.status(404).json({ error: 'Resume file not found. Put resume.pdf in public/assets/.' });
  }
});

// ---------- Contact form ----------
const hits = new Map(); // ip -> timestamps (simple rate limit)
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 15 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

async function readMessages() {
  try {
    return JSON.parse(await fs.readFile(MESSAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

app.post('/api/contact', async (req, res) => {
  if (rateLimited(req.ip)) {
    return res.status(429).json({ error: 'Too many messages. Please try again later.' });
  }
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const message = String(req.body.message || '').trim();

  if (name.length < 2 || name.length > 80)
    return res.status(400).json({ error: 'Please enter a valid name.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
    return res.status(400).json({ error: 'Please enter a valid email.' });
  if (message.length < 5 || message.length > 1000)
    return res.status(400).json({ error: 'Message must be 5–1000 characters.' });

  try {
    const messages = await readMessages();
    messages.push({ id: Date.now(), name, email, message, date: new Date().toISOString() });
    await fs.mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
    res.status(201).json({ ok: true, message: 'Thank you! Your message has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not save your message.' });
  }
});

// Read saved messages (protected): send header  x-admin-key: <ADMIN_KEY>
app.get('/api/messages', async (req, res) => {
  if (!ADMIN_KEY || req.get('x-admin-key') !== ADMIN_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  res.json(await readMessages());
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
