# A.E CONNECT SPACE Launch Notes

## Current Live Site

- Public URL: https://ae-connect-space.aeconnectbrand609.chatgpt.site
- Sites project ID: `appgprj_6a5acd8e42b48191a9ba72e1bcb69576`
- Current Sites version: `4`
- Current deployed commit: `187e23f41ab891a712262a9ba6f6cebfbbdb51ab`
- Access: `public`

## Local Project

- Project folder: `C:\Users\afful\Desktop\A.e _CONNECT _SPACE_`
- Homepage source: `HTML/index.html`
- Root redirect page: `index.html`
- Sites metadata: `.openai/hosting.json`
- Static build command:

```bash
npm run build
```

If `npm` is not available on the computer PATH, use the bundled Node runtime to run:

```bash
node SCRPIT/build-static-site.mjs
```

The build output is `dist/` and must contain:

- `dist/client/`
- `dist/server/index.js`
- `dist/.openai/hosting.json`

## Tomorrow Fast Deploy Steps

1. Open this folder in Codex: `C:\Users\afful\Desktop\A.e _CONNECT _SPACE_`.
2. Confirm changes:

```bash
git status --short
```

3. Build locally:

```bash
npm run build
```

4. Commit the finished launch changes.
5. Push to the Sites source repository.
6. Save a new Sites version from the new commit.
7. Deploy that saved version.
8. Check the public URL returns `200 OK`.

## Important Backend Note

The current public launch is static. Browser/local fallback works, but shared public accounts, marketplace posts, discussions, partner profiles, groups, and messages need Supabase connected for real public data.

To make the backend public:

1. Create a Supabase project.
2. Run `BACKEND/supabase-schema.sql` in Supabase SQL Editor.
3. Add the Supabase URL and anon public key in `SCRPIT/backend-config.js`.
4. Rebuild, commit, save a new Sites version, and deploy.

Do not commit private service-role keys. Only the Supabase anon public key belongs in frontend config.
