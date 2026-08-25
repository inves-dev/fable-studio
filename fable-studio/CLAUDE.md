# CLAUDE.md — Fable Studio by Nana Games (global)

> Read this before opening any file. Every Claude session working in this
> monorepo MUST follow the rules below. Package-level `CLAUDE.md` files
> add local rules on top.

## Project shape

Fable Studio is an npm workspaces monorepo published under the **Nana Games**
studio brand:

- `packages/engine` is the **shared game engine** (`@nanagames/engine`). Pure
  library — ECS, render, input, audio, UI, procedural assets.
- `games/<name>` is a **standalone Capacitor app** per title. Each game
  owns its own `appId`, `vite.config.ts`, `index.html`, and (eventually)
  `android/` / `ios/` shells.

There is **no launcher**. Each game ships as its own mobile app.

```
fable-studio/
  packages/engine/         # @nanagames/engine
    src/                   # engine modules (core, render, input, audio, ui, util, assets)
    package.json           # type: module, main: ./src/index.ts
    tsconfig.json
  games/neon-survivor/     # @nanagames/neon-survivor — appId com.nanagames.neonsurvivor
  games/candy-crush/       # @nanagames/candy-crush   — appId com.nanagames.candycrush
  package.json             # workspaces: ["packages/*", "games/*"]
```

## Hard rules

1. **Engine is library, not app.** Never add `index.html`, `vite.config.ts`,
   or `capacitor.config.json` under `packages/engine/`.
2. **One Capacitor app per game.** Each `games/<name>` has exactly one
   `capacitor.config.json` with a unique `appId` under the `com.nanagames.*`
   namespace.
3. **Import the engine as `@nanagames/engine`.** Never reach into
   `packages/engine/src/...` from a game. Vite resolves the alias in each
   game's `vite.config.ts`.
4. **Zero extra deps** beyond what each package's `package.json` declares.
   Do not add UI kits, physics libraries, or audio codecs.
5. **Every file < 200 lines.** Split early; small files are reviewable files.
6. **TypeScript strict.** No `any` in engine code. Use `unknown` + narrowing.
7. **Semantic API only.** User-facing surfaces expose methods like
   `button.onTap`, `hud.setHealth`, `audio.playSfx(spec)` — not raw DOM access.
8. **No raw DOM mutation in systems.** UI components own their DOM nodes.
9. **No `import * as THREE from 'three'` in game code.** Always go through
   `engine/assets/procedural/AssetLibrary`.
10. **No audio files.** SFX and music come from `SfxLibrary` and
    `MusicGenerator`.
11. **All UI lives in HTML, not WebGL.** Render = Three.js. UI = DOM.
12. **Port discipline.** Neon dev server = 5173, Candy dev server = 5174.
    Pick a new port (5175+) for any new game.

## Architectural patterns

- **Singleton state lives in `engine/` modules.** `AudioManager`, `bus`,
  `NEON` color palette are imported directly.
- **ECS for game logic.** Components are tokens; systems run in priority
  order.
- **Frame loop:** fixed-timestep simulation, decoupled render. Cap `dt` at
  0.1s to survive tab unfocus.
- **Capacitor detection:** `window.Capacitor?.isNativePlatform?.()` decides
  whether to mount UI affordances differently. Code paths are shared.

## How to add a new game

1. Create `games/<name>/` with `package.json`, `vite.config.ts`,
   `capacitor.config.json`, `tsconfig.json`, `index.html`, and `src/main.ts`.
2. Use `@nanagames/engine` in imports. Add the Vite alias to the game's
   `vite.config.ts` pointing to `../../packages/engine/src`.
3. Pick a unique `com.nanagames.<name>` `appId` and a free Vite port (5175+).
4. Add a workspace entry to root `package.json` only if it isn't already
   covered by `games/*`.

## Verification checklist before PR

- [ ] `npm run build:engine` passes (engine typecheck).
- [ ] Each new file under 200 lines.
- [ ] No `any` introduced.
- [ ] No new dependencies outside the affected package.
- [ ] Engine still has no app-level files (`index.html`, `vite.config.ts`,
      `capacitor.config.json`).
