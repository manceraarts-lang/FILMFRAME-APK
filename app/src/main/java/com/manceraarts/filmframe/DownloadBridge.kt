package com.manceraarts.filmframe

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import androidx.annotation.RequiresApi
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

/**
 * Puente JS -> Kotlin expuesto como window.FilmframeAndroid (ver web/js/10-android-bridge.js).
 * Recibe los archivos exportados (GIF, ZIP de PNG, MP4/WebM, proyectos...) por trozos y los
 * escribe en Descargas/Filmframe, sin pedir permisos de almacenamiento en Android 10+.
 * Los métodos @JavascriptInterface se ejecutan en un hilo propio, de ahí @Synchronized.
 */
class DownloadBridge(private val context: Context) {

    private var out: OutputStream? = null
    private var mediaUri: Uri? = null
    private var legacyFile: File? = null
    private var label: String = ""

    @JavascriptInterface
    @Synchronized
    fun begin(rawName: String, mime: String): Boolean {
        discard()
        val name = sanitize(rawName)
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) beginMediaStore(name, mime)
            else beginLegacy(name)
        } catch (e: Exception) {
            discard()
            false
        }
    }

    @JavascriptInterface
    @Synchronized
    fun chunk(base64: String): Boolean = try {
        val o = out
        if (o == null) false else {
            o.write(Base64.decode(base64, Base64.DEFAULT))
            true
        }
    } catch (e: Exception) {
        false
    }

    /** Cierra el archivo y devuelve una etiqueta legible de dónde quedó ("" si falló). */
    @JavascriptInterface
    @Synchronized
    fun end(): String = try {
        out?.flush()
        out?.close()
        out = null
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) finishMediaStore()
        legacyFile?.let { label = it.absolutePath }
        val l = label
        mediaUri = null
        legacyFile = null
        label = ""
        l
    } catch (e: Exception) {
        discard()
        ""
    }

    @JavascriptInterface
    @Synchronized
    fun abort() = discard()

    @JavascriptInterface
    fun openUrl(url: String) {
        if (!url.startsWith("https://")) return
        runCatching {
            context.startActivity(
                Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            )
        }
    }

    // ---- Android 10+ : MediaStore (carpeta Descargas/Filmframe) ----
    @RequiresApi(Build.VERSION_CODES.Q)
    private fun beginMediaStore(name: String, mime: String): Boolean {
        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, name)
            put(MediaStore.MediaColumns.MIME_TYPE, mime)
            put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Filmframe")
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }
        val uri = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            ?: return false
        val stream = context.contentResolver.openOutputStream(uri)
        if (stream == null) {
            context.contentResolver.delete(uri, null, null)
            return false
        }
        mediaUri = uri
        out = stream
        label = "Descargas/Filmframe/$name"
        return true
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun finishMediaStore() {
        val uri = mediaUri ?: return
        context.contentResolver.update(
            uri,
            ContentValues().apply { put(MediaStore.MediaColumns.IS_PENDING, 0) },
            null,
            null,
        )
        // MediaStore renombra si ya existía ("x (1).gif"): mostramos el nombre real.
        context.contentResolver.query(
            uri, arrayOf(MediaStore.MediaColumns.DISPLAY_NAME), null, null, null
        )?.use { c ->
            if (c.moveToFirst()) label = "Descargas/Filmframe/" + c.getString(0)
        }
    }

    // ---- Android 8-9 : carpeta propia de la app (sin permisos) ----
    private fun beginLegacy(name: String): Boolean {
        val base = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val dir = File(base, "Filmframe").apply { mkdirs() }
        var f = File(dir, name)
        var n = 1
        while (f.exists()) {
            val dot = name.lastIndexOf('.')
            f = if (dot > 0) File(dir, name.substring(0, dot) + " ($n)" + name.substring(dot))
            else File(dir, "$name ($n)")
            n++
        }
        legacyFile = f
        out = BufferedOutputStream(FileOutputStream(f), 1 shl 16)
        return true
    }

    private fun discard() {
        runCatching { out?.close() }
        out = null
        mediaUri?.let { runCatching { context.contentResolver.delete(it, null, null) } }
        legacyFile?.let { runCatching { it.delete() } }
        mediaUri = null
        legacyFile = null
        label = ""
    }

    private fun sanitize(raw: String): String {
        val clean = raw.replace(Regex("[\\\\/:*?\"<>|\\p{Cntrl}]"), "_").trim().take(120)
        return clean.ifEmpty { "archivo" }
    }
}
