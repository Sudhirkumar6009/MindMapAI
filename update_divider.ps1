$filePath = "frontend/src/components/LandingPage.jsx"
$content = Get-Content $filePath -Raw

$searchPattern = '        {/\* Divider \*/}\s+<div className="w-32 h-1 m-10 border-t-2 border-emerald-600 mb-20 mx-auto" />'
$replaceText = '        {/* Divider */}
        <div className="relative py-12">
          <div className="absolute left-1/2 transform -translate-x-1/2 w-32 h-1 border-t-2 border-emerald-600" />
        </div>'

$newContent = $content -replace $searchPattern, $replaceText
Set-Content $filePath -Value $newContent

Write-Host "Divider positioning updated to absolute"
