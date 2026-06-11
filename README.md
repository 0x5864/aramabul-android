# AramaBul Android

AramaBul is an Istanbul-first venue discovery app.

## Architecture

The app uses the deployed web product at `https://aramabul.com` as its only
interface source. Flutter provides the native Android shell:

- Google and Apple sign-in bridges
- native sharing
- external map handling
- nearby location permission
- connectivity monitoring
- a native offline state

The repository does not keep a copied web snapshot. Web design and venue
behavior must be changed in the main AramaBul web repository and deployed
before they appear in the app.

## Run

"""
flutter pub get
flutter run
"""

## Verify

"""
dart format --output=none --set-exit-if-changed lib test
flutter analyze
flutter test
flutter build apk --debug
"""

## Release

Update the version in `pubspec.yaml`, verify the deployed website, then build
the Android App Bundle. The `kAppVersion` value in `lib/main.dart` must match
the pubspec version name.
