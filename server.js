const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

function parseCookies(req) {
  const header = req.headers['cookie'];
  const out = {};
  if (header) {
    for (const part of header.split(';')) {
      const [k, v] = part.trim().split('=');
      out[k] = decodeURIComponent(v);
    }
  }
  return out;
}

function getUserIdFromReq(req) {
  const token = parseCookies(req).token;
  if (token && sessions.has(token)) {
    return sessions.get(token);
  }
  return null;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  if (getUserIdFromReq(req)) {
    return res.redirect('/start.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/signup', (req, res) => {
  if (getUserIdFromReq(req)) {
    return res.redirect('/start.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin', (req, res) => {
  if (getUserIdFromReq(req)) {
    return res.redirect('/start.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

app.get('/user', (req, res) => {
  if (!getUserIdFromReq(req)) {
    return res.redirect('/signin.html');
  }
  res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

// Simple in-memory session store
const sessions = new Map();

// Initialize SQLite database (file will be created if it doesn't exist)
const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database', err);
  }
});

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)',
    (err) => {
      if (err) {
        console.error('Failed to create table', err);
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      passcode TEXT,
      username TEXT,
      profile TEXT
    )`,
    (err) => {
      if (err) {
        console.error('Failed to create users table', err);
      }
    }
  );
});

app.get('/items', (req, res) => {
  db.all('SELECT id, name FROM items', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  db.run('INSERT INTO items (name) VALUES (?)', [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name });
  });
});

function auth(req, res, next) {
  const token = parseCookies(req).token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const userId = sessions.get(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.userId = userId;
  req.token = token;
  next();
}

app.post('/signup', (req, res) => {
  if (getUserIdFromReq(req)) {
    return res.status(400).json({ error: 'Already signed in' });
  }

  const { userId, passcode, username, profile } = req.body;
  if (!userId || userId.length > 10) {
    return res.status(400).json({ error: 'Invalid userId' });
  }
  if (!/^\d{4}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be 4 digits' });
  }
  if (!username || username.length > 20) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  db.run(
    'INSERT INTO users (user_id, passcode, username, profile) VALUES (?, ?, ?, ?)',
    [userId, passcode, username, profile || ''],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'User already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ userId });
    }
  );
});
 

app.post('/signin', (req, res) => {
  const { userId, passcode } = req.body;
  if (!userId || !passcode) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  db.get(
    'SELECT user_id FROM users WHERE user_id = ? AND passcode = ?',
    [userId, passcode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = crypto.randomBytes(16).toString('hex');
      sessions.set(token, userId);
      res.setHeader('Set-Cookie', `token=${token}; HttpOnly`);
      res.json({ message: 'Signed in' });
    }
  );
});

app.post('/logout', auth, (req, res) => {
  for (const [token, id] of sessions) {
    if (id === req.userId) {
      sessions.delete(token);
    }
  }
  res.setHeader('Set-Cookie', 'token=; Max-Age=0');
  res.json({ message: 'Logged out' });
});

app.get('/me', auth, (req, res) => {
  db.get(
    'SELECT user_id as userId, username, profile FROM users WHERE user_id = ?',
    [req.userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    }
  );
});

app.put('/me', auth, (req, res) => {
  const { username, profile, passcode } = req.body;
  if (username && username.length > 20) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  if (passcode && !/^\d{4}$/.test(passcode)) {
    return res.status(400).json({ error: 'Passcode must be 4 digits' });
  }
  db.run(
    'UPDATE users SET username = COALESCE(?, username), profile = COALESCE(?, profile), passcode = COALESCE(?, passcode) WHERE user_id = ?',
    [username, profile, passcode, req.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Updated', changes: this.changes });
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

