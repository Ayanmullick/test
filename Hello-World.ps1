function Hello-World 
    {[CmdletBinding()]
     param( [ValidateSet('Green','Red','Blue')] $Color)	#Added parameter with validateset to test intellisense
     Write-Host "Hello world!" -Foreground $Color
     }
