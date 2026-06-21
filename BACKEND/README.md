# A.E CONNECT SPACE Backend

This project now has two backend options:

- A local Node backend for testing with friends on the same Wi-Fi
- A Supabase backend for a public deployed website

- Student signup and login
- Marketplace product listings
- Business discussions
- Partner profiles
- Academic/community groups
- Group messages

## Local Friend Testing

1. Run:

```bash
node BACKEND/server.js
```

2. Open:

```text
http://localhost:3000
```

3. To test with a friend on the same Wi-Fi, find your computer IP address and send them:

```text
http://YOUR-IP-ADDRESS:3000
```

The local backend saves shared records into `BACKEND/data/db.json`.

## Public Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Paste and run `BACKEND/supabase-schema.sql`.
4. Open `SCRPIT/backend-config.js`.
5. Add your Supabase project URL and anon public key.
6. Deploy the website online with Netlify, Vercel, GitHub Pages, or any static hosting.

Until Supabase keys are added, the website still works with the local backend when served by `BACKEND/server.js`, or browser storage when opened another way.
