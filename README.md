# AramaBul Android

Flutter WebView shell for [AramaBul](https://aramabul.com) – Turkey venue discovery.

## Package Info

| Key | Value |
|-----|-------|
| Package ID | `com.aramabul.app` |
| Min SDK | Flutter default |
| Entry point | `assets/app_web/index.html` |

## Working Model

The source of truth is the web repo (`aramabul`).
This Android repo receives stable web snapshots.
It should not mirror every web change right away.

## Run The App

```bash
cd /Users/metintuncgenc/Documents/aramabul-android
flutter run
```

## Run With A Different Start URL

```bash
flutter run --dart-define=APP_START_URL=https://example.com
```

## Refresh The Bundled Web Snapshot

Sync stable web changes into `assets/app_web/`:

```bash
./scripts/sync_web_assets.sh
```

If the source web repo is in a custom location:

```bash
WEB_REPO_ROOT=/path/to/aramabul ./scripts/sync_web_assets.sh
```

## Notes

- Internet access is enabled in the app.
- Android back button navigates WebView history before exiting.
- Local HTTP testing can still be used when needed.
- Sync the Android snapshot only after the web change is tested.
