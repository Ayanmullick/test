# Azure PowerShell to deploy Win11 Arm VM

<!--
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/atom-one-dark-reasonable.min.css">
<script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/powershell.min.js"></script>

<script>
  let fetchRes = fetch("https://dev.azure.com/ayn/PowerShell/_apis/git/repositories/4d348186-f42e-4ea5-9ed0-ec47530caee1/items?path=/AzVM.ps1&api-version=7.0")

  fetchRes.then(response => response.clone().text()).then(data => {const lines = data.split("\n");
    document.getElementById("code1").textContent = lines.slice(1, 4).join("\n");
    document.getElementById("code2").textContent = lines.slice(6, 13).join("\n");
    document.getElementById("code3").textContent = lines.slice(15, 23).join("\n");
    hljs.highlightElement(document.getElementById("code1"));
    hljs.highlightElement(document.getElementById("code2"));
    hljs.highlightElement(document.getElementById("code3"));
  })
</script>
-->

<script>
fetch("https://raw.githubusercontent.com/Ayanmullick/test/master/AutomationAcc/test1.ps1")
      .then(response => response.text())
      .then(data => document.getElementById('code').textContent = data)
</script>

<pre id="code"></pre>

I wanted to explore the benefits of [Azure ARM VMs that run on Arm-based processors][1]. They offer outstanding price-performance and power-efficiency for various workloads. In this snippet, I show how to deploy a [Generation 2][2] Windows 11 ARM virtual machine with basic [naming standard][11] and diagnostics using PowerShell cmdlets.

This stores the name in a variable, creates a resource group and parameterizes the location and Resource Group name for [splatting][3].


<a href="https://shell.azure.com/powershell" target="_blank">
   <img align="right" src="https://learn.microsoft.com/azure/cloud-shell/media/embed-cloud-shell/launch-cloud-shell-1.png" alt="Launch Cloud Shell">
</a>


<pre id="code1" class="powershell"></pre>


<img align="right" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9ki4cvu8jf2i1r0v9f7l.png" width="30%"  border="3"/>


This is the network configuration to create an NSG allowing remote desktop connections and a public IP address pointing to the [accelerated networking][4] enabled network card that the virtual machine would use. Add the IP where the RDP connection would come from.

<pre id="code2" class="powershell"></pre>

The virtual machine configuration specifies the name, [size][5], credentials, time zone, [image details][10], [update behavior][6] and [diagnostics configuration][7] of the VM. Add your password.

<pre id="code3" class="powershell"></pre>

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