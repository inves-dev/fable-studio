# Setup da Keystore de Release — Nana Games

> **ATENÇÃO:** o arquivo `.keystore` é **secreto** e equivalente a uma senha.
> Quem tem a keystore pode publicar atualizações do app no seu nome. Quem
> **perde** a keystore fica impossibilitado de atualizar o app na loja
> para sempre (Google Play exige a mesma chave em todas as versões;
> Apple exige o profile/certificado da Apple Developer).

## Backup obrigatório

Faça cópias em **pelo menos 3 lugares**:

1. HD externo / pendrive (offline)
2. Serviço de cloud criptografado (1Password, Bitwarden, KeePassXC
   sincronizado)
3. GitHub repository secret (Settings → Secrets and variables → Actions)
   — só pra CI, nunca direto no repo

Faça isso **antes** de publicar a primeira versão. Renomeie o arquivo para
algo identificável: `nanagames-release.keystore`.

## 1. Gerar a keystore

Rode **uma vez** em uma máquina segura:

```bash
keytool -genkey -v \
  -keystore nanagames-release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias nanagames
```

`keytool` vem com o JDK 17. Ele vai pedir:

- **Senha do store** (mín. 6 caracteres) — guarde em gerenciador de senhas.
- **Nome, organização, cidade, estado, país** — preencha com dados reais
  da Nana Games. O CNPJ/razão social vai aparecer em alguns logs.
- **Confirmação** no final.

Resultado: arquivo `nanagames-release.keystore` no diretório atual.

## 2. Configurar `keystore.properties`

Crie `games/neon-survivor/android/app/keystore.properties` (NÃO comite):

```properties
storePassword=SUA_SENHA_DO_STORE
keyPassword=SUA_SENHA_DA_KEY
keyAlias=nanagames
storeFile=nanagames-release.keystore
```

Confirme que `nanagames-release.keystore` está em
`games/neon-survivor/android/app/` (ao lado de `build.gradle`).

Adicione ao `.gitignore` raiz:

```
# Keystore — NUNCA commitar
games/**/android/app/keystore.properties
games/**/android/app/*.keystore
```

## 3. Editar `android/app/build.gradle`

Abra `games/neon-survivor/android/app/build.gradle` e adicione antes do
bloco `android { ... }`:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('app/keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Dentro de `android { ... }`, antes de `buildTypes`:

```groovy
signingConfigs {
    release {
        if (keystorePropertiesFile.exists()) {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
}
```

E dentro de `buildTypes`, troque o `release` para usar o signingConfig:

```groovy
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

> O `if (keystorePropertiesFile.exists())` permite que CI rode
> `assembleDebug` sem ter o arquivo de keystore — só builds release
> exigem o segredo.

## 4. Build do AAB (Android App Bundle)

```bash
cd games/neon-survivor/android
./gradlew bundleRelease
```

Saída: `app/build/outputs/bundle/release/app-release.aab`. Esse é o
artefato que vai pra Play Store.

## 5. Upload na Play Console

1. https://play.google.com/console → selecione **Neon Survivor** (crie o
   app se for a primeira vez).
2. Menu lateral: **Release → Production → Create new release**.
3. **Upload** do `app-release.aab`.
4. Preencha **Release notes** (o que mudou nesta versão).
5. **Review release** → **Start rollout to Production**.

A revisão da Google leva de algumas horas a alguns dias. Quando aprovado,
o app aparece em **Production**.

## Atualizações futuras

- **Nunca** gere uma keystore nova pra um app já publicado.
- Sempre faça backup do `.keystore` + senhas depois de qualquer rotação.
- Bump `versionCode` em `android/app/build.gradle` (campo
  `defaultConfig.versionCode`) a cada release.

## iOS (opcional)

iOS usa o sistema de certificados da Apple Developer, não keystore Java.
No Xcode: **Signing & Capabilities → Automatically manage signing** com
sua Team. Para CI, use **App Store Connect API key** em vez de keystore.
