# Neon Survivor — Sessão Pausada (retomar)

> Última atualização: 2026-08-25 11:30 BRT
> Estado do APK no celular: v0.3.0, instalado no Xiaomi Redmi 15

## Estado atual

| Item | Status | Detalhe |
|---|---|---|
| APK builda no CI | ✅ Funcionando | GitHub Actions gera `app-debug.apk` em ~3min |
| Repo no ar | ✅ Público temporariamente | https://github.com/inves-dev/fable-studio — voltar pra privado quando terminar |
| Splash "NanaGames" com fade | ✅ v0.3.0 | z-index 50, 2s transition |
| Menu mobile (sem WASD) | ✅ v0.3.0 | `body.is-mobile` toggle |
| Botão hide removido | ✅ v0.3.0 | a pedido |
| HUD menor no mobile | ✅ v0.3.0 | bar-wrap 240→150, font down |
| Câmera recuada no mobile | ✅ v0.3.0 | camDist 5.4, height 2.6 |
| **Joysticks botões funcionam?** | ❌ **BLOQUEADO** | "retorno visual mas nada funciona, nem joysticks" — `captureInput: false` em v0.3.0 não foi suficiente |
| **Performance** | ❌ **BLOQUEADO** | "degradação séria, jogo muito pesado" em Redmi 15 |

## Problemas abertos (PRIORIDADE)

### 1. CRÍTICO: Controles mobile não funcionam (botões com retorno visual, mas sem ação)

**Sintoma**: O usuário vê o botão "afundar" (estado `:active` CSS funciona) mas o jogo não responde. O joystick arrasta mas o player não se move. FIRE pressionado mas não atira.

**O que já foi tentado** (não resolveu):
- v0.2.0: import do `MobileControls.css` (CSS bundling) → controle ficou VISÍVEL mas não funcionava
- v0.3.0: `captureInput: false` no capacitor.config.json → não resolveu

**Teorias pra investigar quando retomar**:

1. **Listeners registrados em elemento errado**: O `setupMobileControls` é chamado DEPOIS do `window.GAME` aparecer (poll de 5s). O `game` capturado no closure pode ser `undefined` ou stale se GAME foi recriado. Olhar `src/boot.ts:78-105` e ver se o `game.mouse.down = true` está realmente chegando no jogo.

2. **DASH bug conhecido**: Olhar `src/game-source.ts:3010-3015` — o código DASH faz `GAME.keys['Space'] = false;` IMEDIATAMENTE após ler. Se o joystick mandar o `Space=true`, o jogo lê, faz o dash, e reseta pra `false`. Mas se o joystick mandar de novo, não é "one-shot", é só flag. Verificar que `onDash` tá realmente disparando.

3. **Mobile joystick escreve em window.GAME.keys, mas o update loop pode estar lendo de uma referência stale**: Olhar `src/mobile/MobileControls.ts:114-119`:
   ```js
   const k = (window as any).GAME?.keys ?? {};
   k.KeyW = dy < -dead;
   ...
   if ((window as any).GAME) (window as any).GAME.keys = k;
   ```
   Se o `GAME.keys` for um proxy/Proxy, atribuir pode falhar. Mais provável: o objeto `GAME.keys` é o mesmo objeto, então `k.KeyW = true` MUTA o objeto in-place (a reatribuição `GAME.keys = k` é redundante mas não causa). Mas se a referência `k` foi capturada ANTES de o jogo recriar `GAME.keys`, escreve no lugar errado. **Verificar isso primeiro.**

4. **`GAME.state === 'playing'` pode estar false**: O joystick move, mas se o estado é 'menu' ou 'paused', o update loop ignora. Verificar com `console.log(GAME.state)` via chrome://inspect (precisa religar `webContentsDebuggingEnabled: true`).

5. **Listeners no canvas bloqueando os do joystick**: O `mousedown` no `renderer.domElement` (game-source.ts:2667) chama `requestPointerLock()` que pode jogar erro em mobile e propagar. Adicionar `e.stopPropagation()` nos joysticks. OU, mudar o listener de `mousedown` pra `pointerdown` e fazer capture-phase.

6. **Pointer events sintéticos do WebView**: Android WebView pode disparar `touchstart` antes de `pointerdown`, e o `setPointerCapture` falha em alguns devices. Adicionar listener `touchstart` como fallback.

**Ação de debug recomendada antes de mais fixes**:
1. Religar `webContentsDebuggingEnabled: true` em capacitor.config.json
2. Instalar via `adb install -r` e conectar USB
3. Abrir `chrome://inspect/#devices` no Chrome desktop
4. Colocar breakpoint em `setupMobileControls` callback `onShootDown` → ver se dispara
5. Colocar breakpoint em `GAME.keys.KeyW = ` → ver se a atribuição chega
6. Verificar `GAME.state` em runtime

### 2. CRÍTICO: Performance ruim no Redmi 15 (e provavelmente em low/mid-end)

**Sintomas**:
- "degradação séria"
- "muito pesado"
- Jogo começa OK e degrada conforme waves sobem (especulação — confirmar)

**Device**: Xiaomi Redmi 15 — Android intermediário, ~Android 13/14, GPU Mali-G57 ou similar. Não é low-end hard, mas não é high-end.

**O que já foi feito em perf** (v0.2.0 + v0.3.0):
- antialias off
- Reinhard toneMapping
- pixelRatio 1.25 (vs 1.5)
- powerPreference: 'low-power'
- ENEMY_CAP 35 no mobile (vs 80 PC)
- AI O(n²) gated em > 20 inimigos
- Particle pool (320 meshes pre-alocados, zero alloc per burst)
- moveDir/fwd/right extraídos pra escopo de módulo
- Helper `_burstPosAt` evita clones+new Vector3

