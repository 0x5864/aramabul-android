# ProGuard / R8 rules for AramaBul Android
# These rules are applied during release builds.

# Flutter WebView plugin
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# WebView
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(android.webkit.WebView, java.lang.String);
    public void *(android.webkit.WebView, java.lang.String, android.graphics.Bitmap);
    public boolean *(android.webkit.WebView, java.lang.String);
}

# URL launcher
-keep class androidx.browser.** { *; }

# Keep annotations
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
