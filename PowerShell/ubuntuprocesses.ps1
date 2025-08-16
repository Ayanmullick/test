$tz    = [TimeZoneInfo]::FindSystemTimeZoneById('America/Chicago')
$nowCT = [TimeZoneInfo]::ConvertTimeFromUtc([DateTime]::UtcNow,$tz)
$abbr  = $tz.IsDaylightSavingTime($nowCT) ? 'CDT' : 'CST'
$stamp = $nowCT.ToString('MMddyy:HHmmss') + " $abbr"

Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 20 ProcessName, Id, CPU, WS |
  ConvertTo-Html -As Table -Title 'Processes' -PreContent "<h1>Processes (Ubuntu runner)</h1><p>Updated $stamp</p>" |
  Set-Content site/ubuntuprocesses2.html -Encoding utf8
