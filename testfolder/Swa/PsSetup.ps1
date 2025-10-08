$swa = Get-AzStaticWebApp -ResourceGroupName AzSQL -Name AyanSwa

# Variables you should adjust
#$displayName   = $swa.Name    #"Contoso Static Web App AAD"
#$swaHostname   = $swa.DefaultHostname   #"wonderful-sand-0123456789.azurestaticapps.net"
#$tenantScope   = "AzureADMyOrg"   # change to AzureADMultipleOrgs if you want multi-tenant
#$secretExpiry  = (Get-Date).AddYears(1)

# Connect with sufficient rights (Application.ReadWrite.All + Directory.Read.All)
#Connect-Entra -Scopes @('Application.ReadWrite.All','Directory.Read.All')

Connect-Entra -Scopes 'Application.ReadWrite.All','Directory.Read.All'


# 1. Create the app registration
$app = New-EntraApplication -DisplayName $swa.Name -SignInAudience 'AzureADMyOrg' -IdentifierUris @()  # leave empty unless you need it for APIs

# 2. Add the Static Web App redirect URI (type Web)
$redirectUri = "https://$($swa.DefaultHostname)/.auth/login/aad/callback"
$LogoutUrl = "https://$($swa.DefaultHostname)/.auth/logout"
Add-EntraApplicationRedirectUri -AppId $app.AppId -RedirectUri $redirectUri -RedirectUriType Web -LogoutUrl $LogoutUrl


# Build the web settings object the cmdlet expects
$webConfig = [Microsoft.Graph.PowerShell.Models.IMicrosoftGraphWebApplication]@{
    RedirectUris = @($redirectUri)
    LogoutUrl    = $logoutUrl   # optional
}

Update-EntraApplication -AppId $app.AppId -Web $webConfig




# 3. (Optional but typical) configure logout URL to SWA sign-out endpoint
#Update-EntraApplication -AppId $app.AppId -LogoutUrl "https://$($swa.DefaultHostname)/.auth/logout"

# 4. Create a service principal so the app shows up in Enterprise Apps
$sp = New-EntraServicePrincipal -AppId $app.AppId

# 5. Generate a client secret; stash the value securely right away
#$secret = Add-EntraApplicationPassword -AppId $app.AppId -DisplayName "StaticWebAppSecret" -EndDateTime  $secretExpiry
$secret = New-EntraServicePrincipalPasswordCredential -ServicePrincipalId $sp.Id -DisplayName "StaticWebAppSecret" -StartDate (Get-Date) -EndDate (Get-Date).AddYears(2)

Write-Host "App registration created."
Write-Host "Client ID     :" $app.AppId
Write-Host "Tenant ID     :" (Get-EntraTenant).Id
Write-Host "Client Secret :" $secret.SecretText
Write-Host "Redirect URI  :" $redirectUri
