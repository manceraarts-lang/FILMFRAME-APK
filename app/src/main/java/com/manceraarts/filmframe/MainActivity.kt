package com.manceraarts.filmframe

import android.content.ActivityNotFoundException
import android.content.pm.ApplicationInfo
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import com.manceraarts.filmframe.ui.FilmframeApp

/**
 * Única actividad. Toda la app de animación es web (assets/index.html);
 * Kotlin/Compose aporta el contenedor nativo: WebView, selector de archivos,
 * guardado en Descargas, botón atrás y recuperación si el WebView muere.
 */
class MainActivity : ComponentActivity() {

    private var webView: WebView? = null
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var lastBackAt = 0L

    // <input type="file"> de la web (audio, video de rotoscopio, imágenes, pinceles PNG...)
    private val fileChooser =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            filePathCallback?.onReceiveValue(uris)
            filePathCallback = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val debuggable = applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE != 0
        if (debuggable) WebView.setWebContentsDebuggingEnabled(true) // chrome://inspect

        setContent {
            FilmframeApp(
                onWebViewCreated = { webView = it },
                onFileChooser = ::openFileChooser,
                onBack = ::handleBack,
                onRenderProcessGone = { recreate() },
            )
        }
    }

    private fun openFileChooser(
        callback: ValueCallback<Array<Uri>>,
        params: WebChromeClient.FileChooserParams,
    ): Boolean {
        filePathCallback?.onReceiveValue(null)
        filePathCallback = callback
        try {
            fileChooser.launch(params.createIntent())
        } catch (e: ActivityNotFoundException) {
            filePathCallback = null
            callback.onReceiveValue(null)
        }
        return true
    }

    private fun handleBack() {
        val now = SystemClock.elapsedRealtime()
        if (now - lastBackAt < 2000) {
            finish()
        } else {
            lastBackAt = now
            Toast.makeText(this, R.string.back_again, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onPause() {
        // Fuerza el guardado del módulo 00 (flushSave en 'pagehide') antes de ir a segundo plano.
        webView?.evaluateJavascript("window.__ffSave&&window.__ffSave()", null)
        super.onPause()
    }

    override fun onDestroy() {
        webView = null
        super.onDestroy()
    }
}