**Mas claramente não foi suficiente**. Teorias pra quando retomar:

1. **MeshStandardMaterial é PESADO em mobile**:
   - `src/game-source.ts` linhas 920, 1120, 1180, 1230, 1235, 1242 usam `new MeshStandardMaterial({...})` para prédios/inimigos
   - **MeshStandardMaterial** faz PBR (physically based rendering) com multiple lights, fresnel, etc. Em mobile é o vilão #1.
   - **Fix**: trocar pra `MeshLambertMaterial` (mais barato, diffuse-only, suporta lights)
   - **Impacto estimado**: 30-50% GPU

2. **Múltiplas luzes dinâmicas**:
   - `grep "new THREE.PointLight" src/game-source.ts` — inimigos têm point lights, pickups têm point lights
   - WebGL com 5+ lights é quadratic em fragment shader
   - **Fix**: remover point lights de inimigos (usar emissive no material). Manter só 1-2 luzes principais (lua + sol).
   - **Impacto estimado**: 20-40% GPU

3. **Sky shader custom** (linha 833): `new THREE.ShaderMaterial` com vertex/fragment customizado, atualizado por frame. Provavelmente barato mas roda no fragment shader.
   - **Fix**: substituir por `MeshBasicMaterial` com cor sólida + fog. Sky é bonito mas é fundo — fundo simples basta.

4. **CanvasTexture geradas a cada building** (linha 985, 1057): `new THREE.CanvasTexture(c)` em cada prédio no boot. Texto de 128x256 com operações de canvas 2D. Custo de upload de textura pra GPU.
   - **Fix**: gerar UMA textura compartilhada e fazer UV scroll/offset por prédio. Ou pré-gerar 4-5 texturas no boot e reusar.

5. **Shadow map ainda configurado**:
   - `renderer.shadowMap.enabled = false` ✓ (já está)
   - Mas `moon.castShadow = true` ainda existe no setup da luz (linha ~1209) — pode estar calculando shadow frustum desnecessariamente.

6. **Bloom ou post-processing**:
   - Procurar `EffectComposer`, `UnrealBloomPass` no game-source. Se tiver, é pesadíssimo em mobile.

7. **`MeshStandardMaterial` em wave boss pode ter mais de 1 luz por mesh**:
   - Boss pode ter `emissive` + `metalness` + `roughness` + lights = 5+ uniforms por pixel
   - Trocar tudo pra Lambert corta drasticamente.

8. **Fog (linha 826)**: `scene.fog = new THREE.FogExp2(0x25204a, 0.0075)` — exponential fog em fragment shader. Aceitável mas custa.

**Ordem de ataque sugerida (maior impacto primeiro)**:
1. MeshStandardMaterial → MeshLambertMaterial em todos inimigos/prédios
2. Remover PointLights de inimigos (substituir por emissive)
3. ShaderMaterial do sky → MeshBasicMaterial
4. Investigar EffectComposer/UnrealBloomPass
5. Pré-aquecer shaders com `renderer.compile(scene, camera)` no boot

### 3. IMPORTANTE: Outras melhorias pedidas

- Câmera ainda pode estar perto (testar no device)
- HUD ainda pode estar grande (testar no device)
- Splash demora quanto tempo? (testar — pode estar muito rápido)

## Como retomar

1. **Ler este doc primeiro** — contexto completo
2. **Recarregar HANDOFF.md do repo** (atualizado até v0.3.0)
3. **Antes de mais código**: religar `webContentsDebuggingEnabled: true` e fazer debug real no device via `chrome://inspect`
4. **Confirmar teoria #3 da seção 1 (keys stale)** com breakpoint — se for isso, fix é trivial
5. **Aplicar MeshStandardMaterial → Lambert** em massa (mudança grande, testar em waves 1, 5, 10)
6. **Build local primeiro** (`npm run build`), depois push pro CI

## Comandos úteis

```bash
# Local build (rápido)
cd /Users/mac/Documents/Joguinho/Fable/fable-studio/games/neon-survivor
npm run build

# Build + ver tamanho
ls -lh dist/assets/

# Push e ver CI
cd /Users/mac/Documents/Joguinho/Fable
git push origin main
gh run watch <ID> --repo inves-dev/fable-studio

# Baixar APK
gh run download <ID> --repo inves-dev/fable-studio --name neon-survivor-debug-apk

# Criar release
gh release create v0.X.0 --repo inves-dev/fable-studio --title "..." --notes "..." app-debug.apk

# Instalar no device
adb install -r app-debug.apk

# DevTools remoto (precisa USB + webContentsDebuggingEnabled: true)
chrome://inspect/#devices
```

## Arquivos críticos

- `fable-studio/games/neon-survivor/capacitor.config.json` — captureInput, debugging
- `fable-studio/games/neon-survivor/src/mobile/MobileControls.ts` — handlers, listeners
- `fable-studio/games/neon-survivor/src/boot.ts` — wiring, isNative, body.ready
- `fable-studio/games/neon-survivor/src/game-source.ts` — performance, render loop, materials
- `fable-studio/games/neon-survivor/index.html` — HUD, splash, menu, CSS mobile
- `fable-studio/games/neon-survivor/src/mobile/MobileControls.css` — sizing

## Releases publicadas

- v0.1.0-debug — APK inicial, controles invisíveis
- v0.2.0-mobile — controles visíveis, mas captureInput bloqueando
- v0.3.0-mobile-perf — particle pool + GC fixes, mas controles AINDA não funcionam

**Próxima**: v0.4.0 — debugar controles + agressivo MeshStandardMaterial→Lambert
