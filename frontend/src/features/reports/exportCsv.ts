export function exportCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const escape = (v: string | number | undefined | null) =>
    `"${String(v ?? '').replace(/"/g, '""')}"`

  const content = [headers.map(escape), ...rows.map((r) => r.map(escape))]
    .map((r) => r.join(','))
    .join('\r\n')

  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
