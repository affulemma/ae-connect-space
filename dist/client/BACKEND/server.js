const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'db.json');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

const tables = {
  marketplace_listings: 'marketplace_listings',
  partner_profiles: 'partner_profiles',
  business_discussions: 'business_discussions',
  community_groups: 'community_groups',
  group_messages: 'group_messages'
};

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf'
};

function ensureDb(){
  if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if(!fs.existsSync(dbFile)){
    fs.writeFileSync(dbFile, JSON.stringify({
      user_accounts: [],
      marketplace_listings: [],
      partner_profiles: [],
      business_discussions: [],
      community_groups: [],
      group_messages: []
    }, null, 2));
  }
}

function readDb(){
  ensureDb();
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function writeDb(db){
  ensureDb();
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

function sendJson(res, status, payload){
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function readBody(req){
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if(body.length > 5_000_000){
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try{
        resolve(body ? JSON.parse(body) : {});
      }catch(error){
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function cleanText(value){
  return String(value || '').trim();
}

function publicAccount(account){
  if(!account) return null;
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    school: account.school,
    program: account.program,
    created_at: account.created_at
  };
}

function hashPassword(password){
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function createRow(table, payload){
  const now = new Date().toISOString();
  if(table === 'marketplace_listings'){
    return {
      id: crypto.randomUUID(),
      category: cleanText(payload.category),
      product: cleanText(payload.product),
      seller: cleanText(payload.seller),
      business: cleanText(payload.business),
      location: cleanText(payload.location),
      phone: cleanText(payload.phone),
      email: cleanText(payload.email),
      price: cleanText(payload.price),
      description: cleanText(payload.description),
      created_at: now
    };
  }
  if(table === 'partner_profiles'){
    return {
      id: crypto.randomUUID(),
      name: cleanText(payload.name),
      idea: cleanText(payload.idea),
      skills: cleanText(payload.skills),
      needs: cleanText(payload.needs),
      contact: cleanText(payload.contact),
      created_at: now
    };
  }
  if(table === 'business_discussions'){
    return {
      id: crypto.randomUUID(),
      title: cleanText(payload.title),
      category: cleanText(payload.category),
      details: cleanText(payload.details),
      name: cleanText(payload.name),
      created_at: now
    };
  }
  if(table === 'community_groups'){
    return {
      id: cleanText(payload.id) || `group-${Date.now()}`,
      title: cleanText(payload.title),
      topic: cleanText(payload.topic),
      text: cleanText(payload.text),
      features: cleanText(payload.features),
      picture: payload.picture || '',
      created_at: now
    };
  }
  if(table === 'group_messages'){
    return {
      id: crypto.randomUUID(),
      group_id: cleanText(payload.group_id),
      sender: cleanText(payload.sender),
      body: cleanText(payload.body),
      message_type: cleanText(payload.message_type || 'text'),
      duration: cleanText(payload.duration),
      attachment_name: cleanText(payload.attachment_name),
      created_at: now
    };
  }
  return null;
}

async function handleAccountApi(req, res, url){
  if(url.pathname !== '/api/accounts/signup' && url.pathname !== '/api/accounts/login') return false;
  if(req.method === 'OPTIONS'){
    sendJson(res, 200, { ok: true });
    return true;
  }
  if(req.method !== 'POST'){
    sendJson(res, 405, { error: 'Method not allowed' });
    return true;
  }

  try{
    const payload = await readBody(req);
    const db = readDb();
    db.user_accounts = db.user_accounts || [];
    const email = cleanText(payload.email).toLowerCase();
    const password = String(payload.password || '');

    if(!email || !password){
      sendJson(res, 400, { error: 'Email and password are required' });
      return true;
    }

    if(url.pathname === '/api/accounts/signup'){
      if(db.user_accounts.some(account => account.email === email)){
        sendJson(res, 409, { error: 'An account with this email already exists' });
        return true;
      }
      const account = {
        id: crypto.randomUUID(),
        name: cleanText(payload.name),
        email,
        school: cleanText(payload.school),
        program: cleanText(payload.program),
        password_hash: hashPassword(password),
        created_at: new Date().toISOString()
      };
      db.user_accounts.unshift(account);
      writeDb(db);
      sendJson(res, 201, publicAccount(account));
      return true;
    }

    const account = db.user_accounts.find(item => item.email === email && item.password_hash === hashPassword(password));
    if(!account){
      sendJson(res, 401, { error: 'Invalid email or password' });
      return true;
    }
    sendJson(res, 200, publicAccount(account));
  }catch(error){
    sendJson(res, 400, { error: 'Invalid request body' });
  }
  return true;
}

async function handleApi(req, res, url){
  if(req.method === 'OPTIONS'){
    sendJson(res, 200, { ok: true });
    return true;
  }

  const match = url.pathname.match(/^\/api\/([^/]+)(?:\/([^/]+))?$/);
  if(!match || !tables[match[1]]) return false;

  const table = match[1];
  const db = readDb();
  db[table] = db[table] || [];

  if(req.method === 'GET'){
    let rows = db[table];
    if(table === 'group_messages' && url.searchParams.get('group_id')){
      rows = rows.filter(row => row.group_id === url.searchParams.get('group_id'));
      rows = rows.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }else{
      rows = rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    sendJson(res, 200, rows);
    return true;
  }

  if(req.method === 'POST'){
    try{
      const payload = await readBody(req);
      const row = createRow(table, payload);
      if(!row){
        sendJson(res, 404, { error: 'Unknown table' });
        return true;
      }
      db[table].unshift(row);
      writeDb(db);
      sendJson(res, 201, row);
    }catch(error){
      sendJson(res, 400, { error: 'Invalid request body' });
    }
    return true;
  }

  sendJson(res, 405, { error: 'Method not allowed' });
  return true;
}

function serveStatic(req, res, url){
  const requestedPath = url.pathname === '/' ? '/HTML/index.html' : decodeURIComponent(url.pathname);
  const filePath = path.resolve(rootDir, `.${requestedPath}`);
  if(!filePath.startsWith(rootDir)){
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if(error){
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if(await handleAccountApi(req, res, url)) return;
  if(await handleApi(req, res, url)) return;
  serveStatic(req, res, url);
});

ensureDb();
server.listen(port, host, () => {
  console.log(`A.E CONNECT SPACE backend running at http://localhost:${port}`);
});
