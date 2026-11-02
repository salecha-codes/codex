# Vercel architecture

The frontend is an ES-module Three.js bundle plus static assets in `dist/`. Vercel
builds `api/game.js` as a separate Node.js 24 function. `vercel.json` routes both
`/game-api/*` and compatible `/api/rooms*` requests to that function. `/c/*` invites
serve the same game page.

The browser always calls its own origin and sends an `X-Room-Token` for authenticated
room actions. The Node adapter accepts raw HTTP bodies and Vercel-parsed bodies,
limits their size, and rejects cross-origin writes. Session data is never cached.

## Shared storage

Without database configuration, the function forwards a strict allowlist of room
routes to the existing game service. It replaces the browser Origin with the actual
upstream service Origin after validating the incoming request, forwards only room
authentication, and filters responses to JSON. It does not proxy arbitrary URLs,
redirects, cookies, platform authentication, editor UI, or private chat content.

## Independent storage

`ROOM_STORAGE=postgres` selects the shared room business logic with a Neon HTTP
Postgres database adapter. Existing bound SQL is compiled to numbered Postgres
parameters; quoted strings and comments remain intact. Database values are never
interpolated into SQL. Multi-statement writes use transactions. Initialization
creates tables/indexes behind a transaction-scoped advisory lock. Room timestamps
are normalized to safe JavaScript numbers.

Room codes and hashed membership tokens identify sessions. Host-only operations,
team allocation, room capacity, settings, expiry and signaling use the same API
contract as the existing game. WebRTC is an optimization; relay state/input exchange
remains functional on its own. No production session state depends on a warm function.

Local development injects a SQLite-backed implementation of the same storage
interface. Postgres conformance tests run the real SQL in PGlite, not an SQL-string
mock. The Vercel request tests exercise actual host/guest APIs through the shared
forwarding layer using a local database service.
