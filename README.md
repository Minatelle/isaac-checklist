# Isaac Checklist

Progress tracker for **The Binding of Isaac: Repentance** completion marks. It mirrors the wiki-style completion table so you can see which marks you have and which character unlocks you still need.

## Features

- **Regular and Tainted rosters** — switch between the two character lists in the header
- **Toggle unlocks** — click (or tap) a cell to mark it done; progress is saved in the browser
- **Progress bar** — overall completion count and percentage at a glance
- **Steam sync** — connect your Steam account to import achievements you already unlocked; sync again anytime to pull new ones (fills in marks only, never removes manual ones)
- **Mobile and desktop layouts** — table view on desktop, character-by-character list on mobile
- **Tutorial** — short in-app guide, reopenable from the help icon

## Run locally

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

For Steam sync locally, use `npm run dev:vercel` (needs Steam API env vars on Vercel / `.env.local`). Your Steam **Game details** privacy must be **Public**.

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run the Angular app (`ng serve`) |
| `npm run dev:vercel` | Run Angular + Steam API routes via `vercel dev` |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage report |

## License

[MIT](LICENSE)
