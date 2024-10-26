2024-10-24T01:52:46.5968081Z Current runner version: '2.320.0'
2024-10-24T01:52:46.5990380Z ##[group]Operating System
2024-10-24T01:52:46.5991022Z Ubuntu
2024-10-24T01:52:46.5991485Z 22.04.5
2024-10-24T01:52:46.5991843Z LTS
2024-10-24T01:52:46.5992141Z ##[endgroup]
2024-10-24T01:52:46.5992593Z ##[group]Runner Image
2024-10-24T01:52:46.5993041Z Image: ubuntu-22.04
2024-10-24T01:52:46.5993502Z Version: 20241015.1.0
2024-10-24T01:52:46.5994451Z Included Software: https://github.com/actions/runner-images/blob/ubuntu22/20241015.1/images/ubuntu/Ubuntu2204-Readme.md
2024-10-24T01:52:46.5995897Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu22%2F20241015.1
2024-10-24T01:52:46.5996816Z ##[endgroup]
2024-10-24T01:52:46.5997229Z ##[group]Runner Image Provisioner
2024-10-24T01:52:46.5997712Z 2.0.384.1
2024-10-24T01:52:46.5998081Z ##[endgroup]
2024-10-24T01:52:46.6013929Z ##[group]GITHUB_TOKEN Permissions
2024-10-24T01:52:46.6015587Z Actions: write
2024-10-24T01:52:46.6016299Z Attestations: write
2024-10-24T01:52:46.6016787Z Checks: write
2024-10-24T01:52:46.6017126Z Contents: write
2024-10-24T01:52:46.6017627Z Deployments: write
2024-10-24T01:52:46.6018007Z Discussions: write
2024-10-24T01:52:46.6018414Z Issues: write
2024-10-24T01:52:46.6018850Z Metadata: read
2024-10-24T01:52:46.6019224Z Packages: write
2024-10-24T01:52:46.6019583Z Pages: write
2024-10-24T01:52:46.6020039Z PullRequests: write
2024-10-24T01:52:46.6020463Z RepositoryProjects: write
2024-10-24T01:52:46.6021012Z SecurityEvents: write
2024-10-24T01:52:46.6021426Z Statuses: write
2024-10-24T01:52:46.6021787Z ##[endgroup]
2024-10-24T01:52:46.6023848Z Secret source: Actions
2024-10-24T01:52:46.6024431Z Prepare workflow directory
2024-10-24T01:52:46.6632670Z Prepare all required actions
2024-10-24T01:52:46.6789158Z Getting action download info
2024-10-24T01:52:46.8537236Z Download action repository 'actions/checkout@v4' (SHA:11bd71901bbe5b1630ceea73d27597364c9af683)
2024-10-24T01:52:47.1562296Z Download action repository 'azure/login@v2' (SHA:a65d910e8af852a8061c627c456678983e180302)
2024-10-24T01:52:47.3170750Z Download action repository 'azure/powershell@v2' (SHA:53dd145408794f7e80f97cfcca04155c85234709)
2024-10-24T01:52:48.8318794Z Complete job name: Resources
2024-10-24T01:52:48.9199593Z ##[group]Run actions/checkout@v4
2024-10-24T01:52:48.9200066Z with:
2024-10-24T01:52:48.9200349Z   repository: Ayanmullick/AzIaaS
2024-10-24T01:52:48.9200990Z   token: ***
2024-10-24T01:52:48.9201332Z   ssh-strict: true
2024-10-24T01:52:48.9201734Z   ssh-user: git
2024-10-24T01:52:48.9202059Z   persist-credentials: true
2024-10-24T01:52:48.9202398Z   clean: true
2024-10-24T01:52:48.9202778Z   sparse-checkout-cone-mode: true
2024-10-24T01:52:48.9203152Z   fetch-depth: 1
2024-10-24T01:52:48.9203469Z   fetch-tags: false
2024-10-24T01:52:48.9203823Z   show-progress: true
2024-10-24T01:52:48.9204157Z   lfs: false
2024-10-24T01:52:48.9204459Z   submodules: false
2024-10-24T01:52:48.9204835Z   set-safe-directory: true
2024-10-24T01:52:48.9205160Z ##[endgroup]
2024-10-24T01:52:49.1881841Z Syncing repository: Ayanmullick/AzIaaS
2024-10-24T01:52:49.1883666Z ##[group]Getting Git version info
2024-10-24T01:52:49.1884341Z Working directory is '/home/runner/work/AzIaaS/AzIaaS'
2024-10-24T01:52:49.1885405Z [command]/usr/bin/git version
2024-10-24T01:52:49.1925363Z git version 2.47.0
2024-10-24T01:52:49.1951544Z ##[endgroup]
2024-10-24T01:52:49.1971336Z Temporarily overriding HOME='/home/runner/work/_temp/32598c9c-6a58-40cd-8b09-082b9d40cc6c' before making global git config changes
2024-10-24T01:52:49.1973172Z Adding repository directory to the temporary git global config as a safe directory
2024-10-24T01:52:49.1983669Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/AzIaaS/AzIaaS
2024-10-24T01:52:49.2020936Z Deleting the contents of '/home/runner/work/AzIaaS/AzIaaS'
2024-10-24T01:52:49.2024743Z ##[group]Initializing the repository
2024-10-24T01:52:49.2029242Z [command]/usr/bin/git init /home/runner/work/AzIaaS/AzIaaS
2024-10-24T01:52:49.2143873Z hint: Using 'master' as the name for the initial branch. This default branch name
2024-10-24T01:52:49.2145606Z hint: is subject to change. To configure the initial branch name to use in all
2024-10-24T01:52:49.2148495Z hint: of your new repositories, which will suppress this warning, call:
2024-10-24T01:52:49.2149685Z hint:
2024-10-24T01:52:49.2150472Z hint: 	git config --global init.defaultBranch <name>
2024-10-24T01:52:49.2151404Z hint:
2024-10-24T01:52:49.2152559Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2024-10-24T01:52:49.2157362Z hint: 'development'. The just-created branch can be renamed via this command:
2024-10-24T01:52:49.2160478Z hint:
2024-10-24T01:52:49.2161271Z hint: 	git branch -m <name>
2024-10-24T01:52:49.2162233Z Initialized empty Git repository in /home/runner/work/AzIaaS/AzIaaS/.git/
2024-10-24T01:52:49.2170234Z [command]/usr/bin/git remote add origin https://github.com/Ayanmullick/AzIaaS
2024-10-24T01:52:49.2208167Z ##[endgroup]
2024-10-24T01:52:49.2209564Z ##[group]Disabling automatic garbage collection
2024-10-24T01:52:49.2213945Z [command]/usr/bin/git config --local gc.auto 0
2024-10-24T01:52:49.2243991Z ##[endgroup]
2024-10-24T01:52:49.2245096Z ##[group]Setting up auth
2024-10-24T01:52:49.2252136Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2024-10-24T01:52:49.2284629Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2024-10-24T01:52:49.2628020Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2024-10-24T01:52:49.2660645Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2024-10-24T01:52:49.2890689Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2024-10-24T01:52:49.2937026Z ##[endgroup]
2024-10-24T01:52:49.2938080Z ##[group]Fetching the repository
2024-10-24T01:52:49.2946949Z [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune --no-recurse-submodules --depth=1 origin +28cff9810da768699f2d1073c045669d860b853c:refs/remotes/origin/main
2024-10-24T01:52:49.4983883Z From https://github.com/Ayanmullick/AzIaaS
2024-10-24T01:52:49.4985210Z  * [new ref]         28cff9810da768699f2d1073c045669d860b853c -> origin/main
2024-10-24T01:52:49.5016964Z ##[endgroup]
2024-10-24T01:52:49.5017989Z ##[group]Determining the checkout info
2024-10-24T01:52:49.5022731Z ##[endgroup]
2024-10-24T01:52:49.5024787Z [command]/usr/bin/git sparse-checkout disable
2024-10-24T01:52:49.5064402Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2024-10-24T01:52:49.5092010Z ##[group]Checking out the ref
2024-10-24T01:52:49.5095503Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2024-10-24T01:52:49.5168247Z Switched to a new branch 'main'
2024-10-24T01:52:49.5174906Z branch 'main' set up to track 'origin/main'.
2024-10-24T01:52:49.5179784Z ##[endgroup]
2024-10-24T01:52:49.5215749Z [command]/usr/bin/git log -1 --format=%H
2024-10-24T01:52:49.5239502Z 28cff9810da768699f2d1073c045669d860b853c
2024-10-24T01:52:49.5611024Z ##[group]Run azure/login@v2
2024-10-24T01:52:49.5611799Z with:
2024-10-24T01:52:49.5613945Z   creds: ***
2024-10-24T01:52:49.5614692Z   enable-AzPSSession: true
2024-10-24T01:52:49.5615424Z   environment: azurecloud
2024-10-24T01:52:49.5616010Z   allow-no-subscriptions: false
2024-10-24T01:52:49.5616757Z   audience: api://AzureADTokenExchange
2024-10-24T01:52:49.5617202Z   auth-type: SERVICE_PRINCIPAL
2024-10-24T01:52:49.5617650Z ##[endgroup]
2024-10-24T01:52:49.5999306Z Running Azure CLI Login.
2024-10-24T01:52:53.2917324Z [command]/usr/bin/az cloud set -n azurecloud
2024-10-24T01:52:53.5068255Z Done setting cloud: "azurecloud"
2024-10-24T01:52:53.5071406Z Note: Azure/login action also supports OIDC login mechanism. Refer https://github.com/azure/login#configure-a-service-principal-with-a-federated-credential-to-use-oidc-based-authentication for more details.
2024-10-24T01:52:53.5074811Z Attempting Azure CLI login by using service principal with secret...
2024-10-24T01:52:54.4983241Z Subscription is set successfully.
2024-10-24T01:52:54.4984286Z Azure CLI login succeeds by using service principal with secret.
2024-10-24T01:52:54.4985520Z Running Azure PowerShell Login.
2024-10-24T01:53:01.2042341Z {
2024-10-24T01:53:01.2042885Z   Success: true,
2024-10-24T01:53:01.2043831Z   Result: '/usr/share/az_12.1.0/Az.Accounts/3.0.4/Az.Accounts.psd1'
2024-10-24T01:53:01.2044661Z }
2024-10-24T01:53:01.2048020Z Attempting Azure PowerShell login by using service principal with secret...
2024-10-24T01:53:15.5602970Z { Success: true, Result: '' }
2024-10-24T01:53:15.5603951Z Running Azure PowerShell Login successfully.
2024-10-24T01:53:15.5689466Z ##[group]Run azure/powershell@v2
2024-10-24T01:53:15.5689832Z with:
2024-10-24T01:53:15.5690123Z   inlineScript: ./GHActionTest/FuncVar.ps1
2024-10-24T01:53:15.5690490Z   azPSVersion: latest
2024-10-24T01:53:15.5690831Z   errorActionPreference: Stop
2024-10-24T01:53:15.5691169Z   failOnStandardError: false
2024-10-24T01:53:15.5691699Z   githubToken: ***
2024-10-24T01:53:15.5691960Z ##[endgroup]
2024-10-24T01:53:15.6281842Z Validating inputs
2024-10-24T01:53:15.6303769Z Module Az latest installed from hostedAgentFolder
2024-10-24T01:53:15.6304441Z Initializing Az Module
2024-10-24T01:53:15.6343346Z [command]/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive -Command Test-Path (Join-Path /usr/share az_*)
2024-10-24T01:53:15.6380022Z [command]/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive -Command $env:PSModulePath
2024-10-24T01:53:15.8931162Z /home/runner/.local/share/powershell/Modules:/usr/local/share/powershell/Modules:/opt/microsoft/powershell/7/Modules
2024-10-24T01:53:15.9586391Z [command]/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive -Command try {
2024-10-24T01:53:15.9587632Z             $ErrorActionPreference = "Stop"
2024-10-24T01:53:15.9588644Z             $WarningPreference = "SilentlyContinue"
2024-10-24T01:53:15.9589328Z             $output = @{}
2024-10-24T01:53:15.9590478Z             $data = Get-Module -Name Az -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1
2024-10-24T01:53:15.9592035Z             $output['AzVersion'] = $data.Version.ToString()
2024-10-24T01:53:15.9592807Z             $output['Success'] = "true"
2024-10-24T01:53:15.9593366Z         }
2024-10-24T01:53:15.9593759Z         catch {
2024-10-24T01:53:15.9594348Z             $output['Error'] = $_.exception.Message
2024-10-24T01:53:15.9594938Z         }
2024-10-24T01:53:15.9595397Z         return ConvertTo-Json $output
2024-10-24T01:53:15.9635095Z True
2024-10-24T01:53:17.4586941Z {
2024-10-24T01:53:17.4587443Z   "AzVersion": "12.1.0",
2024-10-24T01:53:17.4587999Z   "Success": "true"
2024-10-24T01:53:17.4588410Z }
2024-10-24T01:53:17.5268559Z [command]/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive -Command $env:PSModulePath
2024-10-24T01:53:17.7231489Z /usr/share:/home/runner/.local/share/powershell/Modules:/usr/local/share/powershell/Modules:/opt/microsoft/powershell/7/Modules
2024-10-24T01:53:17.7731904Z Initializing Az Module Complete
2024-10-24T01:53:17.7732548Z Running Az PowerShell Script
2024-10-24T01:53:17.7746097Z [command]/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive -Command /home/runner/work/_temp/21e26c36-eb24-4a22-a58e-d62d8caf995b.ps1
2024-10-24T01:53:25.4795866Z [33;1mWARNING: You're using Az version 12.1.0. The latest version of Az is 12.4.0. Upgrade your Az modules using the following commands:
2024-10-24T01:53:25.4797966Z   Update-PSResource Az -WhatIf    -- Simulate updating your Az modules.
2024-10-24T01:53:25.4799175Z   Update-PSResource Az            -- Update your Az modules.[0m
2024-10-24T01:53:25.6212170Z Script execution Complete
2024-10-24T01:53:25.6324109Z ##[group]Run $env:RG_NAME | ConvertFrom-Json
2024-10-24T01:53:25.6324613Z [36;1m$env:RG_NAME | ConvertFrom-Json[0m
2024-10-24T01:53:25.6393241Z shell: /usr/bin/pwsh -command ". '{0}'"
2024-10-24T01:53:25.6393614Z env:
2024-10-24T01:53:25.6393846Z   AZURE_HTTP_USER_AGENT: 
2024-10-24T01:53:25.6394146Z   AZUREPS_HOST_ENVIRONMENT: 
2024-10-24T01:53:25.6395282Z   RG_NAME: {"ResourceGroupName":"GitHubAction24","Location":"northcentralus","ProvisioningState":"Succeeded","Tags":{},"TagsTable":null,"ResourceId":"/subscriptions/8b77f191-3d4a-498e-8bb1-9e1fbb927ea7/resourceGroups/GitHubAction24","ManagedBy":null}
2024-10-24T01:53:25.6396457Z ##[endgroup]
2024-10-24T01:53:25.9235925Z 
2024-10-24T01:53:25.9240980Z [32;1mResourceGroupName : [0mGitHubAction24
2024-10-24T01:53:25.9242057Z [32;1mLocation          : [0mnorthcentralus
2024-10-24T01:53:25.9242947Z [32;1mProvisioningState : [0mSucceeded
2024-10-24T01:53:25.9243729Z [32;1mTags              : [0m
2024-10-24T01:53:25.9244496Z [32;1mTagsTable         : [0m
2024-10-24T01:53:25.9245665Z [32;1mResourceId        : [0m/subscriptions/8b77f191-3d4a-498e-8bb1-9e1fbb927ea7/resourc
2024-10-24T01:53:25.9246756Z                     eGroups/GitHubAction24
2024-10-24T01:53:25.9247250Z [32;1mManagedBy         : [0m
2024-10-24T01:53:25.9247465Z 
2024-10-24T01:53:26.0475500Z Post job cleanup.
2024-10-24T01:53:26.0864998Z Clearing azure cli accounts from the local cache.
2024-10-24T01:53:26.0873965Z [command]/usr/bin/az account clear
2024-10-24T01:53:28.0423381Z {
2024-10-24T01:53:28.0423931Z   Success: true,
2024-10-24T01:53:28.0424979Z   Result: '/usr/share/az_12.1.0/Az.Accounts/3.0.4/Az.Accounts.psd1'
2024-10-24T01:53:28.0425725Z }
2024-10-24T01:53:28.0426632Z Clearing azure powershell accounts from the local cache.
2024-10-24T01:53:28.0429875Z [command]/usr/bin/pwsh -Command Clear-AzContext -Scope Process
2024-10-24T01:53:29.6695881Z [command]/usr/bin/pwsh -Command Clear-AzContext -Scope CurrentUser -Force -ErrorAction SilentlyContinue
2024-10-24T01:53:31.3601989Z Post job cleanup.
2024-10-24T01:53:31.4565456Z [command]/usr/bin/git version
2024-10-24T01:53:31.4603052Z git version 2.47.0
2024-10-24T01:53:31.4645119Z Temporarily overriding HOME='/home/runner/work/_temp/7283fd6c-dcec-4431-a352-c00d4f292afd' before making global git config changes
2024-10-24T01:53:31.4646168Z Adding repository directory to the temporary git global config as a safe directory
2024-10-24T01:53:31.4651001Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/AzIaaS/AzIaaS
2024-10-24T01:53:31.4688618Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2024-10-24T01:53:31.4721341Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2024-10-24T01:53:31.4963400Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2024-10-24T01:53:31.4986162Z http.https://github.com/.extraheader
2024-10-24T01:53:31.4998499Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2024-10-24T01:53:31.5032627Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2024-10-24T01:53:31.5487659Z Cleaning up orphan processes
