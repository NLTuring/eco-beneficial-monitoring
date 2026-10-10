# -*- coding: utf-8 -*-
"""打印 PDF 页数与已渲染图片数，用于快速确认导出与渲染是否一致。

用法：python tools/page_count.py [pdf路径]
"""
import os
import sys

import pymupdf

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pdf = sys.argv[1] if len(sys.argv) > 1 else os.path.join(BASE, 'preview', 'brief.pdf')
pages_dir = os.path.join(os.path.dirname(pdf), 'pages')

d = pymupdf.open(pdf)
n = d.page_count
d.close()

pngs = []
if os.path.isdir(pages_dir):
    pngs = [f for f in os.listdir(pages_dir) if f.endswith('.png')]

print('PDF   : %s' % pdf)
print('页数  : %d' % n)
print('图片  : %d 张 (%s)' % (len(pngs), pages_dir))
print('大小  : %.1f KB' % (os.path.getsize(pdf) / 1024.0))
print('一致  : %s' % ('是' if len(pngs) in (0, n) else '否 —— 有残留旧图，请清空后重渲'))
