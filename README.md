# Office Chair Rumble

A browser-based rooftop chair brawler: eight arenas, solo bots, shared-keyboard play,
invite-only online rooms for up to four people, and The Boss character prototype.
No installation is required for players.

## Deploy on Vercel

1. Open **[Vercel → New Project](https://vercel.com/new)** and sign in with GitHub.
2. Import **[salecha-codes/codex](https://github.com/salecha-codes/codex)**.
3. Use the repository root and click **Deploy**. `vercel.json` already declares the
   build command and `dist` output. Node.js 24 is selected by `package.json`.
4. Open the resulting production URL. Share that URL or a room invite with friends.

**No environment variables or additional database account are required for the
standard deployment.** Vercel serves the game and its room API; the API forwards
room requests to the existing public room service and persistent storage. It does
not forward cookies or ChatGPT sign-in headers and never forwards HTML pages.
The game on your Vercel URL has no ChatGPT “Edit site” button and does not include
private chats or credentials.

The shared backend must remain available for this default configuration. Vercel
and the original game share room codes in this mode. You can remove that dependency
using the independent storage option below.

### Independent online-room database (optional)

1. In your Vercel project, connect a **Neon Postgres** database from **Storage**.
2. Set the private environment variable `DATABASE_URL` to its connection string
   (`POSTGRES_URL` is also supported). Set `ROOM_STORAGE=postgres`.
3. Redeploy. The API automatically creates the room tables and indexes on first use.
4. Open `/game-api/health` on your deployment and verify `"ok":true`.

The adapter uses parameterized queries and atomic transactions. Rooms and membership
persist across function restarts; production never stores them in a local file or
in-memory map. Room tokens are hashed in the database. Only the host can publish
match state or edit room settings. The four-player limit and team selection remain.
If an independent database is unavailable, the API reports an error; it does not
silently switch players into shared rooms. Never commit database connection strings.

### Settings

| Variable | Default | Purpose |
| --- | --- | --- |
| `ROOM_STORAGE` | `shared` unless a database URL is present | `shared` or `postgres` |
| `DATABASE_URL` / `POSTGRES_URL` | unset | Private Neon/Postgres connection string |
| `ROOM_BACKEND_URL` | Existing public game service | Trusted shared room service origin, server-side only |

Copy `.env.example` if you need local custom settings. Vercel environment variables
must be set in the project dashboard; they are not included in the frontend bundle.

## Run locally

```sh
npm ci
npm run build
npm run dev
```

Open `http://localhost:3090`. Local development uses a persistent SQLite database
at `work/dev.sqlite` by default, so you can test host and guest tabs without external
accounts. Set `PORT` to choose another port. If production room variables are set,
the local server uses that configured backend instead.

## Play with friends

1. The host clicks **Create Room**, selects the arena, mode, number of people and
   optional bots, then creates the room.
2. Share **Copy invite** or the six-letter code. Friends use **Join friends**.
3. The host starts the round once everyone is present. Maximum four active players.

Desktop: WASD/arrows, Space to fire, Shift to boost, C to change camera. Phone:
steering joystick and action buttons. Direct WebRTC connections are attempted;
HTTP room relay remains available when a direct connection cannot be established.

## Arenas and characters

The eight arenas include Skyline HQ, Executive Terrace, Overtime Annex, Urban
Skyline Penthouse, Biophilic Oasis, Neo-Cyber Tech Arena, Vintage Industrial Loft,
and Urban Penthouse · Open Floor. The latter reserves an 82 × 54-unit open center.
Existing maps, modes, controls and art are retained from the current game source.

The Boss is the first new office-cast prototype: eight rendered directional views,
four comeback poses, a live 3D chair, a face-detail preview and a playable rider.
Open `/?character=boss&preview=boss` to inspect him. It is rendered character artwork,
not a sculpted/rigged human mesh. The other five prior roster choices remain.

## Validation

```sh
npm run check
npm test
npm run build
```

Tests cover physics, camera stability, all arenas/modes, the character prototype,
room authorization, four-player limits, Vercel request adaptation, shared backend
forwarding, and real Postgres execution using PGlite. GitHub Actions runs these
checks on pushes and pull requests. A live Neon connection is optional and is not
needed for tests or the default deployment.

## Project files

- `src/` — Three.js game, maps, characters, physics, interface and room networking.
- `public/` — artwork, arena previews and static UI; build output contains no editor.
- `api/game.js` — Vercel Node function handling room API requests.
- `server/rooms.js` — shared-service forwarding and independent-storage selection.
- `server/postgres.js` — persistent Postgres adapter and automatic schema setup.
- `worker/api.js` — shared room business logic, also used for independent storage.
- `scripts/build.mjs` — builds static `dist/`; `scripts/dev.mjs` runs local preview.

Vercel publishing requires access to your own Vercel account. This repository is
ready to import; a successful GitHub push alone is not a Vercel deployment.
