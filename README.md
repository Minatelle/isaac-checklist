# Isaac Checklist

A personal progress tracker for **The Binding of Isaac: Repentance** completion marks. The app mirrors the wiki-style completion table so you can see, at a glance, which marks you have earned and which character unlocks you still need.

## What it does

Each row is a completion mark (Mom's Heart, Isaac, Satan, Boss Rush, and so on). Columns show every playable character and the item or unlock tied to that mark for them. You can:

- **Switch between Regular and Tainted characters** — two separate checklists, one per character roster.
- **Mark unlocks as done** — click a cell to toggle it; your progress is saved in the browser automatically.
- **Track overall progress** — a counter at the top shows how many unlocks you have completed and your completion percentage.
- **Connect Steam** — sign in with Steam OpenID and import unlocked achievements into the checklist.

Hard-mode marks, associated bosses, and completion mark icons are all shown in the same layout you would expect from the game wiki, so you can use this as a living checklist while grinding marks.

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

Steam login/sync requires the Vercel API routes. Do **not** use `npm start` alone for Steam testing — `/api/*` will fall through to the Angular router and fail.

```bash
npm i -g vercel   # once
npm run dev:vercel
```

Open the URL shown by the CLI (usually [http://localhost:3000](http://localhost:3000)), not `:4200`.

Create a `.env.local` with:

```bash
STEAM_WEB_API_KEY=your_key_here
STEAM_REALM=http://localhost:3000
```

## Steam setup (production)

1. Create a Steam Web API key at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey).  
   Domain name: your hostname only (example: `isaac-checklist.vercel.app`).
2. In the Vercel project, set:
   - `STEAM_WEB_API_KEY` — the key from step 1
   - `STEAM_REALM` — full public URL with https (example: `https://isaac-checklist.vercel.app`)
3. On Steam, set **Profile → Privacy → Game details** to **Public**, or sync will fail with a private-profile error.

Never commit the API key. Keep it only in Vercel env vars / local `.env.local`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the Angular app only (`ng serve`) |
| `npm run dev:vercel` | Run Angular + Steam API routes via `vercel dev` |
| `npm run build` | Production build (`dist/isaac/`) |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |

## License

[MIT](LICENSE)
