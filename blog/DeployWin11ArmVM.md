<style>details summary {font-size: large; font-weight: 500;text-decoration: underline;}</style>

# Azure PowerShell to deploy Win11 Arm VM

I wanted to explore the benefits of [Azure ARM VMs that run on Arm-based processors][1]. They offer outstanding price-performance and power-efficiency for various workloads. In this snippet, I show how to deploy a [Generation 2][2] Windows 11 ARM virtual machine with basic [naming standard][11] and diagnostics using PowerShell cmdlets.

<a href="https://shell.azure.com/powershell" target="_blank">
   <img align="right" src="https://learn.microsoft.com/azure/cloud-shell/media/embed-cloud-shell/launch-cloud-shell-1.png" alt="Launch Cloud Shell">
</a>
<br><br>

<img align="right" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9ki4cvu8jf2i1r0v9f7l.png" width="30%"  border="3"/>

This stores the name in a variable, creates a resource group and parameterizes the location and Resource Group name for [splatting][3].

<details open>
  <summary><u>Variables</u></summary>

```powershell
$Location= 'NorthCentralUS'
$Name    = 'Win11ARM'
$RG      = New-AzResourceGroup -Location $Location -Name ($Name+'RG')
$Params  = @{ResourceGroupName  = $RG.ResourceGroupName; Location = $Location; Verbose=$true}
```
</details>

This is the network configuration to create an NSG allowing remote desktop connections and a public IP address pointing to the [accelerated networking][4] enabled network card that the virtual machine would use. Add the IP where the RDP connection would come from.

<details open>
  <summary><u>Network configuration</u></summary>

```powershell
$RDParams= @{Name= "$Name'RDPRule'"; Description= 'Allow RDP'; Access= 'Allow'; Protocol= 'Tcp'; Direction= 'Inbound'; SourcePortRange= '*'; DestinationPortRange= '3389'}
$RDPRule = New-AzNetworkSecurityRuleConfig @RDPParams  -Priority 200 -SourceAddressPrefix <YourIP> -DestinationAddressPrefix VirtualNetwork
$NSG     = New-AzNetworkSecurityGroup @Params -Name $Name'NSG' -SecurityRules $RDPRule
$Subnet  = New-AzVirtualNetworkSubnetConfig -Name Default -AddressPrefix 192.168.0.0/29 -NetworkSecurityGroup $NSG
$Vnet    = New-AzVirtualNetwork @Params -Name $Name'VN' -AddressPrefix 192.168.0.0/28 -Subnet $Subnet
$PIP     = New-AzPublicIpAddress @Params -Name $Name'PIP' -AllocationMethod Dynamic -Sku Basic -DomainNameLabel $Name.ToLower()
$NIC     = New-AzNetworkInterface @Params -Name $Name'NIC' -SubnetId $Vnet.Subnets[0].Id -PublicIpAddressId $PIP.Id -EnableAcceleratedNetworking
```

</details>

The virtual machine configuration specifies the name, [size][5], credentials, time zone, [image details][10], [update behavior][6] and [diagnostics configuration][7] of the VM. Add your password.

<details open>
  <summary><u>Virtual Machine Configuration</u></summary>

```powershell
$cred    = New-Object System.Management.Automation.PSCredential "admin",$(ConvertTo-SecureString '<YourPassword>' -asplaintext -force)
$vmConfig= New-AzVMConfig -VMName $Name'VM' -VMSize Standard_E4ps_v5 -LicenseType Windows_Client|
            Set-AzVMOperatingSystem -Windows -ComputerName $Name'VM' -Credential $cred -TimeZone 'Central Standard Time' -ProvisionVMAgent -EnableAutoUpdate|
            Set-AzVMSourceImage -PublisherName MicrosoftWindowsDesktop -Offer windows11preview-arm64 -Skus win11-22h2-ent  -Version latest|
            Set-AzVMOSDisk -Name $Name'D' -Caching ReadWrite -CreateOption FromImage|
            Add-AzVMNetworkInterface -Id $NIC.Id|Set-AzVMBootDiagnostic -ResourceGroupName $RG.ResourceGroupName -Enable
```

</details>


```powershell
New-AzVM @Params -VM $vmConfig  #Deploys the VM
```

**Output**

```
RequestId IsSuccessStatusCode StatusCode ReasonPhrase
--------- ------------------- ---------- ------------
                         True         OK OK
```

The Windows ARM image is still in preview and doesn't support [Trusted Launch][8] or [Secure Boot][9] yet and it's for validation purposes only.

[1]:  <https://azure.microsoft.com/en-us/blog/azure-virtual-machines-with-ampere-altra-arm-based-processors-generally-available/>
[2]:  <https://learn.microsoft.com/en-us/azure/virtual-machines/generation-2#features-and-capabilities>
[3]:  <https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting>
[4]:  <https://learn.microsoft.com/en-us/azure/virtual-network/accelerated-networking-overview>
[5]:  <https://learn.microsoft.com/en-us/azure/virtual-machines/epsv5-epdsv5-series>
[6]:  <https://learn.microsoft.com/en-us/azure/virtual-machines/automatic-vm-guest-patching#azure-powershell-when-creating-a-windows-vm>
[7]:  <https://learn.microsoft.com/en-us/troubleshoot/azure/virtual-machines/boot-diagnostics>
[8]:  <https://learn.microsoft.com/en-us/azure/virtual-machines/trusted-launch>
[9]:  <https://learn.microsoft.com/en-us/azure/security/fundamentals/secure-boot>
[10]: <https://azuremarketplace.microsoft.com/en-us/marketplace/apps/microsoftwindowsdesktop.windows11preview-arm64>
[11]: <https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming>