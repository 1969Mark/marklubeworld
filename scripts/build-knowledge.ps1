# build-knowledge.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$linksDir = "D:\AntiGravity\marklubeworld\links"
$indexFile = "D:\AntiGravity\marklubeworld\index.html"
$outputFile = "D:\AntiGravity\marklubeworld\knowledge_base.json"

# Category map using a JSON source for encoding safety
$catJson = @'
{
  "lube_organic_chemistry":"general","compressor_maintenance":"general",
  "hydraulic_system":"general","gearbox_lubrication":"general",
  "refrigerant_lubricant":"general","organic":"general",
  "basic_viscosity":"general","baseoil_additives":"general",
  "testkit_xray":"general","cimac_usedoilanalysis":"general",
  "qands":"general","usedoil_pbi":"general",
  "biofuels":"marine","egrbp_deposit":"marine","lng_ash_control":"marine",
  "methanol_ethanol":"marine","microbial_degradation":"marine",
  "methanol_vs_lng":"marine","wingd_methanol":"marine",
  "lng_methanol_lubrication":"marine","lng_engine_wear":"marine",
  "sl2025_776":"marine","sl":"marine","bn":"marine",
  "sl2023_738":"marine","port_inspection":"marine",
  "dos":"marine","egr":"marine","bnperformance":"marine",
  "stern_tube":"equipment"
}
'@
$catMap = $catJson | ConvertFrom-Json

function Strip-Html([string]$html) {
    $t = $html -replace '(?s)<script.*?</script>', ''
    $t = $t -replace '(?s)<style.*?</style>', ''
    $t = $t -replace '(?s)<header.*?</header>', ''
    $t = $t -replace '(?s)<footer.*?</footer>', ''
    $t = $t -replace '(?s)<nav.*?</nav>', ''
    $t = $t -replace '<h[1-6][^>]*>(.*?)</h[1-6]>', "`n## `$1`n"
    $t = $t -replace '<li[^>]*>(.*?)</li>', "- `$1`n"
    $t = $t -replace '<br\s*/?>', "`n"
    $t = $t -replace '</p>', "`n"
    $t = $t -replace '</div>', "`n"
    $t = $t -replace '</tr>', "`n"
    $t = $t -replace '<td[^>]*>(.*?)</td>', '$1 | '
    $t = $t -replace '<th[^>]*>(.*?)</th>', '$1 | '
    $t = $t -replace '<figcaption[^>]*>(.*?)</figcaption>', '[fig: $1]'
    $t = $t -replace '<sub>(.*?)</sub>', '($1)'
    $t = $t -replace '<sup>(.*?)</sup>', '^$1'
    $t = $t -replace '<strong>(.*?)</strong>', '$1'
    $t = $t -replace '<em>(.*?)</em>', '$1'
    $t = $t -replace '<[^>]+>', ''
    $t = $t -replace '&amp;', '&'
    $t = $t -replace '&lt;', '<'
    $t = $t -replace '&gt;', '>'
    $t = $t -replace '&quot;', '"'
    $t = $t -replace '&#39;', "'"
    $t = $t -replace '&nbsp;', ' '
    $t = $t -replace '&copy;', '(c)'
    $t = $t -replace '[ \t]+', ' '
    $t = $t -replace '(\r?\n\s*){3,}', "`n`n"
    return $t.Trim()
}

$entries = [System.Collections.ArrayList]::new()

# Process index page
$indexHtml = [System.IO.File]::ReadAllText($indexFile, [System.Text.Encoding]::UTF8)
if ($indexHtml -match '(?s)<section id="about">(.*?)</section>') {
    $aboutText = Strip-Html $Matches[1]
    $null = $entries.Add([ordered]@{
        title = "About This Site"
        url = "/"
        category = "about"
        content = $aboutText
    })
    Write-Host "  [OK] index.html (about section)"
}

# Process all link pages
$htmlFiles = Get-ChildItem "$linksDir\*.html" | Sort-Object Name
foreach ($file in $htmlFiles) {
    $html = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $baseName = $file.BaseName

    # Extract title
    $title = "Unknown"
    if ($html -match '<title>(.*?)</title>') { $title = $Matches[1].Trim() }

    # Extract main content
    $mainHtml = $html
    if ($html -match '(?s)<main[^>]*>(.*?)</main>') { $mainHtml = $Matches[1] }

    $content = Strip-Html $mainHtml
    $cat = "other"
    $catProp = $catMap.PSObject.Properties | Where-Object { $_.Name -eq $baseName }
    if ($catProp) { $cat = $catProp.Value }

    $null = $entries.Add([ordered]@{
        title = $title
        url = "/links/$($file.Name)"
        category = $cat
        content = $content
    })
    Write-Host "  [OK] $($file.Name) -> $title"
}

# Write JSON with UTF-8 encoding
$jsonText = $entries | ConvertTo-Json -Depth 3 -Compress:$false
[System.IO.File]::WriteAllText($outputFile, $jsonText, (New-Object System.Text.UTF8Encoding $false))

$totalChars = ($entries | ForEach-Object { $_.content.Length } | Measure-Object -Sum).Sum
$fileSize = [math]::Round((Get-Item $outputFile).Length / 1024, 1)

Write-Host ""
Write-Host "Knowledge base built!"
Write-Host "  Articles: $($entries.Count)"
Write-Host "  Total chars: $totalChars"
Write-Host "  File size: ${fileSize} KB"
Write-Host "  Output: $outputFile"
