"""Evita mezclar JavaScript/CSS antiguos tras publicar una actualización.
Ejecutar después de generar_estilos.py y antes de publicar index.html.
"""
from pathlib import Path
import hashlib,re
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
def version(match):
    file=root/match[2]
    digest=hashlib.sha256(file.read_bytes()).hexdigest()[:12]
    return match[1]+match[2]+'?v='+digest+match[3]
html=re.sub(r'''((?:src|href)=["'])((?:js|css)/[^"'?]+)(?:\?[^"']*)?(["'])''',version,p.read_text())
p.write_text(html)
print('Referencias de JavaScript y CSS actualizadas según su contenido.')
