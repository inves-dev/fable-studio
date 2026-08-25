# Build Instructions — Fable Studio by Nana Games

Guia de build, instalação e empacotamento dos jogos do studio. Cada jogo
vive em `games/<name>/` e é um app Capacitor independente.

## Pré-requisitos

| Ferramenta       | Versão mínima | Para quê                              |
| ---------------- | ------------- | ------------------------------------- |
| Node.js          | 20.x          | dev server, build web, tooling        |
| npm              | 10.x          | workspaces, scripts                   |
| Java JDK         | 17            | build Android (Gradle)                |
| Android Studio   | Hedgehog 2023.1+ | SDK, emulador, debug de plataforma  |
| Xcode            | 15+           | build iOS (somente macOS)             |
| Capacitor CLI    | 7.x           | `npx cap ...` (vem como dep de cada jogo) |

> Sem Android Studio: você ainda consegue `npm run dev:<jogo>` e testar no
> navegador. Sem Xcode (em Linux/Windows): iOS fica fora.

## Instalação

Uma vez por máquina:

```bash
cd fable-studio
npm install
```

Como o `package.json` raiz declara `workspaces: ["packages/*", "games/*"]`,
o `npm install` resolve todos os workspaces e instala deps de engine e
jogos de uma vez.

## Dev local (web)

```bash
# Neon Survivor → http://localhost:5173
npm run dev:neon

# Candy Crush → http://localhost:5174
npm run dev:candy
```

Ou dos atalhos por jogo:

```bash
cd games/neon-survivor
npm run dev
```

Hot reload de Vite. O alias `@nanagames/engine` aponta para
`packages/engine/src/` — qualquer mudança na engine recarrega o jogo na hora.

## Build web (produção)

```bash
npm run build:neon
# → games/neon-survivor/dist/

npm run build:candy
# → games/candy-crush/dist/
```

Esse diretório `dist/` é o `webDir` configurado em cada
`capacitor.config.json`.

### Typecheck da engine

```bash
npm run build:engine
# ou: npm --workspace @nanagames/engine run typecheck
```

## Mobile — Android

### Adicionar plataforma Android (uma vez só)

Cada jogo já vem com `capacitor.config.json`. Falta gerar o shell nativo:

```bash
cd games/neon-survivor
npx cap add android
```

Isso cria `games/neon-survivor/android/`. Repita para qualquer jogo novo.

### Sincronizar web → nativo

Toda vez que mudar o código web ou deps:

```bash
cd games/neon-survivor
npm run build
npx cap sync android
```

O script `sync:android` no `package.json` faz ambos em um comando.

### APK debug (instalar no device)

Com device/emu conectado (verifique com `adb devices`):

```bash
cd games/neon-survivor/android
./gradlew assembleDebug
# saída: app/build/outputs/apk/debug/app-debug.apk

adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.nanagames.neonsurvivor/.MainActivity
```

Hot reload em debug: rode `npx cap run android` em vez de instalar o APK na
mão — ele instala e abre o app direto.

### APK release (sem publicar)

Para testar o build assinado localmente antes de configurar a keystore de
produção:

```bash
cd games/neon-survivor/android
./gradlew assembleRelease
# saída: app/build/outputs/apk/release/app-release-unsigned.apk
```

Por padrão o APK release sai **não-assinado**. Para assinar com a keystore
de produção, siga `SETUP-KEYSTORE.md` e use `./gradlew bundleRelease` para
gerar o AAB da Play Store.

## Mobile — iOS (somente macOS)

```bash
cd games/neon-survivor
npx cap add ios            # uma vez só
npx cap sync ios
npx cap open ios           # abre o Xcode
```

No Xcode:

1. Selecione o target **Neon Survivor** → **Signing & Capabilities**.
2. Escolha sua Team (Apple Developer account).
3. **Product → Archive**.
4. Quando o Organizer abrir: **Distribute App → App Store Connect → Upload**.

Para testar no simulador: **Product → Run** com um simulador iOS
selecionado.

## Ícone / splash gerados

O SVG fonte vive em `games/<name>/capacitor-assets/icon.svg`. Para gerar
todos os PNGs multi-density (mipmap, AppIcon iOS, splash):

```bash
cd games/neon-survivor
npx capacitor-assets generate
```

Requer `@capacitor/assets` instalado localmente. Roda uma vez ou quando o
SVG mudar.

## Troubleshooting

### `Module not found: @nanagames/engine/...`

O alias não está resolvendo. Confira em `games/<name>/vite.config.ts`:

```ts
resolve: {
  alias: {
    '@nanagames/engine': resolve(__dirname, '../../packages/engine/src'),
  },
}
```

E em `tsconfig.json`:

```json
"paths": {
  "@nanagames/engine": ["../../packages/engine/src/index.ts"]
}
```

### `npx cap sync android` falha com erro de Gradle

- Confirme que `JAVA_HOME` aponta para JDK 17 (`java -version`).
- Rode `./gradlew clean` dentro de `android/` antes de tentar de novo.
- Verifique se `ANDROID_HOME` está setado (ou use o SDK Manager do
  Android Studio).

### Build iOS falha: "No signing certificate"

Abra o projeto no Xcode (`npx cap open ios`), selecione o target, vá em
**Signing & Capabilities** e escolha a Team. Sem conta Apple Developer paga,
você só consegue rodar no simulador.

### App abre e fica tela branca em produção

Geralmente é `base` errado no `vite.config.ts`. Confirme que está como
`base: './'` (relativo), não `/`. Senão o Capacitor não acha os assets em
`dist/`.

### `npm install` reclama de peer deps do Three

O engine e os jogos declaram `three: ^0.180.0`. Se aparecer warning,
`npm install` ainda conclui. Não instale `three` direto em `games/<name>/`
— vá pelo engine.

### `capacitor.config.json` ficou desatualizado depois de renomear

Cada `capacitor.config.json` mora no jogo. Edite direto. Não há versão
central — duplicação é intencional, cada jogo é independente.

## Próximos passos

- Configurar keystore de produção: leia `SETUP-KEYSTORE.md`.
- Preparar metadata da loja: leia `STORE-LISTING.md`.
- Adicionar um jogo novo: `games/<name>/` seguindo o layout do `neon-survivor`,
  porta livre a partir de 5175.
