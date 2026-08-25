# Android Build Guide — Neon Survivor

This guide walks you from a clean checkout to an installable APK on a phone.
The Capacitor Android project (`android/`) is **not** in the repo on purpose
— it's generated locally by `npx cap add android`. The guide below produces
it, builds a debug APK, and installs it on a device.

> All commands assume your shell is at the repo root (`Fable/`), unless
> noted otherwise.

---

## 1. Prerequisites

Install **once** on your machine. None of these ship with the project.

| Tool                  | Version          | Why                                          |
| --------------------- | ---------------- | -------------------------------------------- |
| **Node.js**           | 20 LTS or newer  | Vite, Capacitor CLI, npm workspaces          |
| **JDK 17**            | 17 (Temurin/Zulu)| Required by Android Gradle Plugin 8+         |
| **Android SDK**       | API 34 minimum   | Build target. Capacitor 7 needs SDK 34+.     |
| **Android cmdline-tools** | latest       | `sdkmanager`, `avdmanager`, `adb`            |
| **Android Studio** (optional) | Hedgehog+ | GUI for SDK manager + emulator + signing     |
| **adb**               | from SDK platform-tools | Install APK + see `logcat`              |

### 1a. JDK 17

Capacitor 7 + AGP 8 require **JDK 17**. JDK 21 mostly works but is not the
default; stick to 17 to avoid surprises.

```bash
brew install --cask temurin@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version   # should print 17.x
```

### 1b. Android SDK + `ANDROID_HOME`

Easiest path: install Android Studio, open it, let it download SDK 34 and
the platform-tools. Then point your shell at the SDK it installed:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"             # macOS
# export ANDROID_HOME="$HOME/Android/Sdk"                   # Linux
# setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"            # Windows (Admin)

