#!/usr/bin/env python3
"""Regenera un HTML autónomo (un solo archivo) a partir de web/.
Uso: python3 tools/bundle-single-html.py [salida.html]
Omite el puente Android (no hace falta fuera del WebView)."""
import re, sys, pathlib
root = pathlib.Path(__file__).resolve().parent.parent / "web"
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "Filmframe_single.html")
html = (root / "index.html").read_text(encoding="utf8")
html = re.sub(r'<link rel="stylesheet" href="css/styles.css">',
              lambda m: "<style>" + (root / "css/styles.css").read_text(encoding="utf8") + "</style>", html)
def inline(m):
    src, attrs = m.group(1), m.group(2)
    if "android-bridge" in src:
        return ""
    return "<script%s>%s</script>" % (attrs, (root / src).read_text(encoding="utf8"))
html = re.sub(r'<script src="(js/[^"]+)"([^>]*)></script>', inline, html)
out.write_text(html, encoding="utf8")
print("Escrito", out, len(html), "bytes")
