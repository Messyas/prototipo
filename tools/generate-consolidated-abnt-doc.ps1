param(
    [string]$SourceHtml = (Join-Path $PSScriptRoot '..\docs\RELATORIO_CONSOLIDADO_ADEQUACAO_PROTOTIPO_ABNT.html'),
    [string]$OutputDocx = (Join-Path $PSScriptRoot '..\docs\RELATORIO_CONSOLIDADO_ADEQUACAO_PROTOTIPO_ABNT.docx')
)

$ErrorActionPreference = 'Stop'

$sourcePath = [System.IO.Path]::GetFullPath($SourceHtml)
$outputPath = [System.IO.Path]::GetFullPath($OutputDocx)

if (-not (Test-Path -LiteralPath $sourcePath)) {
    throw "Arquivo-fonte não encontrado: $sourcePath"
}

$outputDirectory = Split-Path -Parent $outputPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$word = $null
$document = $null

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0

    $document = $word.Documents.Open($sourcePath)

    # Propriedades editoriais do documento.
    # Algumas instalações do Office localizam os nomes das propriedades internas.
    # Como são metadados opcionais, falhas aqui não devem impedir a geração do relatório.
    try { $document.BuiltInDocumentProperties.Item('Title').Value = 'Relatório consolidado de adequação do protótipo — HANARO Material Scrap / IF Cost' } catch { }
    try { $document.BuiltInDocumentProperties.Item('Subject').Value = 'Plano de adequação do protótipo navegável, fórmulas, telas, filtros, perfis e pendências' } catch { }
    try { $document.BuiltInDocumentProperties.Item('Author').Value = 'Equipe do projeto HANARO' } catch { }
    try { $document.BuiltInDocumentProperties.Item('Keywords').Value = 'IF Cost, Scrap, Dashboard, Protótipo, Plano de implementação' } catch { }

    # Constantes do Microsoft Word.
    $wdStyleNormal = -1
    $wdStyleHeading1 = -2
    $wdStyleHeading2 = -3
    $wdStyleHeading3 = -4
    $wdAlignParagraphRight = 2
    $wdAlignParagraphJustify = 3
    $wdLineSpaceSingle = 0
    $wdLineSpace1pt5 = 1
    $wdFieldPage = 33
    $wdFormatDocumentDefault = 16
    $wdPaperA4 = 7

    # Estilos tipográficos. Arial 12 é adotado como interpretação de "Arial padrão 2".
    $normal = $document.Styles.Item($wdStyleNormal)
    $normal.Font.Name = 'Arial'
    $normal.Font.Size = 12
    $normal.ParagraphFormat.Alignment = $wdAlignParagraphJustify
    $normal.ParagraphFormat.LineSpacingRule = $wdLineSpace1pt5
    $normal.ParagraphFormat.FirstLineIndent = $word.CentimetersToPoints(1.25)
    $normal.ParagraphFormat.SpaceBefore = 0
    $normal.ParagraphFormat.SpaceAfter = 0

    $heading1 = $document.Styles.Item($wdStyleHeading1)
    $heading1.Font.Name = 'Arial'
    $heading1.Font.Size = 12
    $heading1.Font.Bold = $true
    $heading1.ParagraphFormat.Alignment = 0
    $heading1.ParagraphFormat.LineSpacingRule = $wdLineSpace1pt5
    $heading1.ParagraphFormat.FirstLineIndent = 0
    $heading1.ParagraphFormat.SpaceBefore = 18
    $heading1.ParagraphFormat.SpaceAfter = 6
    $heading1.ParagraphFormat.KeepWithNext = $true

    $heading2 = $document.Styles.Item($wdStyleHeading2)
    $heading2.Font.Name = 'Arial'
    $heading2.Font.Size = 12
    $heading2.Font.Bold = $true
    $heading2.ParagraphFormat.Alignment = 0
    $heading2.ParagraphFormat.LineSpacingRule = $wdLineSpace1pt5
    $heading2.ParagraphFormat.FirstLineIndent = 0
    $heading2.ParagraphFormat.SpaceBefore = 12
    $heading2.ParagraphFormat.SpaceAfter = 6
    $heading2.ParagraphFormat.KeepWithNext = $true

    $heading3 = $document.Styles.Item($wdStyleHeading3)
    $heading3.Font.Name = 'Arial'
    $heading3.Font.Size = 12
    $heading3.Font.Bold = $true
    $heading3.ParagraphFormat.Alignment = 0
    $heading3.ParagraphFormat.LineSpacingRule = $wdLineSpace1pt5
    $heading3.ParagraphFormat.FirstLineIndent = 0
    $heading3.ParagraphFormat.SpaceBefore = 9
    $heading3.ParagraphFormat.SpaceAfter = 3
    $heading3.ParagraphFormat.KeepWithNext = $true

    # Configuração ABNT usual: A4; margens superior/esquerda de 3 cm e inferior/direita de 2 cm.
    foreach ($section in $document.Sections) {
        $section.PageSetup.PaperSize = $wdPaperA4
        $section.PageSetup.TopMargin = $word.CentimetersToPoints(3)
        $section.PageSetup.LeftMargin = $word.CentimetersToPoints(3)
        $section.PageSetup.BottomMargin = $word.CentimetersToPoints(2)
        $section.PageSetup.RightMargin = $word.CentimetersToPoints(2)
        $section.PageSetup.HeaderDistance = $word.CentimetersToPoints(1.5)
        $section.PageSetup.FooterDistance = $word.CentimetersToPoints(1.5)
        $section.PageSetup.DifferentFirstPageHeaderFooter = $true

        # Numeração no canto superior direito; a capa fica sem número visível.
        $primaryHeader = $section.Headers.Item(1).Range
        $primaryHeader.Text = ''
        $primaryHeader.Font.Name = 'Arial'
        $primaryHeader.Font.Size = 10
        $primaryHeader.ParagraphFormat.Alignment = $wdAlignParagraphRight
        [void]$primaryHeader.Fields.Add($primaryHeader, $wdFieldPage)

        $firstPageHeader = $section.Headers.Item(2).Range
        $firstPageHeader.Text = ''
    }

    # Tabelas: corpo compacto para preservar legibilidade e evitar quebras excessivas.
    foreach ($table in $document.Tables) {
        $table.Range.Font.Name = 'Arial'
        $table.Range.Font.Size = 10
        $table.Range.ParagraphFormat.LineSpacingRule = $wdLineSpaceSingle
        $table.Range.ParagraphFormat.FirstLineIndent = 0
        $table.Range.ParagraphFormat.SpaceAfter = 3
        if ($table.Rows.Count -gt 0) {
            $table.Rows.Item(1).Range.Font.Bold = $true
        }
    }

    # Substitui o marcador pelo sumário automático dos níveis 1 a 3.
    $tocRange = $document.Content
    $tocFind = $tocRange.Find
    $tocFind.ClearFormatting()
    $tocFind.Text = '[[SUMARIO_AUTOMATICO]]'
    if ($tocFind.Execute()) {
        $tocRange.Text = ''
        [void]$document.TablesOfContents.Add($tocRange, $true, 1, 3)
    }

    foreach ($toc in $document.TablesOfContents) {
        $toc.Range.Font.Name = 'Arial'
        $toc.Range.Font.Size = 12
        $toc.Range.ParagraphFormat.LineSpacingRule = $wdLineSpace1pt5
        $toc.Update()
    }

    $document.Fields.Update()
    $document.Repaginate()
    $document.SaveAs2($outputPath, $wdFormatDocumentDefault)
}
finally {
    if ($null -ne $document) {
        $document.Close($false)
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($document)
    }
    if ($null -ne $word) {
        $word.Quit()
        [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($word)
    }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}

Get-Item -LiteralPath $outputPath | Select-Object FullName, Length, LastWriteTime
