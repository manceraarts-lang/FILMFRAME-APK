# 🎬 Filmframe 2D Animation

> Software de animación 2D en archivo HTML. Pinceles con presión, timeline con holds redimensionables, capas con máscaras, rotoscopia y exportación a GIF/MP4/PSD. Sin instalación, sin servidor, 100% free use.

![versión](https://img.shields.io/badge/versión-1.1.21-orange)
![licencia](https://img.shields.io/badge/licencia-MIT-blue)
![sin dependencias](https://img.shields.io/badge/dependencias-0-brightgreen)

## ✨ Características
- 🖌️ Pinceles con presión, inclinación, grano y textura personalizada
- ⚡ QuickShape: línea, círculo y elipse perfectos
- 🎞️ Timeline multipista con holds redimensionables
- 🧅 Papel cebolla configurable (antes/después)
- 🗂️ Capas tipo Procreate: máscaras, recorte, grupos, alpha lock
- 🎥 Rotoscopia desde vídeo
- 🎨 Rueda HSV, HSL, HEX y paletas desde imagen
- 📐 Guías: cuadrícula, perspectiva, regla, tercios
- 💾 Proyectos en IndexedDB con guardado protegido
- 📤 Exportación: GIF, PNG, MP4/WebM, TIFF, PSD, time-lapse
- 📱 Optimizado para tablet + lápiz (rechazo de palma)

## 🚀 Uso
Abre `FILMFRAME_1_1_21_DESCARGA.html` en cualquier navegador moderno. Nada más.

## ⌨️ Atajos
| Tecla | Acción |
|---|---|
| B / E | Pincel / Borrador |
| G / M / I | Relleno / Selección / Cuentagotas |
| Ctrl+Z | Deshacer |
| Espacio + arrastrar | Mover lienzo |
| Enter | Reproducir |
| N | Cuadro nuevo |
| D | Duplicar cuadro |

## 🏗️ Arquitectura
Archivo único con 10 módulos léxicos (00–09) que comparten ámbito global.
Ver comentario "MAPA DE ARQUITECTURA" en el HTML.

## 📋 Requisitos
- Navegador con soporte de Canvas 2D, IndexedDB y `MediaRecorder`
- Brave/Edge/Firefox/Safari recientes
- Recomendado: tablet con lápiz (Apple Pencil, S Pen, stylus genérico)
