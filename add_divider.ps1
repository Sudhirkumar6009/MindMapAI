$filePath = "frontend/src/components/LandingPage.jsx"
$content = Get-Content $filePath -Raw

$searchPattern = '(        </section>)\r?\n\r?\n(        {/\* Editor Features Section \*/})'
$replaceText = '        </section>

        {/* Divider */}
        <div className="w-32 h-1 m-10 border-t-2 border-emerald-600 mb-20 mx-auto" />

        {/* Editor Features Section */}'

$newContent = $content -replace $searchPattern, $replaceText
Set-Content $filePath -Value $newContent

Write-Host "Divider added successfully"
