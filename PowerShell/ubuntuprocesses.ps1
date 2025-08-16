$null = New-Item -Path site -ItemType Directory -Force

$stamp = '{0:MMddyy:HHmmss} {1}' -f ($nowCT=Get-Date -TimeZone ($tz=Get-TimeZone -Id 'America/Chicago').Id), ($tz.IsDaylightSavingTime($nowCT)?'CDT':'CST')

Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 20 ProcessName, Id, CPU, @{N = 'WS(MB)'; E = {[math]::Round($_.WorkingSet64/1MB, 2)}} |
  ConvertTo-Html -As Table -Title 'Processes' -PreContent "<h1>Processes (Ubuntu runner)</h1><p>Updated $stamp</p>" |
  Set-Content site/ubuntuprocesses2.html -Encoding utf8
