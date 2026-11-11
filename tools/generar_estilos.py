"""Regenera los estilos de carga progresiva sin cambiar sus reglas ni su orden.

Uso: python3 tools/generar_estilos.py
Editar primero css/styles.css (fuente completa original).
"""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
source = (root / 'css/styles.css').read_text(encoding='utf-8')
start = source.index('/* Estadísticas ·')
end = source.index('/* Marca UltraShop')

def compact(css):
    tokens = re.findall(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|/\*[\s\S]*?\*/|\s+|[^\s"\']', css)
    output = []
    space = False
    for token in tokens:
        if token.startswith('/*'):
            if 'SIL OPEN FONT LICENSE' in token:
                output.append(token)
            space = True
            continue
        if token.isspace():
            space = True
            continue
        if space and output and output[-1][-1] not in '{};' and token not in '{};':
            output.append(' ')
        output.append(token)
        space = False
    return ''.join(output).strip() + '\n'

(root / 'css/panel.css').write_text(compact(source[:start]), encoding='utf-8')
(root / 'css/statistics.css').write_text(compact(source[start:end]), encoding='utf-8')
html_path = root / 'index.html'
html = html_path.read_text(encoding='utf-8')
html, count = re.subn(r'(<style id="nova-brand">).*?(</style>)', lambda m: m[1] + compact(source[end:]).strip() + m[2], html, flags=re.S)
if count != 1:
    raise SystemExit('No se encontró el bloque nova-brand. Revisa index.html.')
html_path.write_text(html, encoding='utf-8')
print('Estilos regenerados: panel, estadísticas y marca.')
