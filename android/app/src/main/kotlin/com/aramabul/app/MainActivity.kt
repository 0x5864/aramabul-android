package com.aramabul.app

import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val authCallbackChannelName = "com.aramabul.app/auth_callback"
    private var authCallbackChannel: MethodChannel? = null
    private var pendingAppleAuthCallback: String? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        authCallbackChannel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            authCallbackChannelName,
        ).also { channel ->
            channel.setMethodCallHandler { call, result ->
                when (call.method) {
                    "consumeAppleAuthCallback" -> {
                        result.success(pendingAppleAuthCallback)
                        pendingAppleAuthCallback = null
                    }
                    else -> result.notImplemented()
                }
            }
        }
        captureAppleAuthCallback(intent, notifyFlutter = false)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        captureAppleAuthCallback(intent, notifyFlutter = true)
    }

    private fun captureAppleAuthCallback(intent: Intent?, notifyFlutter: Boolean) {
        val uri = intent?.data ?: return
        if (uri.scheme != "aramabul" || uri.host != "apple-auth") return

        val callback = uri.toString()
        pendingAppleAuthCallback = callback
        if (notifyFlutter) {
            authCallbackChannel?.invokeMethod("appleAuthCallback", callback)
        }
    }
}
