$stamp = '{0:MMddyy:HHmmss} {1}' -f ($ct=[TimeZoneInfo]::ConvertTimeFromUtc((Get-Date).ToUniversalTime(),$tz=[TimeZoneInfo]::FindSystemTimeZoneById('America/Chicago'))),($tz.IsDaylightSavingTime($ct)?'CDT':'CST')

$null = New-Item -Path site -ItemType Directory -Force

Get-Process |
  Sort-Object -Property WorkingSet64 -Descending |
  Select-Object -First 20 ProcessName, Id, CPU,
    @{Name = 'WS(MB)'; Expression = {[math]::Round($_.WorkingSet64/1MB, 2)}} |
  ConvertTo-Html -As Table -Title 'Processes' -PreContent "<h1>Processes (Ubuntu runner)</h1><p>Updated $stamp</p>" |
  Set-Content site/ubuntuprocesses2.html -Encoding utf8