export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
```

Verify:

```bash
adb --version
sdkmanager --list_installed   # should show platform-tools, platforms;android-34, build-tools;34.0.0
```

If `platforms;android-34` or `build-tools;34.0.0` are missing:

```bash
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
```

### 1c. Persist the env vars

Add the `JAVA_HOME` + `ANDROID_HOME` exports to `~/.zshrc` (or `~/.bashrc`)
so they survive new shells.

---

## 2. Install JS dependencies

```bash
cd fable-studio
npm install
```

This installs root + every workspace, including the `@capacitor/cli` already
declared in `games/neon-survivor/package.json`.

---

## 3. Build the web bundle

The Capacitor `android/` shell loads files from `games/neon-survivor/dist/`.
That bundle **must** exist before `cap add android` or `cap sync` will work.

```bash
npm --workspace @nanagames/neon-survivor run build
```

You should see `games/neon-survivor/dist/index.html` and `dist/assets/*.js`.
Vite's `build.target` is `es2020`, which is well within what Android System
WebView (Chromium 90+) supports.

---

## 4. Add the Android platform (one-time)

`android/` is git-ignored. You generate it locally the first time you build:

```bash
cd games/neon-survivor
npx cap add android
```

Capacitor reads `capacitor.config.json` and creates `android/` with the
correct `applicationId`, `WebView` config, splash icons, etc. The folder
should now look like:

```
games/neon-survivor/android/
  app/
  build.gradle
  gradle/
  settings.gradle
  variables.gradle
  ...
```

> After this first run, **never edit files inside `android/` by hand for
> app-config changes** — go back to `capacitor.config.json` (which is in
> version control) and run `npm run sync:android` again. Hand edits inside
> `android/` will be overwritten by `cap sync`.

---

## 5. Sync web bundle into Android

Every time you change the web side (anything in `src/`), re-sync:

```bash
cd fable-studio
npm --workspace @nanagames/neon-survivor run sync:android
```

This runs `vite build && cap sync android` — it rebuilds `dist/` and copies
`dist/` plus the Capacitor JS bridge into `android/app/src/main/assets/public/`.

---

## 6. Build the APK

Two paths — pick one.

### 6a. Command line (no Android Studio GUI)

```bash
cd games/neon-survivor/android
./gradlew assembleDebug
```

Resulting APK:

```
games/neon-survivor/android/app/build/outputs/apk/debug/app-debug.apk
```

That APK is **signed with the Android debug keystore** (auto-generated).
You can install it, but it cannot be uploaded to the Play Store as-is.
For release builds, see `../SETUP-KEYSTORE.md` (workspace root).

### 6b. Android Studio GUI

```bash
cd fable-studio
npm --workspace @nanagames/neon-survivor run android
```

This runs `cap open android` which launches Android Studio pointed at
`games/neon-survivor/android/`. From there: **Build → Build Bundle(s) /
APK(s) → Build APK(s)**. Same output path as 6a.

---

## 7. Install on a phone

### 7a. USB cable

1. Enable **Developer Options** on the phone (tap *Build Number* 7 times in
   *About phone*).
2. Enable **USB debugging** inside Developer Options.
3. Plug in. Accept the RSA fingerprint prompt on the phone.
4. Verify the device shows up:
   ```bash
   adb devices
   # List of devices attached
   # RF8M40ABCDE   device
   ```
5. Install:
   ```bash
   adb install -r games/neon-survivor/android/app/build/outputs/apk/debug/app-debug.apk
   ```
   The `-r` flag reinstalls over an existing copy without uninstalling
   first (so save data is preserved between dev rebuilds).

### 7b. Wireless (Android 11+)

```bash
adb pair <phone-ip>:<pairing-port>     # one-time, get the port from phone prompt
adb connect <phone-ip>:5555
adb devices
adb install -r games/neon-survivor/android/app/build/outputs/apk/debug/app-debug.apk
```

### 7c. Sideload by file

Copy `app-debug.apk` to the phone (AirDrop alternative: `cp` onto the
phone via the Files app, Google Drive, etc.) and tap it. Android will
ask you to allow installs from that source.

---

## 8. Watch the logs while testing

`webContentsDebuggingEnabled: true` is set in `capacitor.config.json`, so
you get DevTools in Chrome and `console.log` shows up in `adb logcat`:

```bash
adb logcat | grep -i -E "chromium|console|neon|Capacitor"
```

For the JS bridge only:

```bash
adb logcat -s Capacitor:V Console:V
```

Remote DevTools URL when the app is running on a USB-attached device:
`chrome://inspect/#devices` in desktop Chrome.

---

## 9. Common errors

### `Could not find tools.jar` / `Unsupported class file major version`

Wrong JDK. You have JDK 8 or 21+ selected. Switch to **JDK 17**:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### `SDK location not found`

`ANDROID_HOME` is not exported in this shell, or points at a non-existent
path. Re-export and re-run:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

Or create `games/neon-survivor/android/local.properties`:

```
sdk.dir=/Users/you/Library/Android/sdk
```

### `Failed to install ... INSTALL_FAILED_UPDATE_INCOMPATIBLE`

You have an older build signed with a different debug keystore. Uninstall
first:

```bash
adb uninstall com.nanagames.neonsurvivor
adb install -r app-debug.apk
```

### Blank white screen on launch

The web bundle wasn't synced. Rebuild + re-sync:

```bash
cd fable-studio
npm --workspace @nanagames/neon-survivor run sync:android
```

### `tsc` errors during `npm run build:engine` but Vite build works

That's fine — Vite uses esbuild which does not typecheck. Run typecheck
separately if you want it:

```bash
npm --workspace @nanagames/engine run typecheck
```

### `cap add android` says the platform already exists

You already ran it once. Skip to step 5 (`sync:android`) or step 6
(`./gradlew assembleDebug`).

---

## 10. TL;DR — copy/paste sequence

```bash
# one-time shell setup
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"

# every time you build
cd fable-studio
npm install                                          # first time only
npm --workspace @nanagames/neon-survivor run build
cd games/neon-survivor
npx cap add android                                  # first time only
cd ../..
npm --workspace @nanagames/neon-survivor run sync:android
cd games/neon-survivor/android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```
