function Hello-World 
    {param( [ValidateSet('Green','Red','Blue')] $Color)	#Added parameter vith validateset to test intellisense
     Write-Host "Hello world!" -Foreground $Color
     }
