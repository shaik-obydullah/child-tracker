# Child Tracker

A family location tracker built with **React Native**. Every phone that runs the app
publishes its location to a shared **Firebase Firestore** database, and any phone in the
family can see all tracked phones live on a single map.

The map is rendered with **MapLibre** using **OpenFreeMap / OpenStreetMap** tiles, so
**no Google Maps API key is required**.

<p align="center">
  <em>Track a child's phone &mdash; see it on a map from any other device in the family.</em>
</p>

---

## Features

- Live map with a labelled marker per tracked phone
- Real-time updates via Firestore `onSnapshot` (no polling, no manual refresh)
- High-accuracy tracking (`enableHighAccuracy`, ~15 m distance filter)
- Automatic device identification (Android ID + device name + model)
- One-tap tracking on/off from the Settings tab
- Status banner showing tracking state and the number of phones on the map
- Works without Google Play Services

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React Native `0.87.1` (Hermes, New Architecture) |
| Language | TypeScript (`^6.0.3`) |
| UI | `react-native-safe-area-context`, `@react-navigation/bottom-tabs` |
| Map | `@maplibre/maplibre-react-native` + OpenFreeMap `positron` style |
| Location | `react-native-geolocation-service` + the built-in `PermissionsAndroid` API |
| Device info | `react-native-device-info` |
| Backend | Firebase `12.x` — **Firestore** only (no Auth, no Cloud Functions) |

---

## Project structure

```
.
├── App.tsx                     # Root component: SafeAreaProvider + bottom tab navigator
├── babel.config.js             # Loads .env and inlines the Firebase values at build time
├── .env.example                # Template for the git-ignored .env file
├── src/
│   ├── config/firebase.ts      # Firebase initialisation (reads process.env.*)
│   ├── screens/
│   │   ├── MapScreen.tsx       # Live map + real-time device list
│   │   └── SettingsScreen.tsx  # Device name, tracking toggle, help
│   ├── services/
│   │   ├── locationService.ts  # Permission handling + location read/write helpers
│   │   └── trackingService.ts  # Geolocation watcher -> Firestore upload
│   └── types/index.ts          # Shared TypeScript interfaces
├── android/                    # Android native project (package com.childtrackerrn)
├── ios/                        # iOS native project
├── Dockerfile                  # Container with JDK 17 + Android SDK + Node 22
├── docker-compose.yml          # One-command Android build environment
└── __tests__/App.test.tsx      # Jest smoke test
```

> `ChildTracker/` is an **older snapshot** of the app kept for reference. The live source
> code lives at the repository root.

---

## Prerequisites

- **Node.js >= 22.11.0** (`engines` in `package.json`)
- **JDK 17** (Android builds)
- **Android SDK** (platform 35/36, build-tools 35/36, NDK 27) — or use the provided Docker image
- **Xcode** (macOS only, for iOS)
- A **Firebase project** with a Firestore database

---

## Setup

### 1. Install dependencies

```sh
npm install
# iOS only, first clone or after native dependency changes:
bundle install
bundle exec pod install
```

### 2. Configure Firebase

Firebase values are **not committed**. They live in a git-ignored `.env` file and are
inlined into the bundle at build time by `babel-plugin-transform-inline-environment-variables`
(configured in `babel.config.js`).

```sh
cp .env.example .env
```

