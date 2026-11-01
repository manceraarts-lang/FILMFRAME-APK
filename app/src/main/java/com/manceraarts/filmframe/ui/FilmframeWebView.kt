package com.manceraarts.filmframe.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color as AColor
import android.net.Uri
import android.view.View
import android.webkit.RenderProcessGoneDetail
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import com.manceraarts.filmframe.DownloadBridge

/**
 * Origen virtual https que sirve /assets (la carpeta web/ del repo).
 * Con un origen https real, IndexedDB y localStorage se comportan igual que en el navegador
 * (con file:// no son fiables). El nombre del host define dónde viven los proyectos guardados:
 * NO lo cambies entre versiones o se verán "vacíos" (ver README, sección Datos).
 */
const val ASSET_HOST = "appassets.androidplatform.net"
const val START_URL = "https://$ASSET_HOST/assets/index.html"

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun FilmframeWebView(
    modifier: Modifier = Modifier,
    onWebViewCreated: (WebView) -> Unit,
    onFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams) -> Boolean,
    onRenderProcessGone: () -> Unit,
) {
    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            val loader = WebViewAssetLoader.Builder()
                .setDomain(ASSET_HOST)
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(ctx))
                .build()

            WebView(ctx).apply {
                setBackgroundColor(AColor.TRANSPARENT)
                overScrollMode = View.OVER_SCROLL_NEVER
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true            // localStorage + IndexedDB
                    mediaPlaybackRequiresUserGesture = false
                    allowFileAccess = false
                    allowContentAccess = true            // lee los content:// del selector de archivos
                    setSupportZoom(false)
                    builtInZoomControls = false
                    displayZoomControls = false
                    textZoom = 100
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView,
                        request: WebResourceRequest,
                    ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

                    override fun shouldOverrideUrlLoading(
                        view: WebView,
                        request: WebResourceRequest,
                    ): Boolean {
                        val url = request.url
                        if (url.host == ASSET_HOST) return false
                        // Cualquier otro destino sale de la app: el puente JS sólo existe en nuestro origen.
                        runCatching {
                            ctx.startActivity(
                                Intent(Intent.ACTION_VIEW, url).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            )
                        }
                        return true
                    }

                    // Con poca RAM Android puede matar el proceso del WebView: recreamos la
                    // actividad en lugar de cerrar la app. Lo editado ya está en IndexedDB.
                    override fun onRenderProcessGone(
                        view: WebView,
                        detail: RenderProcessGoneDetail,
                    ): Boolean {
                        onRenderProcessGone()
                        return true
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onShowFileChooser(
                        webView: WebView,
                        filePathCallback: ValueCallback<Array<Uri>>,
                        fileChooserParams: FileChooserParams,
                    ): Boolean = onFileChooser(filePathCallback, fileChooserParams)
                }

                addJavascriptInterface(DownloadBridge(ctx), "FilmframeAndroid")
                onWebViewCreated(this)
                loadUrl(START_URL)
            }
        },
        onRelease = { it.destroy() },
    )
}
