$swa = Get-AzStaticWebApp -ResourceGroupName AzSQL -Name AyanSwa

Import-Module Microsoft.Graph.Authentication -RequiredVersion 2.25.0 -PassThru
Connect-Entra -Scopes 'Application.ReadWrite.All','Directory.Read.All'



Import-Module Microsoft.Graph.Applications -RequiredVersion 2.25.0 -PassThru
Import-Module Microsoft.Entra.Applications -PassThru   
#$app = Get-EntraApplication -Filter "displayName eq 'AyanSwa'"

# 1. Create the app registration.  # change to AzureADMultipleOrgs if you want multi-tenant
$app = New-EntraApplication -DisplayName $swa.Name -SignInAudience 'AzureADMyOrg' -IdentifierUris @()  # leave empty unless you need it for APIs

# 2. Add the Static Web App redirect URI (type Web)
$redirectUri = "https://$($swa.DefaultHostname)/.auth/login/aad/callback"
$LogoutUrl = "https://$($swa.DefaultHostname)/.auth/logout"

$webConfig = New-Object Microsoft.Open.MSGraph.Model.WebApplication -Property @{
    RedirectUris = $redirectUri
    LogoutUrl    = $logoutUrl
}
Set-EntraApplication -ApplicationId $app.Id -Web $webConfig


# 4. Create a service principal so the app shows up in Enterprise Apps
$sp = New-EntraServicePrincipal -AppId $app.AppId

# 5. Generate a client secret; stash the value securely right away
$secret = New-EntraServicePrincipalPasswordCredential -ServicePrincipalId $sp.Id -DisplayName "StaticWebAppSecret" -StartDate (Get-Date) -EndDate (Get-Date).AddYears(2)

Import-Module Microsoft.Graph.Identity.DirectoryManagement -RequiredVersion 2.25.0 -PassThru

Write-Host "App registration created."
Write-Host "Client ID     :" $app.AppId
Write-Host "Tenant ID     :" (Get-EntraTenantDetail).Id
Write-Host "Client Secret :" $secret.SecretText
Write-Host "Redirect URI  :" $redirectUri
