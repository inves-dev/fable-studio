# Nana Games — Fable Studio

**Nana Games** é um estúdio de jogos mobile multiplataforma. Este monorepo,
**Fable Studio**, é onde a mágica acontece: um motor de jogo TypeScript
compartilhado e um app Capacitor por título, publicado sob a marca Nana
Games nas lojas.

## Catálogo

| Jogo              | Package                   | App ID                       | Status     |
| ----------------- | ------------------------- | ---------------------------- | ---------- |
| Neon Survivor     | `@nanagames/neon-survivor` | `com.nanagames.neonsurvivor` | em desenvolvimento |
| Candy Crush       | `@nanagames/candy-crush`   | `com.nanagames.candycrush`   | planejado  |

Cada jogo é um **app Capacitor independente**: tem seu próprio `appId`,
`vite.config.ts`, `index.html`, e shells nativos (`android/`, `ios/`).
Não há launcher — cada título vira um app separado na loja.

## Estrutura

```
fable-studio/
  packages/
    engine/        # @nanagames/engine — ECS, render, input, audio, UI, assets
                   # (biblioteca, nunca um app)
  games/
    neon-survivor/ # @nanagames/neon-survivor — Capacitor app
    candy-crush/   # @nanagames/candy-crush   — Capacitor app
  package.json     # npm workspaces root
  README.md
  CLAUDE.md        # regras globais para sessões Claude
  BUILD-INSTRUCTIONS.md
  SETUP-KEYSTORE.md
  STORE-LISTING.md
```

### Regras de layout

- O **engine** é biblioteca, nunca um app. Sem `index.html`, sem
  `vite.config.ts`, sem `capacitor.config.json` em `packages/engine/`.
- Cada jogo em `games/*` é um **standalone Capacitor app** com seu próprio
  `appId`, `vite.config.ts` e `index.html`.
- Jogos importam o engine via alias `@nanagames/engine`, resolvido pelo Vite
  para `packages/engine/src/index.ts`. Não há build step do engine.

## Como rodar

Pré-requisitos: **Node 20+**. Para mobile: **Java 17 + Android Studio**
(Android), **Xcode 15+** (iOS, só macOS).

```bash
# uma vez
npm install

# dev — Neon Survivor (http://localhost:5173)
npm run dev:neon

# dev — Candy Crush (http://localhost:5174)
npm run dev:candy

# build web (produção)
npm run build:neon
npm run build:candy

# typecheck do engine
npm run build:engine

# atalho: typecheck + dev do neon
npm run studio
```

Tudo via `npm --workspace @nanagames/<name> ...` por baixo dos panos.

## Build mobile

Cada jogo tem seu próprio `capacitor.config.json`. Adicione a plataforma
nativa uma vez e sincronize a cada release:

```bash
cd games/neon-survivor
npx cap add android      # uma vez só, gera android/
npm run build
npx cap sync android
npx cap open android     # abre no Android Studio
```

Guia completo (APK debug, release assinado, AAB da Play Store, iOS
Archive, troubleshooting) em **`BUILD-INSTRUCTIONS.md`**.

## Publicação

Para publicar na Google Play:

1. Configure a keystore de release: **`SETUP-KEYSTORE.md`**.
2. Gere o AAB: `./gradlew bundleRelease` em `android/`.
3. Upload na Play Console.
4. Preencha metadata: **`STORE-LISTING.md`** (descrição, screenshots,
   classificação etária).

## Stack

- **TypeScript** strict em todo lugar.
- **Three.js** para render 3D.
- **Capacitor 7** para empacotar web em app nativo.
- **Vite 5** para dev server e bundling.
- **ECS** próprio no engine (sem dependências externas de física/UI/audio).

Sem UI kits, sem física extra, sem codecs de áudio. Tudo procedural.
Toda UI é DOM, todo o resto é WebGL.

## Convenções

- Cada arquivo < 200 linhas. Prefira dividir a crescer.
- Sem `any` no engine. Use `unknown` + narrowing.
- API semântica: `button.onTap`, `hud.setHealth`, `audio.playSfx(spec)`.
- Sem mutação de DOM fora de componentes UI.
- Sem `import * as THREE from 'three'` em código de jogo — use o
  `AssetLibrary` procedural.
- Sem arquivos de áudio. SFX e música vêm de `SfxLibrary` e
  `MusicGenerator`.

Veja `CLAUDE.md` para o conjunto completo de regras.

## Licença

Privado. © Nana Games.
