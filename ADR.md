# Architecture Decision Records (ADR)

## ADR 1: Hybrid SSR + Client-Side Components Architecture (EJS + Lit)

### Context
The assessment requires building a Social Marketplace using EJS for server-side rendering and Lit for client-side interactive components. We needed to decide how SSR and client-side interactivity would coexist and how the server would determine which components to render.

### Options Considered
1. **Full SSR with EJS only** — All rendering server-side with minimal client JS
2. **Full SPA with Lit only** — Single-page application ignoring EJS requirement
3. **Hybrid: EJS page shells + Lit web components** — Server renders HTML structure, Lit handles interactivity

### Decision
**Option 3: Hybrid architecture.** EJS templates render the page shell (HTML structure, meta tags, layout) while Lit web components handle all interactive functionality. The server determines which Lit components to load per page via a `components` array passed to each EJS template.

### Tradeoffs
**Pros:**
- Fulfills both EJS and Lit requirements
- Server-determined component loading reduces unnecessary JS payload
- SEO-friendly: initial page shell is server-rendered
- Each component is independently reusable and testable
- Clean separation of concerns between page structure and interactivity

**Cons:**
- Initial data needs to be passed from EJS to Lit components (via attributes or fetch)
- Two rendering layers add complexity
- Component hydration timing needs careful management

---

## ADR 2: WebSocket with HTTP Polling Fallback for Real-Time Messaging

### Context
The application requires real-time messaging between buyers and sellers. The provided backend already supports HTTP polling endpoints. The assessment mentions using WebSockets for direct messaging.

### Options Considered
1. **HTTP Polling only** — Use the existing polling endpoints as-is
2. **WebSocket only** — Replace polling entirely with WebSocket
3. **WebSocket primary with HTTP polling fallback** — Use WebSocket when available; fall back to polling

### Decision
**Option 3: WebSocket with HTTP fallback.** The `ws` package is used on the server to establish WebSocket connections. Clients attempt WebSocket first; if the connection fails or drops, they automatically switch to the existing HTTP polling mechanism.

### Tradeoffs
**Pros:**
- True real-time messaging when WebSocket is available
- Graceful degradation for environments that block WebSocket
- Leverages the provided polling API as fallback
- Lower latency and server load compared to polling alone

**Cons:**
- Added complexity in managing two communication channels
- WebSocket state management (connections, reconnections) adds code
- Additional `ws` dependency

---

## ADR 3: Tailwind CSS CDN vs Build Pipeline

### Context
The assessment requires Tailwind CSS for styling. We needed to decide between using the Tailwind CSS CDN (Play CDN) or setting up a full build pipeline with PostCSS.

### Options Considered
1. **Tailwind CDN (Play CDN)** — Load Tailwind via a `<script>` tag, configure in-browser
2. **PostCSS build pipeline** — Install Tailwind as a dependency with purging and build step
3. **Tailwind CDN + Custom CSS file** — CDN for utilities, separate CSS for complex animations/styles

### Decision
**Option 3: Tailwind CDN + Custom CSS.** The Tailwind Play CDN is loaded in the layout template with a custom configuration for colors and fonts. Complex styles (glassmorphism, animations, chat bubbles) are in a dedicated `styles.css` file. Each Lit component also uses the built-in `css` tagged template for encapsulated Shadow DOM styles.

### Tradeoffs
**Pros:**
- Zero build step for Tailwind — faster development iteration
- Custom config via `tailwind.config` object in the `<script>` tag
- Component-scoped styles via Shadow DOM avoid conflicts
- Custom CSS file handles complex animations Tailwind can't express easily

**Cons:**
- Tailwind CDN includes all utilities (no tree-shaking/purging) — larger initial download
- CDN dependency for Tailwind (requires internet connection)
- Shadow DOM means Tailwind utility classes don't reach inside Lit components (by design — components use their own `css`)

---

## ADR 4: Client-Side Session Management with localStorage

### Context
The application needs user authentication to enable buying, selling, and messaging. We needed to decide how to manage user sessions after login.

### Options Considered
1. **Server-side sessions with cookies (express-session)** — Traditional session management
2. **JWT tokens** — Stateless auth with signed tokens
3. **Client-side localStorage** — Store user data directly in the browser

### Decision
**Option 3: Client-side localStorage.** After successful login/registration via the API, the user object (without password) is stored in `localStorage`. Components read from `localStorage` to determine auth state and user identity. A custom `user-changed` event is dispatched to notify all components of auth state changes.

### Tradeoffs
**Pros:**
- Simple to implement — no session middleware or token refresh logic
- Works seamlessly with the hybrid SSR/SPA architecture
- Persists across page reloads without additional server calls
- All Lit components can independently access user state

**Cons:**
- Not secure for production (no CSRF protection, no httpOnly cookie)
- User data is accessible via browser DevTools
- No server-side session validation (any API call trusts the client-provided userId)
- Suitable for a demo/assessment but would need proper auth for production
