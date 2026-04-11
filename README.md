# Aramabul Android

This repo is the Flutter shell for Aramabul.

The app opens the web product inside a WebView.

It keeps a light bundled web snapshot under `assets/app_web/`.

The Android repo should stay small. Heavy data snapshots do not belong here.

## Working Model

The source of truth is the web repo.

Recommended source repo names:

- `aramabul`
- `aramabul-istanbul-web`

This Android repo should receive stable snapshots.

It should not mirror every web change right away.

## Run The App

```bash
cd /Users/metintuncgenc/Documents/aramabul-android
flutter run
```

## Run With A Different Start URL

```bash
cd /Users/metintuncgenc/Documents/aramabul-android
flutter run --dart-define=APP_START_URL=https://example.com
```

## Refresh The Bundled Web Snapshot

If the web repo has a stable update, sync the snapshot:

```bash
cd /Users/metintuncgenc/Documents/aramabul-android
./scripts/sync_web_assets.sh
```

If the source web repo is in a custom location, pass it in:

```bash
cd /Users/metintuncgenc/Documents/aramabul-android
WEB_REPO_ROOT=/path/to/aramabul-istanbul-web ./scripts/sync_web_assets.sh
```

## Notes

- Internet access is enabled in the app.
- Local HTTP testing can still be used when needed.
- Sync the Android snapshot only after the web change is tested.
