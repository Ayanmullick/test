| PROTOCOL | PRIORITY | ACTION | NAME                  | PORT | DESTINATION                       | SOURCE                              |
| -------- | -------- | ------ | --------------------- | ---- | --------------------------------- | ----------------------------------- |
| TCP      | 100      | Allow  | Akamai                | 8543 | 10.191.98.128/27                  | <Current Akamai address space list> |
| Any      | 120      | Allow  | LB_Probe              | 8543 | 10.191.98.128/27                  | 168.63.129.16                       |
| Any      | 300      | Allow  | AllowRDP              | 3389 | Any                               | VirtualNetwork                      |
| TCP      | 1000     | Allow  | Allow_In_SQL_DT_ATnWT | 1433 | 10.191.98.192/27                  | 10.191.98.128/27,10.191.98.160/27   |
| TCP      | 1100     | Allow  | Allow_In_Https_WT_AT  | 443  | 10.191.98.160/27,10.191.98.128/27 | 10.191.98.128/27,10.191.98.160/27   |
| TCP      | 2000     | Allow  | Port_443              | 443  | VirtualNetwork                    | 204.115.121.0/24                    |