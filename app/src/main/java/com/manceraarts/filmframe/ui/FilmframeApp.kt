package com.manceraarts.filmframe.ui

import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

// Mismos fondos que --bg de la web (claro / oscuro) para que no haya parpadeo al arrancar.
private val BgLight = Color(0xFFE4E6EA)
private val BgDark = Color(0xFF1C1E23)

@Composable
fun FilmframeApp(
    onWebViewCreated: (WebView) -> Unit,
    onFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams) -> Boolean,
    onBack: () -> Unit,
    onRenderProcessGone: () -> Unit,
) {
    val dark = isSystemInDarkTheme()
    MaterialTheme(colorScheme = if (dark) darkColorScheme() else lightColorScheme()) {
        BackHandler(onBack = onBack)
        Box(
            Modifier
                .fillMaxSize()
                .background(if (dark) BgDark else BgLight)
                .systemBarsPadding()
                .imePadding()
        ) {
            FilmframeWebView(
                modifier = Modifier.fillMaxSize(),
                onWebViewCreated = onWebViewCreated,
                onFileChooser = onFileChooser,
                onRenderProcessGone = onRenderProcessGone,
            )
        }
    }
}