Then fill in `.env` with the values from
[Firebase console](https://console.firebase.google.com) → Project settings → Your apps →
SDK setup and configuration:

```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=childtracker-f1ec8.firebaseapp.com
FIREBASE_PROJECT_ID=childtracker-f1ec8
FIREBASE_STORAGE_BUCKET=childtracker-f1ec8.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=730490229515
FIREBASE_APP_ID=1:730490229515:web:dd4a5154ffb81360c0480e
```

Only `.env.example` (with placeholders) is committed. If `.env` is missing the app starts
but throws a clear "Firebase is not configured" error.

Next, prepare the backend:

1. Create a **Web app** in the Firebase console if you have not already.
2. Enable the **Cloud Firestore API** for the project
   (Firestore → Create database). Without it every read/write fails with
   `SERVICE_DISABLED`.
3. Create the Firestore database.
4. While testing, keep the database in **test mode** so unauthenticated reads/writes are
   allowed (Firebase Console → Firestore Database → Rules → allow read/write if
   `request.time < timestamp.date(...)`).

> The Firebase API key is a **client-side identifier, not a secret** — it ships inside every
> build and cannot be hidden from the app. Access control must come from your Firestore
> security rules, and the key should be restricted. See [Security](#security).

The legacy Expo copy in `ChildTracker/` uses the same pattern with `EXPO_PUBLIC_`-prefixed
variables (`cp ChildTracker/.env.example ChildTracker/.env`).


### 3. Run the app

Start the Metro bundler:

```sh
npm start
```

In a second terminal:

```sh
npm run android     # Android device or emulator
npm run ios         # iOS simulator (macOS only)
```

Other scripts:

```sh
npm test            # Jest
npm run lint        # ESLint
```

---

## Building the APK

### With Docker (recommended, no local Android SDK needed)

```sh
docker compose build
docker compose run --rm android-build bash
```

Then, inside the container:

```sh
npm install
cd android && ./gradlew assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.

### Locally

```sh
cd android
./gradlew assembleRelease          # release APK
./gradlew assembleDebug            # debug APK
```

> The release build currently uses the **debug keystore** (`android/app/build.gradle`).
> Generate a private keystore and update `signingConfigs` before distributing a build
> to real users — see the [React Native signing guide](https://reactnative.dev/docs/signed-apk-android).
>
> `*.apk` / `*.aab` are **git-ignored** — binaries are not committed to this repository.
> Publish release builds as
> [GitHub Release assets](https://github.com/shaik-obydullah/child-tracker/releases) instead.

---

## Permissions

Declared in `android/app/src/main/AndroidManifest.xml`:

| Permission | Why |
| --- | --- |
| `ACCESS_FINE_LOCATION` | Precise GPS position |
| `ACCESS_COARSE_LOCATION` | Approximate position fallback |
| `ACCESS_BACKGROUND_LOCATION` | Keep tracking while the app is in the background |
| `INTERNET` | Upload locations to Firestore |

The permission is requested at runtime the first time the Map screen mounts
(`src/services/locationService.ts`). If it is denied, tracking does not start and an alert
explains what is needed.

---

## Data model

Firestore → collection `devices` (one document per phone, **document ID = Android ID**):

| Field | Type | Source |
| --- | --- | --- |
| `name` | `string` | Device name (Settings → shows on the marker) |
| `model` | `string` | Hardware model |
| `latitude` | `number` | GPS latitude |
| `longitude` | `number` | GPS longitude |
| `battery` | `number` | Currently stores the GPS **accuracy** in metres (see [Known issues](#known-issues)) |
| `timestamp` | `Timestamp` | Time of the last upload |

Firestore → collection `locations` (history, written by `saveLocation()` in
`src/services/locationService.ts`):

| Field | Type |
| --- | --- |
| `childId` | `string` |
| `latitude` | `number` |
| `longitude` | `number` |
| `battery` | `number` |
| `timestamp` | `Timestamp` |

---

## Tracking behaviour

Defined in `src/services/trackingService.ts`:

- Position updates are requested with `enableHighAccuracy: true`
- `distanceFilter: 15` — an update is sent only after the phone has moved ~15 m
- `interval: 15000` / `fastestInterval: 10000` — at most one update every ~10–15 s
- Updates are merged into the device document with `setDoc(..., { merge: true })`

### Keeping tracking alive

On most Android versions, aggressive battery optimisation kills background location
updates. To avoid this on each child's phone:

1. Keep the Child Tracker app open.
2. Settings → Apps → Child Tracker → Battery → **No restrictions**
   (on Xiaomi/Oppo/Vivo also enable *Autostart* and *Background activity*).
3. The phone needs an internet connection to upload its position.

---

## Security

### The API key

The Firebase **web API key is not a password**. It is a project identifier that the
Firebase SDKs require, and it is designed to be present in client builds — hiding it in
this repository does not hide it from anyone who unpacks the APK. What actually protects
the data is:

1. **Firestore security rules** — the only thing standing between a stranger and your
   family's location history.
2. **API key restrictions** — limits what the key can be used for, and by which app.
3. **Not committing it** — keeps it out of git history, forks and search engines.

### Rotate the key (do this if it was ever committed)

The key in this project's history was exposed publicly. Rotation is the only reliable fix —
history rewriting alone does not help once a value has been online.

1. Open [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
   and select the project `childtracker-f1ec8`.
2. Find the API key that starts with `AIza` (the auto-generated Firebase web key) and
   **delete** it.
3. Create a replacement: **Create credentials → API key**, then restrict it:
   - **Application restrictions → Android apps** → package name `com.childtrackerrn`
     → add the SHA-1 fingerprint of your signing certificate
     (`keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`
     for the debug build).
   - **API restrictions** → restrict to only the APIs the app uses, e.g.
     *Cloud Firestore API* and *Firebase Installations API* (add *Identity Toolkit API*
     only if you enable Firebase Auth).
4. Copy the new key into your local `.env` (`FIREBASE_API_KEY=...`) and rebuild the app.

> Rotating the key does **not** invalidate the Firestore data — it only changes the
> identifier the client presents.

### Restrict the key properly

| Setting | Recommended value |
| --- | --- |
| Application restrictions | Android apps → `com.childtrackerrn` + SHA-1 fingerprint |
| API restrictions | Cloud Firestore API, Firebase Installations API, (Identity Toolkit API) |
| Quota project | the same project, so quotas and billing stay in one place |

### Keep it out of git

- `.env` is git-ignored; only `.env.example` (placeholders) is committed.
- The legacy Expo project uses `ChildTracker/.env` with `EXPO_PUBLIC_` prefixes — also
  git-ignored.
- If a secret is ever committed again, rotate it **first**, then rewrite history
  (`git filter-repo --invert-paths --path src/config/firebase.ts`) and force-push.

### Production rules

Before using this with real children, replace the test-mode Firestore rules with rules
that require authentication, e.g.:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /devices/{deviceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.deviceId == deviceId;
    }
  }
}
```

Consider also adding Firebase Auth so that only family members can read the map.

---

## Known issues

- The `battery` field currently stores the **GPS accuracy** instead of the battery level.
- The **Cloud Firestore API is not enabled** on the Firebase project `childtracker-f1ec8`
  yet, so location sync fails with `SERVICE_DISABLED` until it is turned on.
- Background tracking is only as reliable as the OS allows — see
  [Keeping tracking alive](#keeping-tracking-alive).
- iOS: `NSLocationWhenInUseUsageDescription` in `ios/ChildTrackerRN/Info.plist` is empty,
  there is no `NSLocationAlwaysAndWhenInUseUsageDescription`, and the target declares no
  `UIBackgroundModes` — so iOS background tracking is not set up yet.
- `getCurrentLocation()`, `saveLocation()`, `getChildLocations()` and `getLatestLocation()`
  in `src/services/locationService.ts` are exported but not called anywhere yet; only the
  live `devices` collection is used today.
- `ChildTracker/` duplicates the app source with an extra `ProfileScreen`; it is not
  referenced by the root project.

---

## Learn more

- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [MapLibre React Native](https://github.com/maplibre/maplibre-react-native)
- [Firebase Firestore — web modular API](https://firebase.google.com/docs/firestore/web/start)
- [React Native — signing an Android APK](https://reactnative.dev/docs/signed-apk-android)
