# -*- coding: utf-8 -*-
"""把导出的 PDF 逐页渲染为 PNG，供视觉验收使用。

用法：
    python tools/render_png.py                  # 渲染 preview/brief.pdf
    python tools/render_png.py 路径.pdf 输出目录
"""
import os
import sys

import pymupdf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, 'preview', 'brief.pdf')
if not os.path.isabs(PDF):
    PDF = os.path.join(BASE, PDF)
OUTDIR = (sys.argv[2] if len(sys.argv) > 2
          else os.path.join(os.path.dirname(PDF), 'pages'))
if not os.path.isabs(OUTDIR):
    OUTDIR = os.path.join(BASE, OUTDIR)
os.makedirs(OUTDIR, exist_ok=True)

doc = pymupdf.open(PDF)
print('总页数 =', doc.page_count)

paths = []
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(dpi=130)
    p = os.path.join(OUTDIR, 'page-%02d.png' % i)
    pix.save(p)
    paths.append(p)
doc.close()

print('已渲染 %d 张 -> %s' % (len(paths), OUTDIR))
for p in paths:
    print(p)
