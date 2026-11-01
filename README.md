# FILMFRAME · Filmframe 2D Animation (v1.1.18) — proyecto Android

App de animación 2D cuadro a cuadro. La lógica es la web original de Filmframe, dividida en módulos;
el contenedor Android es **Kotlin + Jetpack Compose** (un `WebView` con puente nativo).

## Estructura de rutas

```
FILMFRAME/
├── .github/workflows/android-build.yml   CI: compila el APK en GitHub
├── version.json                          manifiesto del aviso de actualizaciones (raw de GitHub)
├── gradle.properties                     ff.versionName / ff.versionCode
├── gradle/libs.versions.toml             versiones (AGP, Kotlin, Compose)
├── settings.gradle.kts · build.gradle.kts
├── web/                                  ← TODA la app (se empaqueta como assets)
│   ├── index.html                        estructura + mapa de arquitectura
│   ├── css/styles.css
│   └── js/
│       ├── 00-app-shell.js … 09-timeline-zoom.js   los 10 módulos originales, sin cambios
│       └── 10-android-bridge.js          puente Android (sólo actúa dentro de la app)
├── app/
│   ├── build.gradle.kts                  sourceSets.assets → ../web
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/manceraarts/filmframe/
│       │   ├── MainActivity.kt           selector de archivos, atrás, guardado al pausar
│       │   ├── DownloadBridge.kt         guarda exportaciones en Descargas/Filmframe
│       │   └── ui/ FilmframeApp.kt · FilmframeWebView.kt   (Compose)
│       └── res/                          icono adaptativo vectorial, temas, textos
└── tools/
    ├── check-web.sh                      node --check de cada módulo + referencias
    └── bundle-single-html.py             regenera el HTML de un solo archivo desde web/
```

**Los módulos son idénticos al HTML original** (verificado byte a byte: el JS concatenado coincide
con el de la v1.1.18). Siguen siendo scripts clásicos que comparten ámbito global: **no cambies el
orden** de las etiquetas `<script>` en `index.html` ni los conviertas a módulos ES.

## Compilar en GitHub (desde el móvil o el PC)

1. Crea el repositorio `FILMFRAME` y sube **el contenido** de esta carpeta (no la carpeta contenedora).
2. Pestaña **Actions → Build Android APK → Run workflow** (o haz un commit en `main`).
3. Al terminar, descarga el artefacto **Filmframe-APK** (un ZIP con `Filmframe-1.1.18.apk`).

No hace falta `gradle-wrapper.jar`: el workflow instala Gradle 8.9 y JDK 17.

### Firma estable (importante para actualizar por encima)
Sin firma propia, cada compilación genera un APK *debug* con una clave distinta y Android no deja
instalarlo sobre el anterior. Para que las actualizaciones se instalen encima:

1. Crea un keystore una sola vez (en un PC con Java):
   `keytool -genkeypair -v -keystore filmframe.jks -alias filmframe -keyalg RSA -keysize 2048 -validity 10000`
2. En el repo: **Settings → Secrets and variables → Actions** y crea:
   `KEYSTORE_BASE64` (salida de `base64 -w0 filmframe.jks`), `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`.
3. Guarda el `.jks` y sus contraseñas fuera del repo: si lo pierdes, no podrás actualizar la app instalada.

## Actualizaciones (MediaFire)
El módulo 08 lee `version.json` de este repo (`raw.githubusercontent.com/manceraarts-lang/FILMFRAME/main/version.json`).
Al publicar una versión: sube el APK a MediaFire, pon su enlace `https://` en `"url"`, sube `"version"`,
y haz commit. El botón *Descargar* abre ese enlace en el navegador (lo hace `10-android-bridge.js`).

## Subir de versión
Cambia los tres sitios: `APP.version` en `web/js/00-app-shell.js` (y el `<title>`/meta de `index.html`),
`ff.versionName` + `ff.versionCode` en `gradle.properties`, y `version.json` al publicar.

## Datos y migración
- Los proyectos viven en IndexedDB/localStorage del origen `https://appassets.androidplatform.net`
  (constante `ASSET_HOST` en `FilmframeWebView.kt`). **No cambies ese host** entre versiones.
- Esta app tiene su propio `applicationId` (`com.manceraarts.filmframe`): no ve los datos del APK
  Capacitor anterior. Para traspasar un proyecto, expórtalo allí y impórtalo aquí.
  (Si quisieras conservarlos in situ: mismo `applicationId`, misma firma y `ASSET_HOST = "localhost"`.)

## Comportamiento nativo añadido
- Exportaciones (GIF, ZIP de PNG, MP4/WebM, proyectos): se guardan por trozos en **Descargas/Filmframe**
  (sin permisos en Android 10+; en 8–9 van a la carpeta propia de la app).
- Selector de archivos para audio, video (rotoscopio) e imágenes.
- Atrás: doble pulsación para salir. Al pausar se fuerza el guardado del módulo 00.
- Si Android mata el WebView por falta de RAM, la actividad se recrea en vez de cerrarse.
- Los enlaces externos salen al navegador; el puente JS sólo existe en el origen de la app.

## Desarrollo local sin Android
`web/index.html` funciona en un navegador de escritorio (abre con un servidor estático:
`python3 -m http.server -d web`). `tools/bundle-single-html.py` genera el HTML autónomo para tu copia en la nube.

## Estado de verificación
Verificado aquí: sintaxis de los 11 JS, equivalencia con el original, XML bien formado y round-trip
del bundle. **No se ha compilado el APK** (el entorno no tenía red para descargar Gradle/Android SDK):
la primera ejecución del workflow es la prueba real; si falla, el log indica la línea exacta.
