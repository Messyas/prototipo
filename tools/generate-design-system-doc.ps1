param(
  [string]$Source = (Join-Path $PSScriptRoot '..\docs\DESIGN_SYSTEM_HANARO.md'),
  [string]$HtmlOutput = (Join-Path $PSScriptRoot '..\docs\DESIGN_SYSTEM_HANARO.html'),
  [string]$DocxOutput = (Join-Path $PSScriptRoot '..\docs\DESIGN_SYSTEM_HANARO.docx')
)

$ErrorActionPreference = 'Stop'

function Convert-InlineMarkdown {
  param([string]$Text)

  $encoded = [System.Net.WebUtility]::HtmlEncode($Text)
  $encoded = [regex]::Replace($encoded, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
  $encoded = [regex]::Replace($encoded, '`([^`]+)`', {
    param($match)
    $value = $match.Groups[1].Value
    if ($value -match '^#[0-9A-Fa-f]{6}$') {
      return '<span class="color-chip" style="background-color:' + $value + '"></span><code>' + $value + '</code>'
    }
    return '<code>' + $value + '</code>'
  })
  return $encoded
}

function Convert-MarkdownToHtml {
  param([string[]]$Lines)

  $builder = [System.Text.StringBuilder]::new()
  $inList = $false
  $listType = ''
  $index = 0

  while ($index -lt $Lines.Count) {
    $line = $Lines[$index]

    if ([string]::IsNullOrWhiteSpace($line)) {
      if ($inList) {
        [void]$builder.AppendLine("</$listType>")
        $inList = $false
      }
      $index++
      continue
    }

    if ($line -eq '---') {
      if ($inList) {
        [void]$builder.AppendLine("</$listType>")
        $inList = $false
      }
      [void]$builder.AppendLine('<hr />')
      $index++
      continue
    }

    if ($line -match '^(#{1,3})\s+(.+)$') {
      if ($inList) {
        [void]$builder.AppendLine("</$listType>")
        $inList = $false
      }
      $level = $matches[1].Length
      $title = Convert-InlineMarkdown $matches[2]
      [void]$builder.AppendLine("<h$level>$title</h$level>")
      $index++
      continue
    }

    if ($line -match '^\|.*\|$' -and ($index + 1) -lt $Lines.Count -and $Lines[$index + 1] -match '^\|\s*:?-+') {
      if ($inList) {
        [void]$builder.AppendLine("</$listType>")
        $inList = $false
      }

      $rows = [System.Collections.Generic.List[object]]::new()
      while ($index -lt $Lines.Count -and $Lines[$index] -match '^\|.*\|$') {
        $cells = $Lines[$index].Trim('|').Split('|') | ForEach-Object { $_.Trim() }
        $rows.Add($cells)
        $index++
      }

      [void]$builder.AppendLine('<table>')
      [void]$builder.AppendLine('<thead><tr>')
      foreach ($cell in $rows[0]) {
        [void]$builder.AppendLine('<th>' + (Convert-InlineMarkdown $cell) + '</th>')
      }
      [void]$builder.AppendLine('</tr></thead><tbody>')

      for ($rowIndex = 2; $rowIndex -lt $rows.Count; $rowIndex++) {
        [void]$builder.AppendLine('<tr>')
        foreach ($cell in $rows[$rowIndex]) {
          [void]$builder.AppendLine('<td>' + (Convert-InlineMarkdown $cell) + '</td>')
        }
        [void]$builder.AppendLine('</tr>')
      }
      [void]$builder.AppendLine('</tbody></table>')
      continue
    }

    $currentListType = $null
    $listContent = $null
    if ($line -match '^\s*-\s+(.+)$') {
      $currentListType = 'ul'
      $listContent = $matches[1]
    } elseif ($line -match '^\s*\d+\.\s+(.+)$') {
      $currentListType = 'ol'
      $listContent = $matches[1]
    }

    if ($currentListType) {
      if (-not $inList -or $listType -ne $currentListType) {
        if ($inList) { [void]$builder.AppendLine("</$listType>") }
        $listType = $currentListType
        [void]$builder.AppendLine("<$listType>")
        $inList = $true
      }
      [void]$builder.AppendLine('<li>' + (Convert-InlineMarkdown $listContent) + '</li>')
      $index++
      continue
    }

    if ($inList) {
      [void]$builder.AppendLine("</$listType>")
      $inList = $false
    }

    $class = if ($line.StartsWith('**Regra:**') -or $line.StartsWith('**Aten')) { ' class="callout"' } else { '' }
    [void]$builder.AppendLine('<p' + $class + '>' + (Convert-InlineMarkdown $line) + '</p>')
    $index++
  }

  if ($inList) { [void]$builder.AppendLine("</$listType>") }
  return $builder.ToString()
}

$sourcePath = [System.IO.Path]::GetFullPath($Source)
$htmlPath = [System.IO.Path]::GetFullPath($HtmlOutput)
$docxPath = [System.IO.Path]::GetFullPath($DocxOutput)
$lines = [System.IO.File]::ReadAllLines($sourcePath, [System.Text.Encoding]::UTF8)

$body = Convert-MarkdownToHtml $lines
$body = $body -replace '(?s)^<h1>.*?</h1>\s*<p><strong>.*?13 de agosto de 2026</strong></p>', ''

$html = @"
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Hanaro &mdash; Design System</title>
<style>
  @page { size: A4; margin: 18mm 16mm 18mm 18mm; }
  * { box-sizing: border-box; }
  body { color: #1a1a1a; background: #ffffff; font-family: Aptos, Arial, sans-serif; font-size: 10.2pt; line-height: 1.42; }
  .cover { height: 228mm; page-break-after: always; padding: 21mm 17mm; background: #f4f2ee; border-top: 14pt solid #a50034; }
  .brand { color: #a50034; font-size: 14pt; font-weight: 800; letter-spacing: 1.6pt; text-transform: uppercase; }
  .cover h1 { margin: 58mm 0 4mm; color: #121217; font-size: 37pt; font-weight: 650; letter-spacing: -1.8pt; line-height: 1.04; }
  .cover .subtitle { width: 122mm; margin: 0; color: #666666; font-size: 16pt; line-height: 1.35; }
  .cover .meta { margin-top: 55mm; padding-top: 6mm; border-top: 1px solid #d5d0cb; color: #666666; font-size: 9pt; }
  .summary { page-break-after: always; padding: 8mm 5mm; }
  .summary h2 { margin-top: 0; }
  .summary-grid { width: 100%; border-collapse: separate; border-spacing: 4mm; }
  .summary-grid td { width: 50%; border: 1px solid #e5e0db; border-radius: 8pt; background: #fef0f3; padding: 7mm; vertical-align: top; }
  .summary-grid strong { display: block; color: #a50034; font-size: 17pt; }
  .summary-grid span { display: block; margin-top: 2mm; color: #666666; font-size: 9pt; }
  h1 { margin: 0 0 8mm; color: #121217; font-size: 25pt; line-height: 1.1; page-break-before: always; }
  h2 { margin: 10mm 0 3mm; padding-bottom: 2mm; border-bottom: 1.5pt solid #a50034; color: #121217; font-size: 17pt; line-height: 1.2; page-break-after: avoid; }
  h3 { margin: 7mm 0 2mm; color: #a50034; font-size: 12.5pt; line-height: 1.2; page-break-after: avoid; }
  p { margin: 0 0 3.2mm; }
  ul, ol { margin: 0 0 4mm 6mm; padding-left: 5mm; }
  li { margin-bottom: 1.4mm; }
  table { width: 100%; margin: 3mm 0 7mm; border-collapse: collapse; font-size: 8.4pt; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  th { border: 1px solid #d5d0cb; background: #a50034; color: #ffffff; padding: 2.3mm 2.5mm; font-weight: 700; text-align: left; }
  td { border: 1px solid #e5e0db; padding: 2.1mm 2.5mm; vertical-align: top; }
  tbody tr:nth-child(even) td { background: #f8f7f5; }
  code { color: #850029; background: #fce4ec; font-family: Consolas, monospace; font-size: 8.3pt; padding: 0.4mm 1mm; }
  .color-chip { display: inline-block; width: 10pt; height: 10pt; margin-right: 3pt; border: 0.5pt solid #d5d0cb; vertical-align: middle; }
  .callout { margin: 4mm 0 5mm; border-left: 4pt solid #a50034; background: #fef0f3; padding: 3.2mm 4mm; }
  hr { margin: 9mm 0 5mm; border: 0; border-top: 1px solid #e5e0db; }
  .footer-note { color: #888888; font-size: 8pt; }
</style>
</head>
<body>
  <section class="cover">
    <div class="brand">HANARO</div>
    <h1>Design<br />System</h1>
    <p class="subtitle">Fundamentos, tokens, componentes e padr&otilde;es de interface derivados do CSS atual do produto.</p>
    <div class="meta">Vers&atilde;o 1.0 &nbsp;&middot;&nbsp; 13 de agosto de 2026<br />Fonte de verdade: styles.css</div>
  </section>
  <section class="summary">
    <h2>Vis&atilde;o r&aacute;pida</h2>
    <table class="summary-grid">
      <tr><td><strong>2 temas</strong><span>Claro e escuro, estruturados por tokens sem&acirc;nticos.</span></td><td><strong>52 tokens</strong><span>Marca, superf&iacute;cies, texto, feedback, gr&aacute;ficos, sombras e foco.</span></td></tr>
      <tr><td><strong>5 breakpoints</strong><span>Adapta&ccedil;&atilde;o por altura e larguras de 1180, 900, 760 e 520px.</span></td><td><strong>320px</strong><span>Largura m&iacute;nima suportada pelo layout global.</span></td></tr>
    </table>
    <h3>Conte&uacute;do</h3>
    <ol>
      <li>Identidade e princ&iacute;pios</li><li>Tokens fundamentais</li><li>Estrutura e responsividade</li><li>Componentes</li><li>Estados de intera&ccedil;&atilde;o</li><li>Movimento</li><li>Acessibilidade</li><li>Regras de implementa&ccedil;&atilde;o</li><li>D&eacute;bito t&eacute;cnico recomendado</li>
    </ol>
    <p class="callout"><strong>Como usar:</strong> consulte primeiro os tokens e padr&otilde;es existentes; crie varia&ccedil;&otilde;es apenas quando o papel sem&acirc;ntico ou o comportamento realmente mudar.</p>
  </section>
  $body
</body>
</html>
"@

[System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($false))

$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($htmlPath, $false, $false, $false)

  try { $document.BuiltInDocumentProperties('Title').Value = 'Hanaro - Design System' } catch { }
  try { $document.BuiltInDocumentProperties('Subject').Value = 'Design system derivado do CSS do prototipo Hanaro' } catch { }
  try { $document.BuiltInDocumentProperties('Author').Value = 'Hanaro' } catch { }

  foreach ($section in $document.Sections) {
    $header = $section.Headers.Item(1).Range
    $header.Text = 'HANARO  /  DESIGN SYSTEM'
    $header.Font.Name = 'Aptos'
    $header.Font.Size = 8
    $header.Font.Color = 6710886

    $footer = $section.Footers.Item(1).Range
    $footer.Text = 'Hanaro / Design System  |  '
    $footer.Font.Name = 'Aptos'
    $footer.Font.Size = 8
    $footer.Font.Color = 8947848
    $footer.Collapse(0)
    [void]$footer.Fields.Add($footer, 33)
  }

  $document.SaveAs2($docxPath, 16)
} finally {
  if ($document) { $document.Close($false) }
  if ($word) { $word.Quit() }
  if ($document) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) }
  if ($word) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Output $docxPath
